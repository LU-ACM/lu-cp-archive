"use server";

import { prisma } from "@/lib/prisma";
import { type GeneratedLeaderboard } from "@/utils/schema/generated-leaderboard";
import { monthlyLeaderboardDataSchema } from "@/utils/schema/leaderboard";
import axios, { isAxiosError } from "axios";
import { getMonth, getYear } from "date-fns";
import { z } from "zod";

async function checkCodeforcesStatus() {
  try {
    const response = await axios.get(
      "https://codeforces.com/api/user.status?handle=Fefer_Ivan&from=1&count=1"
    );

    // If no user CF throws 400 but just to be safe
    if (response.data.status !== "OK") {
      return { error: "Codeforces server is down" };
    }
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating user profile:", error);
    if (isAxiosError(error)) {
      if (
        error.response?.status === 400 ||
        error.response?.data?.status === "FAILED"
      ) {
        return {
          error: "Codeforces server is down",
        };
      }
    }
    return { error: "Failed to update profile" };
  }
}

async function getUsersCFhandle() {
  try {
    const users = await prisma.users.findMany({
      where: {
        show_on_leaderboard: true,
      },
      select: {
        id: true,
        cf_handle: true,
        name: true,
        user_name: true,
      },
    });

    // No need - just to be safe and satisfy TS
    const filteredUsers = users.filter(
      (
        user
      ): user is {
        id: string;
        name: string;
        user_name: string;
        cf_handle: string;
      } => user.cf_handle !== null
    );

    return { success: true, data: filteredUsers };
  } catch (error) {
    console.error("Error getting users:", error);
    return { error: "Failed to fetch users" };
  }
}

async function publishGeneratedLeaderboard(
  leaderboardData: GeneratedLeaderboard[],
  date: Date
) {
  try {
    const month = getMonth(date) + 1; // getMonth is 0-indexed
    const year = getYear(date);

    const existing = await prisma.leaderboards.findFirst({
      where: { month, year },
    });

    if (existing) {
      return { error: "Leaderboard for this month already exists." };
    }

    const dataToInsert = leaderboardData.map((entry) => ({
      user_id: entry.user.id,
      month,
      year,
      generated_points: entry.generated_point,
      additional_points: entry.additional_points,
      total_points: entry.total_points,
      rank: entry.rank,
    }));

    await prisma.$transaction(async (tx) => {
      await tx.leaderboards.createMany({ data: dataToInsert });
      await tx.monthly_leaderboard.deleteMany();
      await tx.monthly_leaderboard.createMany({ data: dataToInsert });
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving leaderboard:", error);
    return { error: "Failed to save leaderboard" };
  }
}

/**
 * 1. Fetch every user that already exists in the leaderboard table
 * 2. Merge their old values with the incoming leaderboardData
 * 3. Re-rank everybody by total_points DESC
 * 4. Delete *only* the rows for the target month/year
 * 5. Insert the merged + ranked rows back into leaderboards
 * 6. Refresh the monthly_leaderboard snapshot
 */

type UserLeaderboardInfo = {
  user_id: string;
  generated_points: number;
  additional_points: number;
  total_points: number;
};

async function updateLeaderboard(leaderboardData: GeneratedLeaderboard[]) {
  try {
    // 1. decide which month/year we are writing
    const latest = await prisma.leaderboards.findFirst({
      select: { month: true, year: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const now = new Date();
    const targetMonth = latest ? latest.month : now.getMonth() + 1;
    const targetYear = latest ? latest.year : now.getFullYear();

    // 2. pull *all* rows that belong to that month/year
    const existingRows = await prisma.leaderboards.findMany({
      where: { month: targetMonth, year: targetYear },
    });

    // Build a quick lookup Map<user_id, row>
    const existingByUser = new Map(
      existingRows.map((r) => [
        r.user_id,
        {
          user_id: r.user_id,
          generated_points: r.generated_points,
          additional_points: r.additional_points,
          total_points: r.total_points,
        },
      ])
    );

    // 3. merge incoming payload with existing values
    const mergedMap = new Map<string, UserLeaderboardInfo>();

    // start with whatever is already in the DB
    for (const [userId, row] of Array.from(existingByUser.entries())) {
      mergedMap.set(userId, row);
    }

    // overwrite / add with data from the new payload
    for (const entry of leaderboardData) {
      mergedMap.set(entry.user.id, {
        user_id: entry.user.id,
        generated_points: entry.generated_point,
        additional_points: entry.additional_points,
        total_points: entry.total_points,
      });
    }

    // 4. turn the Map back into an array and rank by total_points DESC
    const finalRows = Array.from(mergedMap.values())
      .sort((a, b) => b.total_points - a.total_points)
      .map((row, idx) => ({
        ...row,
        month: targetMonth,
        year: targetYear,
        rank: idx + 1,
      }));

    // 5. prepare snapshot rows (same data, no month/year columns)
    const snapshotRows = finalRows.map((r) => ({
      user_id: r.user_id,
      generated_points: r.generated_points,
      additional_points: r.additional_points,
      total_points: r.total_points,
      rank: r.rank,
    }));

    // 6. atomic swap within one transaction
    await prisma.$transaction([
      /* delete *only* the current month/year */
      prisma.leaderboards.deleteMany({
        where: { month: targetMonth, year: targetYear },
      }),
      /* insert the merged & ranked rows */
      prisma.leaderboards.createMany({ data: finalRows }),
    ]);

    await prisma.$transaction([
      /* refresh the snapshot table */
      prisma.monthly_leaderboard.deleteMany(),
      prisma.monthly_leaderboard.createMany({ data: snapshotRows }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return { error: "Failed to update leaderboard" };
  }
}

async function getMonthlyLeaderboard() {
  try {
    const [leaderboard, lastUpdated] = await Promise.all([
      prisma.monthly_leaderboard.findMany({
        select: {
          user: {
            select: {
              id: true,
              name: true,
              user_name: true,
            },
          },
          rank: true,
          total_points: true,
          additional_points: true,
        },
      }),
      prisma.monthly_leaderboard.findFirst({
        select: {
          updated_at: true,
        },
        orderBy: {
          updated_at: "desc",
        },
      }),
    ]);

    const validation = z
      .array(monthlyLeaderboardDataSchema)
      .safeParse(leaderboard);

    if (validation.error) {
      return { error: "Invalid monthly leaderboard data" };
    }

    return {
      success: true,
      data: { leaderboard, last_updated: lastUpdated?.updated_at },
    };
  } catch (error) {
    console.error("Error fetching monthly leaderboard:", error);
    return { error: "Failed to fetch monthly leaderboard" };
  }
}

export {
  checkCodeforcesStatus,
  getUsersCFhandle,
  publishGeneratedLeaderboard,
  updateLeaderboard,
  getMonthlyLeaderboard,
};

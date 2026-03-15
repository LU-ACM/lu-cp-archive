"use server";

import { prisma } from "@/lib/prisma";
import { type AchievementType, AchievementTypeSchema } from "@/types/types";
import {
  leaderboardDataSchema,
  leaderboardDateSchema,
} from "@/utils/schema/leaderboard";
import { z } from "zod";

async function getLeaderboard(selectedMonth: number, selectedYear: number) {
  try {
    const [leaderboard, lastUpdated] = await Promise.all([
      prisma.leaderboards.findMany({
        where: {
          month: selectedMonth,
          year: selectedYear,
        },
        orderBy: {
          rank: "asc",
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              user_name: true,
              image: true,
            },
          },
          rank: true,
          total_points: true,
        },
      }),

      prisma.leaderboards.findFirst({
        select: {
          updated_at: true,
        },
        orderBy: {
          updated_at: "desc",
        },
      }),
    ]);
    const validation = z.array(leaderboardDataSchema).safeParse(leaderboard);

    if (validation.error) {
      return { error: "Invalid leaderboard data" };
    }

    return {
      success: true,
      data: { leaderboard, last_updated: lastUpdated?.updated_at },
    };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { error: "Failed to fetch leaderboard" };
  }
}

async function getLeaderboardDates() {
  try {
    const leaderboardDates = await prisma.leaderboards.groupBy({
      by: ["year", "month"],
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const validation = z
      .array(leaderboardDateSchema)
      .safeParse(leaderboardDates);

    if (validation.error) {
      return { error: "Invalid leaderboard date" };
    }

    return { success: true, data: leaderboardDates };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { error: "Failed to fetch leaderboard" };
  }
}

async function addAchievement(
  userId: string,
  title: AchievementType,
  rank: number,
  month: number,
  year: number
) {
  try {
    const validateData = AchievementTypeSchema.safeParse(title);

    if (validateData.error) {
      return { error: "Invalid data type" };
    }

    // Get start/end dates from the leaderboard entry for that month/year
    const leaderboardEntry = await prisma.leaderboards.findFirst({
      where: { month, year },
      select: { created_at: true, updated_at: true },
    });

    if (!leaderboardEntry) {
      return { error: "Leaderboard entry not found for the given month/year" };
    }

    const achievement = await prisma.achievements.create({
      data: {
        user_id: userId,
        title,
        rank,
        month,
        year,
        start_date: leaderboardEntry.created_at,
        end_date: leaderboardEntry.updated_at,
      },
    });

    return { success: true, data: achievement };
  } catch (error) {
    console.error("Error adding achievement:", error);
    return { error: "Failed to add achievement" };
  }
}

async function getAchievementsByMonthYear(month: number, year: number) {
  try {
    const achievements = await prisma.achievements.findMany({
      where: { month, year },
    });

    return { success: true, data: achievements };
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return { error: "Failed to fetch achievements" };
  }
}

export {
  getLeaderboard,
  getLeaderboardDates,
  addAchievement,
  getAchievementsByMonthYear,
};

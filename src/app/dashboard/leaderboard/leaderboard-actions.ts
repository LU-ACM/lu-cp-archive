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

    const RANKED_TITLES = AchievementTypeSchema.options.filter(
      (t) => t !== "BEST_FEMALE_PROGRAMMER"
    );

    // If assigning a ranked title, check if user already has one
    if ((RANKED_TITLES as AchievementType[]).includes(title)) {
      const existingRankedTitle = await prisma.achievements.findFirst({
        where: {
          user_id: userId,
          month,
          year,
          title: { in: RANKED_TITLES },
        },
      });

      if (existingRankedTitle) {
        return {
          error: `User already has the ${existingRankedTitle.title} title for this month`,
        };
      }
    }

    // Get all leaderboard periods sorted ascending
    const allLeaderboards = await prisma.leaderboards.findMany({
      select: { month: true, year: true },
      distinct: ["month", "year"],
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    const currentIndex = allLeaderboards.findIndex(
      (lb) => lb.month === month && lb.year === year
    );

    if (currentIndex === -1) {
      return { error: "Leaderboard entry not found for the given month/year" };
    }

    const currentLB = allLeaderboards[currentIndex];
    const nextLB = allLeaderboards[currentIndex + 1];

    const start_date = new Date(currentLB.year, currentLB.month - 1, 1); // first day of current LB month
    const end_date = nextLB
      ? new Date(nextLB.year, nextLB.month - 1, 1) // first day of next LB month
      : new Date(currentLB.year, currentLB.month, 0, 23, 59, 59, 999); // last day of current LB month as fallback

    const achievement = await prisma.achievements.create({
      data: {
        user_id: userId,
        title,
        rank,
        month,
        year,
        start_date,
        end_date,
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

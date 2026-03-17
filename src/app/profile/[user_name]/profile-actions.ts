"use server";

import { getUserData } from "@/components/shared-actions/actions";
import { prisma } from "@/lib/prisma";
import { type USER_TYPE } from "@/types/types";
import { isActionError } from "@/utils/error-helper";
import { hasPermission } from "@/utils/permissions";
import axios, { isAxiosError } from "axios";

async function updateCFProfile(data: {
  handle: string | null;
  showOnLeaderboard: boolean;
  profileOwnerId: string;
}) {
  const requester = await getUserData();
  if (isActionError(requester)) {
    return { error: "Unauthorized" };
  }
  if (requester.id !== data.profileOwnerId) {
    return { error: "Unauthorized: Cannot modify another user's profile." };
  }
  try {
    if (!data.handle) {
      await prisma.users.update({
        where: { id: requester.id },
        data: {
          cf_handle: null,
          show_on_leaderboard: data.showOnLeaderboard,
          updated_at: new Date(),
        },
      });

      return { success: true };
    } else {
      const userInfoResponse = await axios.get(
        `https://codeforces.com/api/user.info?handles=${data.handle}`
      );
      const userRatingResponse = await axios.get(
        `https://codeforces.com/api/user.rating?handle=${data.handle}`
      );

      // If no user CF throws 400 but just to be safe (why check both api? -> Ask CF 😑)
      if (
        userInfoResponse.data.status !== "OK" ||
        userRatingResponse.data.status !== "OK"
      ) {
        return { error: "Codeforces user not found" };
      }

      await prisma.users.update({
        where: { id: requester.id },
        data: {
          cf_handle: data.handle,
          show_on_leaderboard: data.showOnLeaderboard,
          updated_at: new Date(),
        },
      });

      return { success: true };
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (
        error.response?.status === 400 ||
        error.response?.data?.status === "FAILED"
      ) {
        return {
          error: "Invalid Codeforces handle, Or Codeforces server is down",
        };
      }
    }

    return { error: "Failed to update profile" };
  }
}

async function getUserStats(userId: string) {
  try {
    const statsTuple = await prisma.$transaction([
      prisma.problem_status.count({
        where: { user_id: userId, status: "DONE" },
      }),
      prisma.problems.count({ where: { approved: true } }),
      prisma.contest_status.count({
        where: { user_id: userId, status: "DONE" },
      }),
      prisma.contests.count({ where: { approved: true } }),
      prisma.problems.count({
        where: { added_by: userId, approved: true },
      }),
      prisma.contests.count({
        where: { added_by: userId, approved: true },
      }),
      prisma.cf_problems.count({
        where: { added_by: userId, approved: true },
      }),
    ]);

    const statKeys = [
      "problemsSolved",
      "totalProblems",
      "contestsSolved",
      "totalContests",
      "problemsAdded",
      "cfProblemsAdded",
      "contestsAdded",
    ] as const;

    const stats = Object.fromEntries(
      statKeys.map((key, index) => [key, statsTuple[index]])
    ) as Record<(typeof statKeys)[number], number>;

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return { error: "Failed to fetch user stats" };
  }
}

async function getAdministrativeUsers() {
  try {
    const users = await prisma.users.findMany({
      where: {
        user_type: {
          in: ["ADMIN", "POWER"],
        },
      },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error("Error getting users:", error);
    return { error: "Failed to fetch users" };
  }
}

async function getStandardUsers() {
  try {
    const users = await prisma.users.findMany({
      where: {
        user_type: "STANDARD",
      },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error("Error getting users:", error);
    return { error: "Failed to fetch users" };
  }
}

async function changeUserType({
  userId,
  newType,
}: {
  userId: string;
  newType: USER_TYPE;
}) {
  const requester = await getUserData();
  if (isActionError(requester)) {
    return { error: "Unauthorized" };
  }
  const hasUserTypeChangePermission = hasPermission(
    requester.user_type,
    "mutate-user"
  );
  if (!hasUserTypeChangePermission) {
    return { error: "Unauthorized: You don't have permission for this action" };
  }
  try {
    await prisma.users.update({
      where: { id: userId },
      data: {
        user_type: newType,
      },
    });
    return { data: { success: true } };
  } catch (error) {
    console.error("Error changing user:", error);
    return { error: "Failed to change user" };
  }
}

async function changeUserLeaderboardState({
  userId,
  newState,
}: {
  userId: string;
  newState: boolean;
}) {
  const requester = await getUserData();
  if (isActionError(requester)) {
    return { error: "Unauthorized" };
  }
  const hasUserChangePermission = hasPermission(
    requester.user_type,
    "mutate-user"
  );
  if (!hasUserChangePermission) {
    return { error: "Unauthorized: You don't have permission for this action" };
  }
  try {
    await prisma.users.update({
      where: { id: userId },
      data: {
        show_on_leaderboard: newState,
      },
    });
    return { data: { success: true } };
  } catch (error) {
    console.error("Error changing user leaderboard state:", error);
    return { error: "Failed to change user leaderboard state" };
  }
}

async function userStepDown() {
  const requester = await getUserData();
  if (isActionError(requester)) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.users.update({
      where: { id: requester.id },
      data: {
        user_type: "STANDARD",
      },
    });
    return { data: { success: true } };
  } catch (error) {
    console.error("Error changing user:", error);
    return { error: "Failed to change user" };
  }
}

async function getUserAchievements(userId: string) {
  try {
    const achievements = await prisma.achievements.findMany({
      where: { user_id: userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return { success: true, data: achievements };
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return { error: "Failed to fetch achievements" };
  }
}

export {
  getUserStats,
  updateCFProfile,
  getAdministrativeUsers,
  getStandardUsers,
  changeUserType,
  changeUserLeaderboardState,
  userStepDown,
  getUserAchievements,
};

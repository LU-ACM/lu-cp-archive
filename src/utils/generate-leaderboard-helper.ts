/**
 * Fetches user data from Codeforces for a list of handles, including max rating,
 * contest participation count, and solved problems within a specified time window.
 *
 * This function performs multiple API requests per user (user.info, user.rating, user.status),
 * applies rate limiting and retry logic, and aggregates the results.
 *
 * - This function cannot be used as a server action because it takes way too much time to complete.
 * - It also cannot be used as an API route because it will likely exceed the time limits for API routes.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { type AxiosError } from "axios";
import { subWeeks } from "date-fns";
import Bottleneck from "bottleneck";
import { type GeneratedLeaderboard } from "./schema/generated-leaderboard";

const CF_API = "https://codeforces.com/api";
// const WINDOW_MONTHS = 1;
const WINDOW_WEEKS = 1;

const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 500, // at least 500ms between each request ⇒ 5 req/s
});

async function limitedAxios<T>(config: Parameters<typeof axios.request>[0]) {
  return limiter.schedule(() => axios.request<T>(config));
}

async function requestWithRetry<T>(
  fn: () => Promise<T>,
  retries = 5,
  delayMs = 500
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const axiosErr = err as AxiosError;
    if (retries > 0 && axiosErr.response?.status === 429) {
      await new Promise((r) => setTimeout(r, delayMs));
      return requestWithRetry(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
}

type Solve = {
  rating: number | undefined;
};

export async function fetchUserCFData(handles: string[]) {
  try {
    const windowStartTs = Math.floor(
      // subMonths(new Date(), WINDOW_MONTHS).getTime() / 1000
      subWeeks(new Date(), WINDOW_WEEKS).getTime() / 1000
    );

    const tasks = handles.map(async (handle) => {
      const userInfoResp = await requestWithRetry(() =>
        limitedAxios<any>({
          url: `${CF_API}/user.info?handles=${handle}`,
        })
      );

      const ratingResp = await requestWithRetry(() =>
        limitedAxios<any>({
          url: `${CF_API}/user.rating?handle=${handle}`,
        })
      );
      const allRatings = ratingResp?.data?.result;
      const contestsInWindow = allRatings.filter(
        (r: any) => r.ratingUpdateTimeSeconds >= windowStartTs
      );
      const maxRating = userInfoResp?.data?.result[0].maxRating;

      const subsResp = await requestWithRetry(() =>
        limitedAxios<any>({
          url: `${CF_API}/user.status`,
          params: { handle, from: 1, count: 100000 },
        })
      );
      const submissions = subsResp?.data?.result;

      const solvesMap = submissions
        .filter(
          (s: any) =>
            s.verdict === "OK" && s.creationTimeSeconds >= windowStartTs
        )
        .reduce((acc: any, sub: any) => {
          const key = `${sub.problem.contestId}-${sub.problem.index}`;
          if (!acc[key]) acc[key] = { rating: sub.problem.rating };
          return acc;
        }, {});
      const solves = Object.values(solvesMap).sort(
        (a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0)
      ) as Solve[];

      return {
        handle,
        max_rating: maxRating ?? 0,
        contest_participation: contestsInWindow.length ?? 0,
        solves,
      };
    });

    const results = await Promise.allSettled(tasks);

    // skip users with 0 maxRating or 0 solves
    const successful = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((user) => user.max_rating > 0 && user.solves.length > 0);

    return { success: true, data: successful };
  } catch (error) {
    console.error("Error fetching Codeforces data:", error);
    return {
      error: "Failed to fetch Codeforces data.",
    };
  }
}

type UserCFData = {
  handle: string;
  max_rating: number;
  solves: Solve[];
  contest_participation: number;
};

function calculateSolvePoints(
  userMaxRating: number,
  solveRating: number
): number {
  const weight = solveRating / 1000;
  const diff = solveRating - userMaxRating;
  return Math.max(20, Math.min(200, diff)) * weight;
}

export function computeInitialScore(cfUserData: UserCFData[]) {
  try {
    const result = cfUserData.map((user) => {
      const validSolves = user.solves.filter(
        (solve) => solve.rating !== undefined
      );

      const pointsForProblems = validSolves.reduce((acc, solve) => {
        return (
          acc + calculateSolvePoints(user.max_rating, solve.rating as number)
        );
      }, 0);

      const pointsForContests = user.contest_participation * 500;
      const finalGeneratedScore = pointsForProblems + pointsForContests;

      return {
        handle: user.handle,
        rating: user.max_rating,
        totalProblemSolved: validSolves.length,
        pointsForProblems,
        totalContestParticipated: user.contest_participation,
        pointsForContest: pointsForContests,
        finalGeneratedScore,
      };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating score:", error);
    return { error: "Failed to compute leaderboard scores." };
  }
}

type InitialScore = {
  handle: string;
  rating: number;
  totalProblemSolved: number;
  pointsForProblems: number;
  totalContestParticipated: number;
  pointsForContest: number;
  finalGeneratedScore: number;
};

type UserInfo = {
  id: string;
  name: string;
  user_name: string;
  cf_handle: string;
};

export function mergeUserDataWithScores(
  initialScores: InitialScore[],
  userData: UserInfo[]
) {
  try {
    const mergedData = initialScores
      .map((score) => {
        const userInfo = userData.find(
          (user) => user.cf_handle === score.handle
        );
        // Only include if userInfo exists
        if (userInfo) {
          return {
            ...score,
            id: userInfo.id,
            name: userInfo.name,
            user_name: userInfo.user_name,
          };
        }
        // If not found, skip (do not return null)
        return undefined;
      })
      .filter(
        (
          item
        ): item is InitialScore & {
          id: string;
          name: string;
          user_name: string;
        } => !!item
      );

    return { success: true, data: mergedData };
  } catch (error) {
    console.error("Merge error:", error);
    return { error: "Failed to merge data" };
  }
}

type MergedDataType = InitialScore & {
  id: string;
  name: string;
  user_name: string;
};

export function finalizedLeaderboardData(mergedData: MergedDataType[]) {
  try {
    const dataWithPoints = mergedData.map((item) => ({
      ...item,
      additional_points: 0,
      total_points: item.finalGeneratedScore,
    }));

    dataWithPoints.sort((a, b) => b.total_points - a.total_points);

    // Assign ranks (sequential, no tie handling)
    const rankedData = dataWithPoints.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    const leaderboardData = rankedData.map((item) => ({
      additional_points: item.additional_points,
      user: {
        id: item.id,
        name: item.name,
        user_name: item.user_name,
      },
      rank: item.rank,
      generated_point: Math.round(item.finalGeneratedScore),
      total_points: Math.round(item.total_points),
    }));

    return { success: true, data: leaderboardData };
  } catch (error) {
    console.error("Leaderboard generation error:", error);
    return { error: "Failed to generate leaderboard" };
  }
}

export function mergeLeaderboardData(
  previousData: GeneratedLeaderboard[],
  newData: GeneratedLeaderboard[]
) {
  const prevDataMap = new Map<string, GeneratedLeaderboard>();

  if (previousData) {
    previousData.forEach((item) => {
      prevDataMap.set(item.user.id, item);
    });
  }

  return newData.map((newItem) => {
    const existingItem = prevDataMap.get(newItem.user.id);

    if (existingItem) {
      // If user exists in previous data, sum up the points
      return {
        ...newItem,
        generated_point: newItem.generated_point + existingItem.generated_point,
        additional_points:
          newItem.additional_points + existingItem.additional_points,
        total_points: newItem.total_points + existingItem.total_points,
      };
    }

    return newItem;
  });
}

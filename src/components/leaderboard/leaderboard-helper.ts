import { type SearchParams } from "@/app/dashboard/leaderboard/page";
import { type AchievementType, AchievementTypeSchema } from "@/types/types";
import {
  type LeaderboardDateType,
  type Leaderboard,
} from "@/utils/schema/leaderboard";
import { type AssignedAchievement } from "./achievement-assign-dropdown";

export function isolateTopThree(leaderboard: Leaderboard[]) {
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  return { topThree, rest };
}

export function formattedLBDates(
  leaderboardDates: LeaderboardDateType[],
  searchParams: SearchParams
): {
  latestLBDate: { year: number; month: number } | null;
  otherLBDates: LeaderboardDateType[];
} {
  const sortedDates = [...leaderboardDates].sort(
    (a, b) => b.year - a.year || b.month - a.month
  );

  // When search param is `latest`, use the most recent date; otherwise find the selected date by year/month
  let latestLBDate: { year: number; month: number } | null = null;

  if (searchParams.latest) {
    latestLBDate = sortedDates[0] || null;
  } else {
    latestLBDate =
      sortedDates.find(
        (date) =>
          date.year === searchParams.year && date.month === searchParams.month
      ) || null;
  }

  const otherLBDates = sortedDates.slice(1);

  return {
    latestLBDate,
    otherLBDates,
  };
}

export function isTitleDisabled(
  title: AchievementType,
  existingTitles: AssignedAchievement[],
  winnerId: string
): boolean {
  const RANKED_TITLES = AchievementTypeSchema.options.filter(
    (title) => title !== "BEST_FEMALE_PROGRAMMER"
  );
  if (existingTitles.find((a) => a.title === title)) return true;

  if ((RANKED_TITLES as AchievementType[]).includes(title)) {
    const winnerHasRankedTitle = existingTitles.some(
      (a) =>
        a.user_id === winnerId &&
        (RANKED_TITLES as AchievementType[]).includes(a.title)
    );
    if (winnerHasRankedTitle) return true;
  }

  return false;
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { unwrapActionResult } from "@/utils/error-helper";
import Error from "@/components/shared/error";
import Loading from "@/components/shared/loading";
import { LeaderboardTable } from "./leaderboard-table";
import {
  getAchievementsByMonthYear,
  getLeaderboard,
} from "@/app/dashboard/leaderboard/leaderboard-actions";
import { leaderboard_table_column } from "./leaderboard-table-column";
import { isolateTopThree } from "../leaderboard-helper";
import TopThreeWinners from "../top-three-winners";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/utils/permissions";

export default function LeaderboardTableWrapper({
  leaderboardDate,
  isPreviousLB,
}: {
  leaderboardDate: Date;
  isPreviousLB: boolean;
}) {
  const { data: session } = useSession();

  // If previous Leaderboard is selected and if has permission then can assign achievements
  const canAssignAchievements =
    isPreviousLB && session
      ? hasPermission(session.user.user_type, "assign-achievements")
      : false;

  const {
    data: leaderboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "leaderboard",
      `${leaderboardDate.getFullYear()}-${leaderboardDate.getMonth() + 1}`,
    ],
    queryFn: async () => {
      const result = await getLeaderboard(
        leaderboardDate.getMonth() + 1,
        leaderboardDate.getFullYear()
      );

      const unwrappedResult = unwrapActionResult(result);
      if (!unwrappedResult) return undefined;

      const { topThree, rest } = isolateTopThree(unwrappedResult.leaderboard);

      const lastUpdated = unwrappedResult.last_updated;

      return {
        topThree,
        rest,
        lastUpdated,
      };
    },
    staleTime: Infinity,
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: [
      "achievements",
      `${leaderboardDate.getFullYear()}-${leaderboardDate.getMonth() + 1}`,
    ],
    queryFn: async () => {
      const result = await getAchievementsByMonthYear(
        leaderboardDate.getMonth() + 1,
        leaderboardDate.getFullYear()
      );
      const unwrappedResult = unwrapActionResult(result);

      if (!unwrappedResult) return undefined;

      return unwrappedResult;
    },
    staleTime: Infinity,
    enabled: canAssignAchievements,
  });

  if (isLoading || achievementsLoading || !leaderboardDate) {
    return <Loading />;
  }

  if (isError || !leaderboardData) {
    if (!leaderboardData) {
      return <Error message={error?.message} refetch={refetch} />;
    }
  }

  return (
    <div>
      {leaderboardData.lastUpdated && (
        <div className="mb-4 flex justify-end">
          <div className="text-sm">
            <span className="mr-2">Last updated:</span>
            <span className="text-muted-foreground">
              {format(new Date(leaderboardData.lastUpdated), "MMMM d, yyyy")}
            </span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <TopThreeWinners
          winners={leaderboardData.topThree}
          canAssignAchievements={canAssignAchievements}
          leaderboardDate={leaderboardDate}
          showAchievementBadge={isPreviousLB}
          achievements={achievements || []}
        />
      </div>
      <LeaderboardTable
        columns={leaderboard_table_column(canAssignAchievements)}
        // data={leaderboardData.rest}
        data={leaderboardData.topThree} // NEED TO FIX
      />
    </div>
  );
}

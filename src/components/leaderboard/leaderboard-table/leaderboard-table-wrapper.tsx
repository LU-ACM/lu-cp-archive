"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useState, useEffect } from "react";
import { type AssignedAchievement } from "@/components/leaderboard/achievement-assign-dropdown";
import { type AchievementType } from "@/types/types";

export default function LeaderboardTableWrapper({
  leaderboardDate,
  isPreviousLB,
}: {
  leaderboardDate: Date;
  isPreviousLB: boolean;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const month = leaderboardDate.getMonth() + 1;
  const year = leaderboardDate.getFullYear();

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
    queryKey: ["leaderboard", `${year}-${month}`],
    queryFn: async () => {
      const result = await getLeaderboard(month, year);
      const unwrappedResult = unwrapActionResult(result);
      if (!unwrappedResult) return undefined;

      const { topThree, rest } = isolateTopThree(unwrappedResult.leaderboard);
      return { topThree, rest, lastUpdated: unwrappedResult.last_updated };
    },
    staleTime: Infinity,
  });

  const { data: fetchedAchievements, isLoading: achievementsLoading } =
    useQuery({
      queryKey: ["achievements", `${year}-${month}`],
      queryFn: async () => {
        const result = await getAchievementsByMonthYear(month, year);
        const unwrappedResult = unwrapActionResult(result);
        if (!unwrappedResult) return undefined;
        return unwrappedResult; // return raw data, don't map here
      },
      staleTime: Infinity,
      enabled: canAssignAchievements,
    });

  const [existingTitles, setExistingTitles] = useState<AssignedAchievement[]>(
    []
  );

  useEffect(() => {
    setExistingTitles(
      fetchedAchievements?.map((a) => ({
        title: a.title as AchievementType,
        user_id: a.user_id,
      })) ?? []
    );
  }, [fetchedAchievements]);

  function handleAssigned(newAchievement: AssignedAchievement) {
    setExistingTitles((prev) => [...prev, newAchievement]);
    queryClient.invalidateQueries({
      queryKey: ["achievements", `${year}-${month}`],
    });
  }

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
          achievements={fetchedAchievements ?? []}
          existingTitles={existingTitles}
          onAssigned={handleAssigned}
        />
      </div>
      <LeaderboardTable
        columns={leaderboard_table_column(
          canAssignAchievements,
          existingTitles,
          handleAssigned,
          month,
          year,
          fetchedAchievements ?? []
        )}
        data={leaderboardData.rest}
      />
    </div>
  );
}

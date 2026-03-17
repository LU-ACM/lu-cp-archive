import { leaderboardSearchParamsSchema } from "@/utils/schema/leaderboard";
import LeaderboardSection from "./_components/leaderboard-section";
import { notFound, redirect } from "next/navigation";
import { getLeaderboardDates } from "./leaderboard-actions";
import { isActionError } from "@/utils/error-helper";
import { formattedLBDates } from "@/components/leaderboard/leaderboard-helper";
import GenerateLeaderboardLink from "./_components/generate-leaderboard-link";

export type SearchParams =
  | {
      latest: boolean;
      year?: undefined;
      month?: undefined;
    }
  | {
      latest?: undefined;
      year: number;
      month: number;
    };

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const result = leaderboardSearchParamsSchema.safeParse(searchParams);

  if (!result.success) {
    redirect("/dashboard/leaderboard?latest=true");
  }

  const leaderboardDates = await getLeaderboardDates();

  if (isActionError(leaderboardDates)) {
    throw new Error("Something went wrong");
  }
  const { latestLBDate, otherLBDates } = formattedLBDates(
    leaderboardDates.data,
    result.data
  );

  if (!latestLBDate) {
    notFound();
  }

  return (
    <div className="py-8">
      <div className="mb-4 flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
        <div className="flex items-center">
          <span className="text-center font-mono text-2xl font-bold tracking-wide md:text-left">
            Leaderboard
          </span>
        </div>
        <GenerateLeaderboardLink />
      </div>
      <LeaderboardSection
        initialDate={latestLBDate}
        otherLBDates={otherLBDates}
        allowedMonths={leaderboardDates.data}
      />
    </div>
  );
}

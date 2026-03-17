"use client";

import { useEffect, useState } from "react";
import LeaderboardMonthPicker from "@/components/leaderboard/leaderboard-month-picker";
import LeaderboardTableWrapper from "@/components/leaderboard/leaderboard-table/leaderboard-table-wrapper";
import { type LeaderboardDateType } from "@/utils/schema/leaderboard";
import { useSearchParams } from "next/navigation";

export default function LeaderboardSection({
  initialDate,
  allowedMonths,
  otherLBDates,
}: {
  initialDate: LeaderboardDateType;
  allowedMonths: LeaderboardDateType[];
  otherLBDates: LeaderboardDateType[];
}) {
  const isPreviousLB = otherLBDates.some(
    (date) => date.year === initialDate.year && date.month === initialDate.month
  );

  const searchParams = useSearchParams();

  const [preservedInitialDate] = useState<Date>(
    new Date(initialDate.year, initialDate.month - 1)
  );

  const [leaderboardDate, setLeaderboardDate] = useState<Date>(
    new Date(initialDate.year, initialDate.month - 1)
  );

  useEffect(() => {
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const latest = searchParams.get("latest");

    if (year && month) {
      const newDate = new Date(parseInt(year), parseInt(month) - 1);
      setLeaderboardDate(newDate);
    }
    if (latest) {
      setLeaderboardDate(preservedInitialDate);
    }
  }, [preservedInitialDate, searchParams]);

  const handleSelectMonth = (selected: Date) => {
    const selectedYear = selected.getFullYear();
    const selectedMonth = selected.getMonth() + 1;

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);

      url.searchParams.set("year", selectedYear.toString());
      url.searchParams.set("month", selectedMonth.toString());
      url.searchParams.delete("latest");

      window.location.href = url.toString();
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <LeaderboardMonthPicker
          leaderboardDate={leaderboardDate}
          allowedMonths={allowedMonths}
          onMonthSelect={handleSelectMonth}
        />
      </div>
      <div>
        <LeaderboardTableWrapper
          leaderboardDate={leaderboardDate}
          isPreviousLB={isPreviousLB}
        />
      </div>
    </div>
  );
}

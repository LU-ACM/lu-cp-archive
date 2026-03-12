"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { type ReactNode } from "react";
import { unwrapActionResult } from "@/utils/error-helper";
import { getUserStats } from "../profile-actions";
import { type users } from "@prisma/client";

type StatItemProps = {
  label: string;
  value: ReactNode;
};

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="space-y-2 rounded-lg bg-muted/60 p-3 transition-all duration-200 hover:bg-muted/80">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div>{value}</div>
    </div>
  );
}

export default function ActivityStats({ userData }: { userData: users }) {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-stats", userData.user_name],
    queryFn: async () => {
      const result = await getUserStats(userData.id);
      return unwrapActionResult(result);
    },
    staleTime: Infinity,
  });

  const renderStatValue = (value: ReactNode) =>
    isLoading ? <Skeleton className="h-10 w-24" /> : value;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded bg-accent p-2">
            <Activity className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-semibold">
            Activity Stats
          </CardTitle>
        </div>
        <CardDescription className="text-sm">
          Your overall contribution and activity stats
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isError ? (
          <p className="text-sm text-destructive">Failed to load stats.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <StatItem
              label="Problem Added"
              value={renderStatValue(
                <p className="font-mono text-3xl font-semibold tracking-tight">
                  {stats?.problemsAdded ?? 0}
                </p>
              )}
            />
            <StatItem
              label="Contest Added"
              value={renderStatValue(
                <p className="font-mono text-3xl font-semibold tracking-tight">
                  {stats?.contestsAdded ?? 0}
                </p>
              )}
            />
            <StatItem
              label="Problem Solved"
              value={renderStatValue(
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-semibold tracking-tight">
                    {stats?.problemsSolved ?? 0}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    /{stats?.totalProblems ?? 0}
                  </span>
                </div>
              )}
            />
            <StatItem
              label="Contest Solved"
              value={renderStatValue(
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-semibold tracking-tight">
                    {stats?.contestsSolved ?? 0}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    /{stats?.totalContests ?? 0}
                  </span>
                </div>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { type achievements } from "@prisma/client";
import { type Leaderboard } from "@/utils/schema/leaderboard";
import { type AchievementType } from "@/types/types";

const achievementConfig: Partial<
  Record<AchievementType, { label: string; style: string }>
> = {
  CHAMPION: {
    label: "Champion",
    style: "bg-rose-500/20 text-rose-500",
  },
  FIRST_RUNNER_UP: {
    label: "1st Runner-up",
    style: "bg-cyan-500/20 text-cyan-500",
  },
  SECOND_RUNNER_UP: {
    label: "2nd Runner-up",
    style: "bg-lime-500/20 text-lime-500",
  },
  BEST_FEMALE_PROGRAMMER: {
    label: "Best Female Programmer",
    style: "bg-pink-500/20 text-pink-500",
  },
};

export default function LBAchievementBadge({
  achievements,
  winner,
  className,
}: {
  achievements: achievements[];
  winner: Leaderboard;
  className?: string;
}) {
  const userAchievements = achievements.filter(
    (a) => a.user_id === winner.user.id
  );

  if (userAchievements.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      {userAchievements.map((achievement) => {
        const config = achievementConfig[achievement.title];
        if (!config) return null;

        return (
          <Badge
            key={achievement.title}
            className={cn("pointer-events-none w-fit", config.style, className)}
          >
            {config.label}
          </Badge>
        );
      })}
    </div>
  );
}

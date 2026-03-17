"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { type Leaderboard } from "@/utils/schema/leaderboard";
import { MoreHorizontal, User } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import AchievementAssignDropdown, {
  type AssignedAchievement,
} from "./achievement-assign-dropdown";
import LBAchievementBadge from "./lb-achievement-badge";
import { type achievements } from "@prisma/client";

export default function TopThreeWinners({
  winners,
  canAssignAchievements,
  leaderboardDate,
  achievements,
  existingTitles,
  onAssigned,
}: {
  winners: Leaderboard[];
  canAssignAchievements: boolean;
  leaderboardDate: Date;
  achievements: achievements[];
  existingTitles: AssignedAchievement[];
  onAssigned: (achievement: AssignedAchievement) => void;
}) {
  const sortedWinners = [...winners].sort((a, b) => a.rank - b.rank);
  const [firstPlace, secondPlace, thirdPlace] = sortedWinners.slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="order-2 md:order-1">
        {secondPlace && (
          <WinnerCard
            winner={secondPlace}
            variant="second"
            size="md"
            hasAchievementChangePermission={canAssignAchievements}
            leaderboardDate={leaderboardDate}
            achievements={achievements}
            existingTitles={existingTitles}
            onAssigned={onAssigned}
          />
        )}
      </div>
      <div className="order-1 md:order-2">
        {firstPlace && (
          <WinnerCard
            winner={firstPlace}
            variant="first"
            size="lg"
            hasAchievementChangePermission={canAssignAchievements}
            leaderboardDate={leaderboardDate}
            achievements={achievements}
            existingTitles={existingTitles}
            onAssigned={onAssigned}
          />
        )}
      </div>
      <div className="order-3">
        {thirdPlace && (
          <WinnerCard
            winner={thirdPlace}
            variant="third"
            size="md"
            hasAchievementChangePermission={canAssignAchievements}
            leaderboardDate={leaderboardDate}
            achievements={achievements}
            existingTitles={existingTitles}
            onAssigned={onAssigned}
          />
        )}
      </div>
    </div>
  );
}

type WinnerCardProps = {
  winner: Leaderboard;
  variant: "first" | "second" | "third";
  size: "md" | "lg";
  hasAchievementChangePermission: boolean;
  leaderboardDate: Date;
  achievements: achievements[];
  existingTitles: AssignedAchievement[];
  onAssigned: (achievement: AssignedAchievement) => void;
};

function WinnerCard({
  winner,
  variant,
  size,
  hasAchievementChangePermission,
  leaderboardDate,
  achievements,
  existingTitles,
  onAssigned,
}: WinnerCardProps) {
  const isLarge = size === "lg";

  const variantMap = {
    first: {
      badge: "bg-rose-500 text-rose-900",
      text: "text-rose-500",
      glow: "0 0 20px rgba(244, 63, 94, 1)",
      avatarBorder: "border-rose-500",
    },
    second: {
      badge: "bg-cyan-500 text-cyan-900",
      text: "text-cyan-500",
      glow: "0 0 20px rgba(14, 165, 233, 1)",
      avatarBorder: "border-cyan-500",
    },
    third: {
      badge: "bg-lime-500 text-lime-900",
      text: "text-lime-500",
      glow: "0 0 20px rgba(34, 197, 94, 1)",
      avatarBorder: "border-lime-500",
    },
  };

  const variantStyle = variantMap[variant];

  return (
    <Card
      className={`relative flex flex-col items-center border bg-card p-6 ${isLarge ? "transform md:-translate-y-4" : ""}`}
    >
      {hasAchievementChangePermission && (
        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <AchievementAssignDropdown
              winner={winner}
              year={leaderboardDate.getFullYear()}
              month={leaderboardDate.getMonth() + 1}
              existingTitles={existingTitles}
              onAssigned={onAssigned}
            />
          </DropdownMenu>
        </div>
      )}
      <CardContent className="flex w-full flex-col items-center p-0 pt-6">
        <div className="relative mb-4">
          <Badge
            className={`pointer-events-none absolute -right-3 -top-3 flex h-8 w-8 justify-center rounded-full bg-accent text-sm font-extrabold text-primary`}
          >
            {winner.rank}
          </Badge>
          <div className="relative">
            <Avatar
              className={`${isLarge ? "h-28 w-28" : "h-24 w-24"} border-2 ${variantStyle.avatarBorder}`}
              style={{ boxShadow: variantStyle.glow }}
            >
              <AvatarImage
                src={winner.user.image ?? undefined}
                alt={winner.user.name}
                className="object-cover"
              />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <h3
          className={`w-full text-center font-bold ${isLarge ? "text-xl" : "text-lg"} mb-1 truncate`}
        >
          {winner.user.name}
        </h3>
        <Link href={`/profile/@${winner.user.user_name}`}>
          <Badge
            variant="secondary"
            className="mb-1 w-fit max-w-full truncate px-2 py-1 text-xs hover:scale-[1.02]"
          >
            @{winner.user.user_name}
          </Badge>
        </Link>
        <div
          className={`font-mono font-bold ${variantStyle.text} ${isLarge ? "text-3xl" : "text-2xl"}`}
        >
          {winner.total_points}
        </div>
        <div className="my-1">
          <LBAchievementBadge achievements={achievements} winner={winner} />
        </div>
      </CardContent>
    </Card>
  );
}

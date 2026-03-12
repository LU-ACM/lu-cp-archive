"use client";

import AchievementDialog, {
  type Badge,
  type BadgeUser,
} from "@/components/profile/achievements/achievement-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Medal } from "lucide-react";
import { useState } from "react";

// ── mock user — swap with your real auth/profile data ──────────────────────
const CURRENT_USER: BadgeUser = {
  name: "Alex Johnson",
  username: "alexj",
  avatar: "/assets/avatar.jpg", // replace with real avatar path
};

export default function Achievements() {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const badges: Badge[] = [
    {
      id: 1,
      name: "100 Problems Solved",
      title: "Champion",
      rank: 1,
      period: "Jan 2025 – Jun 2025",
      image: "/assets/first-runner-up.svg",
    },
    {
      id: 2,
      name: "First Contest Win",
      title: "Champion",
      rank: 1,
      period: "Jan 2025 – Jun 2025",
      image: "/badges/contest-win.png",
    },
    {
      id: 3,
      name: "Top Contributor",
      title: "Champion",
      rank: 1,
      period: "Jan 2025 – Jun 2025",
      image: "/badges/top-contributor.png",
    },
  ];

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded bg-accent p-2">
              <Medal className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-semibold">
              Achievements
            </CardTitle>
          </div>
          <CardDescription className="text-sm">
            Badges and milestones you&apos;ve earned
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div
            className={cn(
              "grid gap-4",
              badges.length === 1
                ? "grid-cols-1"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            )}
          >
            {badges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className="group flex cursor-pointer flex-col items-center rounded-xl border bg-muted/30 p-4 text-center transition-all duration-300 hover:scale-[1.02] hover:bg-muted/60 hover:shadow-md"
              >
                <img
                  src={badge.image}
                  alt={badge.name}
                  className="mb-4 transition-transform duration-300 group-hover:scale-105"
                />
                <p className="text-base font-semibold">{badge.title}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground/70">
                  {badge.period}
                </p>
                <span className="mt-3 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  View & Share →
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <AchievementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        badge={selectedBadge}
        user={CURRENT_USER}
      />
    </>
  );
}

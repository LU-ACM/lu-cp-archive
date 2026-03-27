/* eslint-disable @next/next/no-img-element */
"use client";

import AchievementDialog, {
  type Badge,
} from "@/components/profile/achievements/achievement-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Medal, Share2, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { unwrapActionResult } from "@/utils/error-helper";
import { type AchievementType } from "@/types/types";
import { format } from "date-fns";
import Loading from "@/components/shared/loading";
import { getUserAchievements } from "../profile-actions";
import NoData from "@/components/shared/no-data";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { type users } from "@prisma/client";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { toast } from "sonner";
import champion from "@/assets/achievements/champion.svg";
import firstRunnerUp from "@/assets/achievements/first-runner-up.svg";
import secondRunnerUp from "@/assets/achievements/second-runner-up.svg";
import bestFemaleProgrammer from "@/assets/achievements/best-female-programmer.svg";
import type { StaticImageData } from "next/image";

const ACHIEVEMENT_IMAGE_MAP: Record<AchievementType, StaticImageData> = {
  CHAMPION: champion,
  FIRST_RUNNER_UP: firstRunnerUp,
  SECOND_RUNNER_UP: secondRunnerUp,
  BEST_FEMALE_PROGRAMMER: bestFemaleProgrammer,
};

const ACHIEVEMENT_COLOR_MAP: Record<AchievementType, string> = {
  CHAMPION: "#f43f5e",
  FIRST_RUNNER_UP: "#06b6d4",
  SECOND_RUNNER_UP: "#84cc16",
  BEST_FEMALE_PROGRAMMER: "#ec4899",
};

const ACHIEVEMENT_LABEL_MAP: Record<AchievementType, string> = {
  CHAMPION: "Champion",
  FIRST_RUNNER_UP: "1st Runner-Up",
  SECOND_RUNNER_UP: "2nd Runner-Up",
  BEST_FEMALE_PROGRAMMER: "Best Female Programmer",
};

export default function Achievements({ user }: { user: users }) {
  const pathname = usePathname();

  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: badges, isLoading } = useQuery({
    queryKey: ["user-achievements", user.id],
    queryFn: async () => {
      const result = await getUserAchievements(user.id);
      const unwrapped = unwrapActionResult(result);
      if (!unwrapped) return [];

      return unwrapped.reduce((acc: Badge[], a, index) => {
        const title = a.title as AchievementType;
        const period = `${format(new Date(a.start_date), "MMM yyyy")} – ${format(new Date(a.end_date), "MMM yyyy")}`;

        if (title === "BEST_FEMALE_PROGRAMMER") {
          // Check if there's already a ranked badge for the same period
          const existing = acc.find((b) => b.period === period);
          if (existing) {
            existing.extraBadge = {
              title: ACHIEVEMENT_LABEL_MAP[title],
              image: ACHIEVEMENT_IMAGE_MAP[title],
              color: ACHIEVEMENT_COLOR_MAP[title],
            };
            return acc;
          }
        }

        acc.push({
          id: index,
          title: ACHIEVEMENT_LABEL_MAP[title],
          period,
          image: ACHIEVEMENT_IMAGE_MAP[title],
          color: ACHIEVEMENT_COLOR_MAP[title],
        });

        return acc;
      }, []);
    },
    staleTime: Infinity,
  });

  const [copy, isCopied] = useCopyToClipboard();

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setDialogOpen(true);
  };

  if (isLoading) return <Loading />;

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

            <div className="flex w-full justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  copy(
                    `${window.location.origin}${pathname}/achievements`
                  ).then(() =>
                    toast.success("Link is copied to your clipboard.")
                  )
                }
              >
                {isCopied ? <Check className="text-emerald-500" /> : <Share2 />}
                Share
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm">
            Badges and milestones you&apos;ve earned
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!badges || badges.length === 0 ? (
            <NoData title="Don't worry, keep grinding" />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {badges.map((badge) =>
                badge.extraBadge ? (
                  <button
                    key={badge.id}
                    onClick={() => handleBadgeClick(badge)}
                    style={{ boxShadow: `0 0 20px ${badge.color}20` }}
                    className="group flex h-full w-full cursor-pointer flex-col items-center justify-between rounded-xl border bg-muted/30 p-4 text-center transition-all duration-300 hover:scale-[1.02] hover:bg-muted/60 hover:shadow-md"
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        <div
                          className="absolute rounded-full"
                          style={{
                            width: 60,
                            height: 60,
                            backgroundColor: badge.color,
                            opacity: 0.15,
                            filter: "blur(16px)",
                          }}
                        />
                        <img
                          src={badge.image.src}
                          alt={badge.title}
                          className="relative w-20 transition-transform duration-300 group-hover:scale-105"
                          style={{
                            filter: `drop-shadow(0 0 8px ${badge.color}60) drop-shadow(0 0 20px ${badge.color}30)`,
                          }}
                        />
                      </div>
                      <p
                        className="mt-2 text-sm font-semibold"
                        style={{ color: badge.color }}
                      >
                        {badge.title}
                      </p>
                    </div>

                    <X className="my-1 size-5 text-muted-foreground" />

                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        <div
                          className="absolute rounded-full"
                          style={{
                            width: 60,
                            height: 60,
                            backgroundColor: badge.color,
                            opacity: 0.15,
                            filter: "blur(16px)",
                          }}
                        />
                        <img
                          src={badge.image.src}
                          alt={badge.title}
                          className="relative w-20 transition-transform duration-300 group-hover:scale-105"
                          style={{
                            filter: `drop-shadow(0 0 8px ${badge.extraBadge.color}60) drop-shadow(0 0 20px ${badge.extraBadge.color}30)`,
                          }}
                        />
                      </div>
                      <p
                        className="mt-2 text-sm font-semibold"
                        style={{ color: badge.extraBadge.color }}
                      >
                        {badge.extraBadge.title}
                      </p>
                    </div>

                    <p className="mt-2 rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground/70">
                      {badge.period}
                    </p>
                  </button>
                ) : (
                  <button
                    key={badge.id}
                    onClick={() => handleBadgeClick(badge)}
                    style={{ boxShadow: `0 0 20px ${badge.color}20` }}
                    className="group flex w-full cursor-pointer flex-col items-center self-start rounded-xl border bg-muted/30 p-4 text-center transition-all duration-300 hover:scale-[1.02] hover:bg-muted/60 hover:shadow-md"
                  >
                    <div className="relative mb-3 flex items-center justify-center">
                      <div
                        className="absolute rounded-full"
                        style={{
                          width: 80,
                          height: 80,
                          backgroundColor: badge.color,
                          opacity: 0.15,
                          filter: "blur(20px)",
                        }}
                      />
                      <img
                        src={badge.image.src}
                        alt={badge.title}
                        className="relative transition-transform duration-300 group-hover:scale-105"
                        style={{
                          filter: `drop-shadow(0 0 8px ${badge.color}60) drop-shadow(0 0 20px ${badge.color}30)`,
                        }}
                      />
                    </div>
                    <p
                      className="text-base font-semibold"
                      style={{ color: badge.color }}
                    >
                      {badge.title}
                    </p>
                    <p className="mt-2 rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground/70">
                      {badge.period}
                    </p>
                  </button>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AchievementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        badge={selectedBadge}
        user={user}
      />
    </>
  );
}

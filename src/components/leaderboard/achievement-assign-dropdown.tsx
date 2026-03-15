"use client";

import { type Leaderboard } from "@/utils/schema/leaderboard";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { addAchievement } from "@/app/dashboard/leaderboard/leaderboard-actions";
import { useState } from "react";
import { toast } from "sonner";
import { type AchievementType } from "@/types/types";
import { isTitleDisabled } from "./leaderboard-helper";

export type AssignedAchievement = {
  title: AchievementType;
  user_id: string;
};

const ACHIEVEMENT_OPTIONS: {
  label: string;
  title: AchievementType;
}[] = [
  { label: "Champion", title: "CHAMPION" },
  { label: "1st Runner-Up", title: "FIRST_RUNNER_UP" },
  { label: "2nd Runner-Up", title: "SECOND_RUNNER_UP" },
  { label: "Best Female Programmer", title: "BEST_FEMALE_PROGRAMMER" },
];

export default function AchievementAssignDropdown({
  winner,
  month,
  year,
  existingTitles = [],
  onAssigned, // notifies parent to update shared state
}: {
  winner: Leaderboard;
  month: number;
  year: number;
  existingTitles: AssignedAchievement[];
  onAssigned: (achievement: AssignedAchievement) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    title: AchievementType;
    label: string;
  } | null>(null);

  async function handleConfirm() {
    if (!pendingAction) return;
    setIsLoading(true);

    const result = await addAchievement(
      winner.user.id,
      pendingAction.title,
      winner.rank,
      month,
      year
    );

    setIsLoading(false);
    setPendingAction(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${pendingAction.label} assigned to ${winner.user.name}`);
      onAssigned({ title: pendingAction.title, user_id: winner.user.id });
    }
  }

  return (
    <>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACHIEVEMENT_OPTIONS.map(({ label, title }) => {
          const existing = existingTitles.find((a) => a.title === title);
          const disabled = isTitleDisabled(
            title,
            existingTitles,
            winner?.user.id
          );

          return (
            <DropdownMenuItem
              key={title}
              disabled={disabled || isLoading}
              onClick={() => !disabled && setPendingAction({ title, label })}
              className={
                disabled ? "cursor-not-allowed text-muted-foreground" : ""
              }
            >
              {label}
              {existing && (
                <span className="ml-auto text-xs text-muted-foreground">
                  Assigned
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>

      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent className="max-w-[95%] font-sans sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be changed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "default" })}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Assigning..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

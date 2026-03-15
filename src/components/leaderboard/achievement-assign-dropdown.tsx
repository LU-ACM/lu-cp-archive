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

const ACHIEVEMENT_OPTIONS: {
  label: string;
  title: AchievementType;
}[] = [
  { label: "Champion", title: "CHAMPION" },
  { label: "First Runner-Up", title: "FIRST_RUNNER_UP" },
  { label: "Second Runner-Up", title: "SECOND_RUNNER_UP" },
  {
    label: "Best Female Programmer",
    title: "BEST_FEMALE_PROGRAMMER",
  },
];

export default function AchievementAssignDropdown({
  winner,
  month,
  year,
  assignedTitles,
}: {
  winner: Leaderboard;
  month: number;
  year: number;
  assignedTitles: AchievementType[] | [];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [existingTitles, setExistingTitles] = useState<AchievementType[]>(
    assignedTitles ?? []
  );
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
      setExistingTitles((prev) => [...prev, pendingAction.title]);
    }
  }

  return (
    <>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACHIEVEMENT_OPTIONS.map(({ label, title }) => {
          const alreadyExists = existingTitles.includes(title);
          return (
            <DropdownMenuItem
              key={title}
              disabled={alreadyExists || isLoading}
              onClick={() =>
                !alreadyExists && setPendingAction({ title, label })
              }
              className={
                alreadyExists ? "cursor-not-allowed text-muted-foreground" : ""
              }
            >
              {label}
              {alreadyExists && (
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

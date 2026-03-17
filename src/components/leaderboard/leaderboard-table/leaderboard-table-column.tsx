import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Leaderboard } from "@/utils/schema/leaderboard";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import AchievementAssignDropdown, {
  type AssignedAchievement,
} from "../achievement-assign-dropdown";
import LBAchievementBadge from "../lb-achievement-badge";
import { type achievements } from "@prisma/client";

const baseColumns = (
  achievements: achievements[]
): ColumnDef<Leaderboard>[] => [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => {
      return <div className="font-mono font-medium">{row.original.rank}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-2">
          <span>{user.name}</span>
          <LBAchievementBadge
            className="items-start"
            achievements={achievements}
            winner={row.original}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "userId",
    header: "User Id",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <Link href={`/profile/@${user.user_name}`}>
          <Badge
            variant="secondary"
            className="w-fit max-w-full truncate px-2 text-xs hover:scale-[1.02]"
          >
            @{user.user_name}
          </Badge>
        </Link>
      );
    },
  },
  {
    id: "points",
    header: "Points",
    cell: ({ row }) => {
      return (
        <div className="font-mono font-medium">{row.original.total_points}</div>
      );
    },
  },
];

export const leaderboard_table_column = (
  canAssignAchievements: boolean,
  existingTitles: AssignedAchievement[],
  onAssigned: (achievement: AssignedAchievement) => void,
  month: number,
  year: number,
  achievements: achievements[]
): ColumnDef<Leaderboard>[] => {
  const actionsColumn: ColumnDef<Leaderboard> = {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const winner = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <AchievementAssignDropdown
            winner={winner}
            month={month}
            year={year}
            existingTitles={existingTitles}
            onAssigned={onAssigned}
          />
        </DropdownMenu>
      );
    },
  };

  return [
    ...baseColumns(achievements),
    ...(canAssignAchievements ? [actionsColumn] : []),
  ];
};

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { type CFProblem } from "@/types/types";
import { getDifficultyColorWithBG } from "../cf-ladder-helper";
import {
  ApproveCFProblem,
  CFProblemEditModal,
  DeleteCFproblemModal,
} from "./cf-problem-table-column-components";

export const cf_problem_columns: ColumnDef<CFProblem>[] = [
  {
    id: "serial",
    header: "No",
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const problem = row.original;
      return (
        <Link href={problem.url} target="_blank" className="font-medium">
          {problem.title}
        </Link>
      );
    },
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.difficulty_level}</div>;
    },
  },
  {
    accessorKey: "addedBy",
    header: "Added By",
    cell: ({ row }) => {
      return (
        <Link href={`/profile/@${row.original.added_by}`}>
          <Badge
            variant="secondary"
            className="w-fit max-w-full truncate px-2 text-xs hover:scale-[1.02]"
          >
            @{row.original.added_by}
          </Badge>
        </Link>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const problem = row.original;

      return (
        <div className="flex items-center gap-2">
          <DeleteCFproblemModal
            problem_id={problem.id}
            revalidateKey={problem.difficulty_level.toString()}
          />
          <CFProblemEditModal
            cf_problem={problem}
            revalidateKey={problem.difficulty_level.toString()}
          />
        </div>
      );
    },
  },
];

export const approve_cf_problem_columns: ColumnDef<CFProblem>[] = [
  {
    id: "serial",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const problem = row.original;
      return (
        <Link href={problem.url} target="_blank" className="font-medium">
          {problem.title}
        </Link>
      );
    },
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    cell: ({ row }) => {
      return (
        <Badge
          className={`pointer-events-none ${getDifficultyColorWithBG(row.original.difficulty_level)}`}
        >
          {row.original.difficulty_level}
        </Badge>
      );
    },
  },
  {
    accessorKey: "addedBy",
    header: "Submitted By",
    cell: ({ row }) => {
      return (
        <Link href={`/profile/@${row.original.added_by}`}>
          <Badge
            variant="secondary"
            className="w-fit max-w-full truncate px-2 text-xs hover:scale-[1.02]"
          >
            @{row.original.added_by}
          </Badge>
        </Link>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const problem = row.original;

      return (
        <div className="flex items-center gap-2">
          <DeleteCFproblemModal
            problem_id={problem.id}
            revalidateKey={problem.difficulty_level.toString()}
          />
          <CFProblemEditModal
            cf_problem={problem}
            revalidateKey="unapproved-cf-problems"
          />
          <ApproveCFProblem
            cf_problem={problem}
            revalidateKey="unapproved-cf-problems"
          />
        </div>
      );
    },
  },
];

import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { checkSolvedProblems } from "../check-problem-solved/check-solved-problems";
import { type CFProblem } from "@/types/types";
import { hasPermission } from "@/utils/permissions";
import { useStrictSession } from "@/hooks/use-strict-session";

type PaginationProps =
  | {
      showPagination: true;
      total: number;
      pageIndex: number;
      pageSize: number;
      isFetching: boolean;
      onPaginationChange: (pageIndex: number) => void;
    }
  | {
      showPagination: false;
      total?: never;
      pageIndex?: never;
      pageSize?: never;
      isFetching?: never;
      onPaginationChange?: never;
    };

interface CFProblemTableBaseProps<TData extends CFProblem, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  difficultyLevel?: number;
  cf_handle?: string;
}

type CFProblemTableProps<
  TData extends CFProblem,
  TValue,
> = CFProblemTableBaseProps<TData, TValue> & PaginationProps;

export function CFProblemTable<TValue>({
  columns,
  data,
  difficultyLevel,
  cf_handle,
  total,
  pageIndex,
  pageSize,
  isFetching,
  onPaginationChange,
  showPagination,
}: CFProblemTableProps<CFProblem, TValue>) {
  const session = useStrictSession();
  const hasMutatePermission = hasPermission(
    session.user.user_type,
    "mutate-cf-problem"
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    actions: hasMutatePermission,
  });

  const table = useReactTable({
    data,
    columns,
    ...(showPagination && {
      pageCount: Math.ceil(total! / pageSize!),
      manualPagination: true,
      onPaginationChange: (updater) => {
        const newState =
          typeof updater === "function"
            ? updater({ pageIndex: pageIndex!, pageSize: pageSize! })
            : updater;
        onPaginationChange!(newState.pageIndex);
      },
    }),
    state: {
      columnVisibility,
      ...(showPagination && {
        pagination: { pageIndex: pageIndex!, pageSize: pageSize! },
      }),
    },
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
  });

  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());

  // for check solved cf problems
  useEffect(() => {
    async function solvedProblemSetHandler(
      cf_handle: string,
      difficultyLevel: number
    ) {
      const result = await checkSolvedProblems(
        difficultyLevel,
        data,
        cf_handle
      );
      setSolvedProblems(result);
    }
    if (cf_handle && difficultyLevel) {
      solvedProblemSetHandler(cf_handle, difficultyLevel);
    }
  }, [data, difficultyLevel, cf_handle]);

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isSolved = solvedProblems.has(row.original.id);
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={isSolved ? "bg-green-500 dark:bg-green-600" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="flex justify-self-end py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  aria-disabled={!table.getCanPreviousPage()}
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: table.getPageCount() }).map((_, index) => {
                const isActive =
                  index === table.getState().pagination.pageIndex;

                return (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={isActive}
                      onClick={() => table.setPageIndex(index)}
                      className="cursor-pointer"
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  aria-disabled={!table.getCanNextPage()}
                  className={
                    !table.getCanNextPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

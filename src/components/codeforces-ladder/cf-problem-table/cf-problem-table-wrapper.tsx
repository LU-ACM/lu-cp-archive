"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CFProblemTable } from "./cf-problem-table";
import { cf_problem_columns } from "./cf-problem-table-columns";
import { getCFProblemsByDifficulty } from "../../../app/dashboard/codeforces-ladder/cf-ladder-actions";
import { unwrapActionResult } from "@/utils/error-helper";
import Error from "@/components/shared/error";
import Loading from "@/components/shared/loading";
import { useStrictSession } from "@/hooks/use-strict-session";
import { getUserById } from "@/components/shared-actions/actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CFProblemTableWrapper({
  difficultyLevel,
}: {
  difficultyLevel: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const session = useStrictSession();

  const pageIndex = Number(searchParams.get("page") ?? 1) - 1;
  const pageSize = Number(searchParams.get("pageSize") ?? 50);

  function handlePaginationChange(newPageIndex: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (newPageIndex + 1).toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  const {
    data: cfProblemData,
    isLoading,
    isPlaceholderData,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [difficultyLevel.toString(), pageIndex, pageSize],
    queryFn: async () => {
      const result = await getCFProblemsByDifficulty(
        difficultyLevel,
        pageIndex,
        pageSize
      );
      return unwrapActionResult(result);
    },
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  });

  const { data: userData } = useQuery({
    queryKey: ["user-data"],
    queryFn: async () => {
      const result = await getUserById(session.user.id);
      return unwrapActionResult(result);
    },
    staleTime: Infinity,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !cfProblemData) {
    if (!cfProblemData) {
      return <Error message={error?.message} refetch={refetch} />;
    }
  }

  return (
    <CFProblemTable
      columns={cf_problem_columns}
      data={cfProblemData?.data ?? []}
      total={cfProblemData?.total ?? 0}
      pageIndex={pageIndex}
      pageSize={pageSize}
      isFetching={isPlaceholderData}
      onPaginationChange={handlePaginationChange}
      difficultyLevel={difficultyLevel}
      cf_handle={userData?.cf_handle ?? undefined}
    />
  );
}

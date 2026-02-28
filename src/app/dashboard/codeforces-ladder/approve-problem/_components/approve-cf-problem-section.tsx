"use client";

import { useQuery } from "@tanstack/react-query";
import { unwrapActionResult } from "@/utils/error-helper";
import Loading from "@/components/shared/loading";
import Error from "@/components/shared/error";
import { approve_cf_problem_columns } from "@/components/codeforces-ladder/cf-problem-table/cf-problem-table-columns";
import { getUnapprovedCFProblems } from "../approve-cf-actions";
import { CFProblemTable } from "@/components/codeforces-ladder/cf-problem-table/cf-problem-table";

export default function ApproveCFProblemSection() {
  const {
    data: unapprovedCFproblems,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["unapproved-cf-problems"],
    queryFn: async () => {
      const result = await getUnapprovedCFProblems();
      return unwrapActionResult(result);
    },
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return <Error refetch={refetch} message={error.message} />;
  }

  return (
    <div>
      <div className="mb-4">
        <CFProblemTable
          columns={approve_cf_problem_columns}
          data={unapprovedCFproblems}
          showPagination={false}
        />
      </div>
    </div>
  );
}

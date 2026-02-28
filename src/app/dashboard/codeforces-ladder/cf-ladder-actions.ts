"use server";

import { isActionError, type ActionResult } from "@/utils/error-helper";
import {
  CFDifficultyLevelsSchema,
  CFProblemFormSchema,
  CFProblemSchema,
} from "@/utils/schema/cf-problem";
import { prisma } from "@/lib/prisma";
import { type CFProblem } from "@/types/types";
import { z } from "zod";
import { getUserData } from "@/components/shared-actions/actions";
import { hasPermission } from "@/utils/permissions";

async function getCFProblemsByDifficulty(
  difficultyLevel: number,
  page: number = 0,
  pageSize: number = 50
): Promise<ActionResult<{ data: CFProblem[]; total: number }>> {
  const validationDifficulty = CFDifficultyLevelsSchema.safeParse({
    difficulty: difficultyLevel,
  });

  if (validationDifficulty.error) {
    return { error: "Invalid difficulty level" };
  }

  try {
    const [rawCFProblems, total] = await prisma.$transaction([
      prisma.cf_problems.findMany({
        where: { difficulty_level: difficultyLevel, approved: true },
        orderBy: { created_at: "asc" },
        skip: page * pageSize,
        take: pageSize,
        include: { addedBy: { select: { user_name: true } } },
      }),
      prisma.cf_problems.count({
        where: { difficulty_level: difficultyLevel, approved: true },
      }),
    ]);

    const cfProblems = rawCFProblems.map((problem) => ({
      ...problem,
      added_by: problem.addedBy.user_name,
    }));

    const validateData = z.array(CFProblemSchema).safeParse(cfProblems);
    if (validateData.error) {
      return { error: "Invalid codeforces problem data" };
    }

    return { data: { data: cfProblems, total } };
  } catch (err) {
    console.error("Error fetching codeforces problems:", err);
    return { error: "Failed to fetch codeforces problems" };
  }
}

async function submitCFProblem(data: {
  title: string;
  url: string;
  difficulty_level: number;
}) {
  const validateData = CFProblemFormSchema.safeParse(data);

  if (validateData.error) {
    return { error: "Invalid data type" };
  }

  const user = await getUserData();

  if (isActionError(user)) {
    return { error: user.error };
  }

  const hasSubmitPermission = hasPermission(
    user.user_type,
    "submit-cf-problem"
  );

  if (!hasSubmitPermission) {
    return { error: "You do not have permission to submit a problem" };
  }

  try {
    await prisma.cf_problems.create({
      data: {
        title: data.title,
        url: data.url,
        difficulty_level: data.difficulty_level,
        added_by: user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting problem:", error);
    return { error: "Failed to submit problem" };
  }
}

async function getUnapprovedCFProblemCount() {
  const count = await prisma.cf_problems.count({
    where: {
      approved: false,
    },
  });
  return count;
}

async function updateCFProblem(
  data: {
    title: string;
    url: string;
    difficulty_level: number;
  },
  problem_id: string
) {
  const validateData = CFProblemFormSchema.safeParse(data);

  if (validateData.error) {
    return { error: "Invalid data type" };
  }

  const user = await getUserData();

  if (isActionError(user)) {
    return { error: user.error };
  }

  const hasSubmitPermission = hasPermission(
    user.user_type,
    "mutate-cf-problem"
  );

  if (!hasSubmitPermission) {
    return { error: "You do not have permission to edit a problem" };
  }

  try {
    await prisma.cf_problems.update({
      where: { id: problem_id },
      data: {
        title: data.title,
        url: data.url,
        difficulty_level: data.difficulty_level,
        added_by: user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting problem:", error);
    return { error: "Failed to submit problem" };
  }
}

async function deleteCFProblem(problemId: string) {
  const user = await getUserData();

  if (isActionError(user)) {
    return { error: user.error };
  }

  const hasDeletePermission = hasPermission(user.user_type, "mutate-problem");

  if (!hasDeletePermission) {
    return { error: "You do not have permission to delete a problem" };
  }

  try {
    await prisma.cf_problems.delete({
      where: {
        id: problemId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting problem:", error);
    return { error: `Failed to deleting problems` };
  }
}

export {
  getCFProblemsByDifficulty,
  submitCFProblem,
  getUnapprovedCFProblemCount,
  updateCFProblem,
  deleteCFProblem,
};

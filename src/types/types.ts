import { type CFProblemSchema } from "@/utils/schema/cf-problem";
import { type ContestSchema } from "@/utils/schema/contest";
import { type ProblemSchema } from "@/utils/schema/problem";
import { type TopicSchema } from "@/utils/schema/topic";
import { z } from "zod";

// User Types
export type USER_TYPE = "STANDARD" | "POWER" | "ADMIN";

export const DifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export type DifficultyType = z.infer<typeof DifficultySchema>;

export const ContestTypeSchema = z.enum([
  "intra_lu_contests",
  "marathon_contests",
  "short_contests",
]);

export type ContestType = z.infer<typeof ContestTypeSchema>;

export type ContestDifficulty = z.infer<typeof DifficultySchema>;

export type Contest = z.infer<typeof ContestSchema>;

export const StatusSchema = z
  .enum(["DONE", "InProgress", "SKIPPED"])
  .nullable();

export type ContestStatusType = z.infer<typeof StatusSchema>;

// Topic Types
export type Topic = z.infer<typeof TopicSchema>;

// Problem Types
export type Problem = z.infer<typeof ProblemSchema>;

export type ProblemDifficulty = z.infer<typeof DifficultySchema>;

export type ProblemStatusType = z.infer<typeof StatusSchema>;

export type ProblemProgressStats = {
  difficulty: ProblemDifficulty;
  skipped: number;
  inProgress: number;
  done: number;
  total: number;
};

export const AchievementTypeSchema = z.enum([
  "CHAMPION",
  "FIRST_RUNNER_UP",
  "SECOND_RUNNER_UP",
  "BEST_FEMALE_PROGRAMMER",
]);

export type AchievementType = z.infer<typeof AchievementTypeSchema>;

export type CFProblem = z.infer<typeof CFProblemSchema>;

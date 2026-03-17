import { type USER_TYPE } from "../types/types";

export type actions =
  | "approve-contest"
  | "approve-problem"
  | "approve-cf-problem"
  | "approve-topic"
  | "submit-problem"
  | "submit-cf-problem"
  | "submit-contest"
  | "submit-topic"
  | "mutate-problem" // edit & delete
  | "mutate-cf-problem" // edit & delete
  | "mutate-contest" // edit & delete
  | "mutate-topic" // edit & delete
  | "view-user-management"
  | "mutate-user" // can change user's information
  | "generate-leaderboard"
  | "assign-achievements";

const permissions: Record<USER_TYPE, actions[]> = {
  ADMIN: [
    "approve-contest",
    "approve-problem",
    "approve-cf-problem",
    "approve-topic",
    "submit-contest",
    "submit-problem",
    "submit-cf-problem",
    "submit-topic",
    "mutate-contest",
    "mutate-problem",
    "mutate-cf-problem",
    "mutate-topic",
    "mutate-user",
    "view-user-management",
    "generate-leaderboard",
    "assign-achievements",
  ],
  POWER: [
    "approve-contest",
    "approve-problem",
    "approve-cf-problem",
    "submit-contest",
    "submit-problem",
    "submit-cf-problem",
    "submit-topic",
    "mutate-contest",
    "mutate-problem",
    "mutate-cf-problem",
    "view-user-management",
    "assign-achievements",
  ],
  STANDARD: ["submit-contest", "submit-problem", "submit-cf-problem"],
} as const;

export function hasPermission(user_type: USER_TYPE, action: actions) {
  if (!permissions[user_type]) return false;
  return permissions[user_type].includes(action);
}

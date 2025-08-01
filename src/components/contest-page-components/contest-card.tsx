"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ArrowUpRight } from "lucide-react";
import DifficultyBadge from "../shared/difficulty-badge";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import ContestCardFooter from "./contest-card-footer";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/utils/permissions";
import { type Contest } from "@/types/types";
import Link from "next/link";
import { useStrictSession } from "@/hooks/use-strict-session";

export default function ContestCard({
  contest,
  approveContestCard,
}: {
  contest: Contest;
  approveContestCard?: boolean;
}) {
  const session = useStrictSession();

  const hasMutationPermission = hasPermission(
    session.user.user_type,
    "mutate-contest"
  );

  return (
    <Card
      className={cn(
        "flex h-full cursor-pointer flex-col justify-between transition-all duration-300 hover:border-zinc-400",
        "[&[data-card-border='SKIPPED']]:border-rose-500",
        "[&[data-card-border='InProgress']]:border-amber-500",
        "[&[data-card-border='DONE']]:border-emerald-500"
      )}
      data-card
      data-card-border={contest.status || undefined}
    >
      <CardHeader>
        <div className="flex items-start justify-between space-y-0">
          <CardTitle className="line-clamp-1 max-w-[90%] text-xl leading-tight">
            {contest.title}
          </CardTitle>
          <ArrowUpRight
            className="text-muted-foreground group-hover:text-primary"
            size={20}
          />
        </div>
        <CardDescription className="line-clamp-2 text-muted-foreground">
          {contest.description}
        </CardDescription>
        <div className="pointer-events-none">
          <DifficultyBadge difficulty={contest.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <span className="mr-1 text-xs text-muted-foreground">Added by:</span>
          <Link href={`/profile/@${contest.added_by}`}>
            <Badge
              variant="secondary"
              className="w-fit max-w-full truncate px-2 text-xs hover:scale-[1.02]"
            >
              @{contest.added_by}
            </Badge>
          </Link>
        </div>
        <div className="space-y-1">
          <span className="mr-1 text-xs text-muted-foreground">Tags:</span>
          {contest.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="mr-1 px-2 py-0 text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <Separator />
        <ContestCardFooter
          contest={contest}
          contestMutationPermission={hasMutationPermission}
          showContestStatus={!approveContestCard}
          showApproveButton={approveContestCard ?? false}
        />
      </CardContent>
    </Card>
  );
}

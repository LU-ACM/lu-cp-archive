import React from "react";
import { ArrowRight, BookOpen, CalendarDays, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LeaderboardGuide() {
  const workflows = [
    {
      title: "Weekly Routine",
      subtitle: "During the active semester",
      steps: ["Generate Leaderboard", "Update Leaderboard"],
      note: "Updates the running total for the current semester.",
      color: "bg-blue-50 text-blue-700 border-blue-200", // Optional styling
    },
    {
      title: "New Semester",
      subtitle: "First week of a new semester",
      steps: [
        "Generate Leaderboard",
        "Use only this week's data",
        "Publish Leaderboard",
      ],
      note: "Resets the score accumulation to start fresh.",
      color: "bg-amber-50 text-amber-700 border-amber-200", // Optional styling
    },
  ];

  const exampleSteps = [
    {
      date: "January 7th",
      event: "Spring Semester Begins",
      action: "Run 'New Semester' Workflow",
      explanation:
        "This clears any old data and creates the starting point for January.",
    },
    {
      date: "Jan 14th - March 30th",
      event: "Ongoing Semester",
      action: "Run 'Weekly Routine'",
      explanation: "This adds new points to the January starting scores.",
    },
    {
      date: "April 7th",
      event: "Summer Semester Begins",
      action: "Run 'New Semester' Workflow",
      explanation:
        "CRITICAL: Must use 'Use only this week's data' here. If don't, the January-March scores will carry over to April.",
    },
  ];

  return (
    <Card className="mb-6 w-full max-w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen size={20} className="text-primary" />
          Leaderboard Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Standard Workflows
          </h3>
          <div className="grid gap-3">
            {workflows.map((flow, index) => (
              <div
                key={index}
                className="rounded-lg border bg-muted/30 p-3 text-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold">{flow.title}</span>
                  <Badge
                    variant="outline"
                    className="text-xs font-normal text-rose-500"
                  >
                    {flow.subtitle}
                  </Badge>
                </div>

                <div className="mb-2 flex flex-wrap items-center gap-2 font-medium text-foreground/90">
                  {flow.steps.map((step, i) => (
                    <React.Fragment key={i}>
                      <span className="rounded-md bg-background px-2 py-1 shadow-sm ring-1 ring-inset ring-border">
                        {step}
                      </span>
                      {i < flow.steps.length - 1 && (
                        <ArrowRight
                          size={14}
                          className="text-muted-foreground"
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Running this: <span className="italic">{flow.note}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-border" />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Example Scenario: Jan to April
            </h3>
          </div>

          <div className="space-y-4 border-l pl-4">
            {exampleSteps.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">{item.date}</span>
                  <span className="text-muted-foreground">—</span>
                  <span className="font-medium text-primary">{item.event}</span>
                </div>

                <div className="text-sm">
                  <span className="font-medium">Do:</span>{" "}
                  <span className="text-foreground/80">{item.action}</span>
                </div>

                <p className="pt-2 text-xs text-muted-foreground">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

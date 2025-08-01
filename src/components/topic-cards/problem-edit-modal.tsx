"use client";

import { type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type Dispatch } from "react";
import { type z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type Problem } from "@/types/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DifficultyStatus } from "../shared/difficulty-status";
import {
  MAX_PROBLEM_TAG_LENGTH,
  ProblemFormSchema,
} from "@/utils/schema/problem";
import { updateProblem } from "@/app/dashboard/topic-wise/[topic]/problem-actions";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputList,
} from "../ui/tags-input";
import { isActionError } from "@/utils/error-helper";
import { useQueryClient } from "@tanstack/react-query";

type ProblemFormValues = z.infer<typeof ProblemFormSchema>;

export default function ProblemEditModal({
  isOpen,
  setIsOpen,
  problem,
  revalidateKey,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  problem: Problem;
  revalidateKey: string;
}) {
  const queryClient = useQueryClient();

  const form = useForm<ProblemFormValues>({
    resolver: zodResolver(ProblemFormSchema),
    defaultValues: {
      title: problem.title,
      description: problem.description,
      url: problem.url,
      tags: problem.tags,
      difficulty: problem.difficulty,
    },
  });

  const { setValue, setError } = form;

  const handleTags = (newTags: SetStateAction<string[]>) => {
    const problemTags = form.getValues("tags") || [];
    const tags = typeof newTags === "function" ? newTags(problemTags) : newTags;

    if (tags.length > MAX_PROBLEM_TAG_LENGTH) {
      setError("tags", {
        type: "manual",
        message: "Maximum 5 tags allowed",
      });
      return;
    }

    const formattedTags = tags.map((tag) =>
      tag.toLowerCase().replace(/\s+/g, "-")
    );

    setValue("tags", formattedTags, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: ProblemFormValues) => {
    const result = await updateProblem(data, problem.id, problem.topic);

    if (isActionError(result)) {
      toast.error(result.error, {
        position: "top-center",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: [revalidateKey] });
      toast.success("Problem Updated", {
        position: "top-center",
      });

      form.reset();
      setIsOpen(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !form.formState.isSubmitting) {
          form.reset();
        }
        setIsOpen(open);
      }}
    >
      <DialogContent className="max-w-[95%] font-sans sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Problem</DialogTitle>
          <DialogDescription>
            {"Make changes to the problem. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Problem Name Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter problem name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Problem Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the problem"
                      className="min-h-[100px] resize-none"
                      maxLength={ProblemFormSchema.shape.description.maxLength!}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex justify-end text-xs">
                    {form.watch("description")?.length || 0}/
                    {ProblemFormSchema.shape.description.maxLength} characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Problem Link Field */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/problem"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags Section */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagsInput
                      className="[&_input]:border-none [&_input]:outline-none [&_input]:ring-0 [&_input]:focus:border-none [&_input]:focus:ring-0 [&_input]:focus-visible:ring-0"
                      value={field.value || []}
                      onInvalid={(tag) => {
                        field.value.includes(tag)
                          ? toast.error(`${tag} already exists.`)
                          : null;
                      }}
                      onValueChange={handleTags}
                      editable
                      addOnPaste
                    >
                      <TagsInputList>
                        {field.value.map((tag) => (
                          <TagsInputItem key={tag} value={tag}>
                            {tag}
                          </TagsInputItem>
                        ))}
                        <TagsInputInput placeholder="Add tags" />
                      </TagsInputList>
                    </TagsInput>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Add at least one tag (max 5) related to the contest
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Difficulty Status Section */}
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem className="space-x-2 space-y-2">
                  <FormLabel>Difficulty Level</FormLabel>
                  <FormControl>
                    <DifficultyStatus
                      onDifficultyChange={field.onChange}
                      initialDifficulty={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

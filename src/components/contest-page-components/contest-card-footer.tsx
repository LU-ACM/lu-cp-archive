"use client";

import { Edit, Trash2 } from "lucide-react";
import { ContestStatus } from "./contest-status";
import { Button } from "../ui/button";
import { useState } from "react";
import ContestEditModal from "./contest-edit-modal";
import { DeleteModal } from "../shared/delete-modal";
import { cn } from "@/lib/utils";
import { type Contest } from "@/types/types";
import { deleteContest } from "@/app/dashboard/(contests)/contest-actions";
import { approveContest } from "@/app/dashboard/(contests)/approve-contests/[contest]/approve-contest-action";
import ApproveButton from "../shared/approve-button";

export default function ContestCardFooter({
  contest,
  contestMutationPermission,
  showContestStatus,
  showApproveButton,
}: {
  contest: Contest;
  contestMutationPermission: boolean;
  showContestStatus: boolean;
  showApproveButton: boolean;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div
    // Here e.stopPropagation() is not required because,
    // Parent <a> using target="_blank". So, only preventing default is enough
    >
      <div
        className={cn(
          "flex w-full items-center",
          contestMutationPermission ? "justify-between" : "justify-end"
        )}
      >
        {contestMutationPermission && (
          <div>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                setIsDeleteModalOpen(true);
              }}
              className="mr-2"
            >
              <Trash2 className="text-red-500" size={20} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                setIsEditModalOpen(true);
              }}
            >
              <Edit className="text-muted-foreground" size={20} />
            </Button>
          </div>
        )}
        {showContestStatus && (
          <div
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <ContestStatus
              contestType={contest.type}
              contestId={contest.id}
              contestStatus={contest.status}
            />
          </div>
        )}
        {showApproveButton && (
          <ApproveButton
            itemType="Contest"
            actionFunction={() => approveContest(contest.id)}
            revalidateKey={contest.type}
          />
        )}
      </div>
      <ContestEditModal
        contest={contest}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        revalidateKey={contest.type}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        itemType="Contest"
        actionFunction={() => deleteContest(contest.id)}
        revalidateKey={contest.type}
      />
    </div>
  );
}

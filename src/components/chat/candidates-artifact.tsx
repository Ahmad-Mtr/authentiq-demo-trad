"use client";

import { cn } from "@/lib/utils";
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactClose,
  ArtifactContent,
  ArtifactActions,
  ArtifactAction,
} from "@/components/ai-elements/artifact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DownloadIcon, UsersIcon, XIcon } from "lucide-react";
import type { ComponentProps } from "react";
import CandidateCard from "./candidate-card";

export type Candidate = {
  user_id: string;
  name?: string;
  pfp_url?: string;
  total_yoe?: number;
  skills?: string[];
  similarity?: number;
  reasoning?: string;
};

export type CandidatesArtifactProps = ComponentProps<"div"> & {
  candidates: Candidate[];
  isOpen: boolean;
  onClose: () => void;
};

export const CandidatesArtifact = ({
  candidates,
  isOpen,
  onClose,
  className,
  ...props
}: CandidatesArtifactProps) => {
  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-1/2 min-w-[400px]  transform transition-transform duration-300 ease-in",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
      {...props}
    >
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <Artifact className="h-full rounded-none border-l shadow-2xl">
        <ArtifactHeader>
          <div className="flex items-center gap-2">
            <UsersIcon className="size-5 text-primary" />
            <ArtifactTitle>Top Candidates</ArtifactTitle>
            <Badge variant="secondary" className="ml-2">
              {candidates.length} found
            </Badge>
          </div>
          <ArtifactActions>
            {/* <ArtifactAction
              tooltip="Export results"
              icon={DownloadIcon}
              onClick={() => {
                // Future: implement export
              }}
            /> */}
            <ArtifactClose onClick={onClose}>
              <XIcon className="size-4" />
            </ArtifactClose>
          </ArtifactActions>
        </ArtifactHeader>

        <ArtifactContent className="p-0">
          <ScrollArea className="h-full">
            <div className="space-y-3 p-4">
              {candidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.user_id}
                  candidate={candidate}
                  rank={index + 1}
                />
              ))}
            </div>
          </ScrollArea>
        </ArtifactContent>
      </Artifact>
    </div>
  );
};


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

export type Candidate = {
  user_id: string;
  full_name?: string;
  years_experience?: number;
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

type CandidateCardProps = {
  candidate: Candidate;
  rank: number;
};

const CandidateCard = ({ candidate, rank }: CandidateCardProps) => {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {rank}
            </div>
            <div>
              <CardTitle className="text-base">
                {candidate.full_name || `Candidate ${candidate.user_id.slice(0, 8)}`}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                ID: {candidate.user_id.slice(0, 12)}...
              </p>
            </div>
          </div>
          {candidate.similarity !== undefined && (
            <Badge variant="outline" className="text-xs">
              {Math.round(candidate.similarity * 100)}% match
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {candidate.years_experience !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Experience:</span>
            <span>{candidate.years_experience} years</span>
          </div>
        )}

        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{candidate.skills.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {candidate.reasoning && (
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Why: </span>
              {candidate.reasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

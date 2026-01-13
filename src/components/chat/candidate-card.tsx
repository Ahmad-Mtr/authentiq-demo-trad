import React from "react";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Candidate } from "./candidates-artifact";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "../ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Streamdown } from "streamdown";

type CandidateCardProps = {
  candidate: Candidate;
  rank: number;
};

const CandidateCard = ({ candidate, rank }: CandidateCardProps) => {
  return (
    <Card className="transition-shadow hover:shadow-md ">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {rank}
            </div> */}
            <div className="flex items-center justify-center ">
              <Avatar className="size-8 md:size-10 ">
                <AvatarImage src={candidate?.pfp_url} />
                <AvatarFallback className="text-sm font-semibold ">
                  {getInitials(candidate.name || "Guest User")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <CardTitle className="text-base">
                {candidate.name || `Candidate ${candidate.user_id.slice(0, 8)}`}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {candidate.total_yoe}
                </span>{" "}
                years of experience
              </p>
            </div>
          </div>
          <div className="flex max-md:flex-col-reverse md:inline-flex gap-1 max-md:items-end">
            {candidate.match_score !== undefined && (
              <Badge variant="outline" className="text-xs! font-semibold">
                {candidate.match_score.toFixed(1)}% <span className="hidden md:inline">fit</span>
              </Badge>
            )}
            <Link href={`/profile/${candidate.user_id}`} target="_blank">
              <Button variant={"default"} size={"sm"} className="text-sm!">
                Profile
                <ArrowUpRight />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* {candidate.bio && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {candidate.bio}
          </div>
        )} */}

        {candidate.reasoning && (
          <div className="rounded-md bg-muted/50 p-3">
            <div className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Why: </span>
              <Streamdown className="inline">{candidate.reasoning}</Streamdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateCard;

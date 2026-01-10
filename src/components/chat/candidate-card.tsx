import React from 'react'

import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Candidate } from './candidates-artifact';
import { Badge } from '../ui/badge';

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
                {candidate.name || `Candidate ${candidate.user_id.slice(0, 8)}`}
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
        {candidate.total_yoe !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Experience:</span>
            <span>{candidate.total_yoe} years</span>
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


export default CandidateCard
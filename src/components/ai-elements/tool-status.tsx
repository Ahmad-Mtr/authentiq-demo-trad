"use client";

import { cn } from "@/lib/utils";
import { Shimmer } from "./shimmer";
import { CheckCircleIcon, SearchIcon, SparklesIcon, LoaderIcon } from "lucide-react";
import type { ComponentProps } from "react";

export type ToolStatusProps = ComponentProps<"div"> & {
  toolName: string;
  state: "pending" | "running" | "completed";
};

const toolConfig: Record<
  string,
  { label: string; icon: typeof SearchIcon; runningText: string; completedText: string }
> = {
  extractQueryTool: {
    label: "Extracting Query",
    icon: SparklesIcon,
    runningText: "Analyzing requirements...",
    completedText: "Requirements extracted",
  },
  findCandidatesTool: {
    label: "Searching Candidates",
    icon: SearchIcon,
    runningText: "Searching for matching candidates...",
    completedText: "Search complete",
  },
  default: {
    label: "Processing",
    icon: LoaderIcon,
    runningText: "Working...",
    completedText: "Done",
  },
};

export const ToolStatus = ({
  toolName,
  state,
  className,
  ...props
}: ToolStatusProps) => {
  const config = toolConfig[toolName] || toolConfig.default;
  const Icon = config.icon;

  const isRunning = state === "pending" || state === "running";

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded-lg my-2",
        isRunning ? "bg-muted/50" : "bg-muted/30",
        className
      )}
      {...props}
    >
      {isRunning ? (
        <>
          <Icon className="size-4 text-primary animate-pulse" />
          <Shimmer className="text-sm font-medium">
            {config.runningText}
          </Shimmer>
        </>
      ) : (
        <>
          <CheckCircleIcon className="size-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {config.completedText}
          </span>
        </>
      )}
    </div>
  );
};

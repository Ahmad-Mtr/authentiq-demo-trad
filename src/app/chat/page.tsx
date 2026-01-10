"use client";

import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { Loader } from "@/components/ai-elements/loader";
import { useState, useEffect, useMemo } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInputMessage,
  PromptInput,
  PromptInputHeader,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputButton,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements/sources";
import { ToolStatus } from "@/components/ai-elements/tool-status";
import {
  CandidatesArtifact,
  type Candidate,
} from "@/components/chat/candidates-artifact";
import { RefreshCcwIcon, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import AgentGreeting from "@/components/agent-greeting";

export default function Page() {
  const [input, setInput] = useState("");
  const [artifactOpen, setArtifactOpen] = useState(false);

  const { messages, sendMessage, status, regenerate } = useChat();

  const candidates = useMemo<Candidate[]>(() => {
    let foundCandidates: Candidate[] = [];
    let reasoningMap = new Map<string, string>();

    for (const message of messages) {
      if (message.role === "assistant") {
        for (const part of message.parts) {
          if (
            part.type === "tool-findCandidatesTool" &&
            "state" in part &&
            part.state === "output-available" &&
            "output" in part &&
            Array.isArray(part.output)
          ) {
            foundCandidates = part.output as Candidate[];
          }

          if (
            part.type === "tool-addReasoningTool" &&
            "state" in part &&
            part.state === "output-available" &&
            "output" in part &&
            Array.isArray(part.output)
          ) {
            const reasoningData = part.output as Array<{ user_id: string; reasoning: string }>;
            reasoningData.forEach((r) => {
              reasoningMap.set(r.user_id, r.reasoning);
            });
          }
        }
      }
    }

    if (foundCandidates.length > 0) {
      return foundCandidates.map((candidate) => ({
        ...candidate,
        reasoning: reasoningMap.get(candidate.user_id) || candidate.reasoning,
      }));
    }

    return foundCandidates;
  }, [messages]);

  useEffect(() => {
    // open artfiact only when candidates have reasoning
    const hasReasoning = candidates.some((c) => c.reasoning);
    if (candidates.length > 0 && hasReasoning && !artifactOpen) {
      setArtifactOpen(true);
    }
  }, [candidates, artifactOpen]);
  
  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage({
      text: message.text || "Sent with attachments",
      files: message.files,
    });
    setInput("");
  };

  return (
    <div className="flex h-screen w-full">
      {/* chat area */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          artifactOpen ? "mr-[50%]" : ""
        )}
      >
        <div className={cn("mx-auto p-6 relative size-full h-screen", artifactOpen ? "max-w-2xl" : "max-w-4xl")}>
          <div
            className={cn(
              "flex flex-col h-full",
              messages.length === 0 && "justify-center"
            )}
          >
        <Conversation
          className={cn(messages.length === 0 ? "hidden" : "h-full")}
        >
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "assistant" &&
                  message.parts.filter((part) => part.type === "source-url")
                    .length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={
                          message.parts.filter(
                            (part) => part.type === "source-url"
                          ).length
                        }
                      />
                      {message.parts
                        .filter((part) => part.type === "source-url")
                        .map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              key={`${message.id}-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          </SourcesContent>
                        ))}
                    </Sources>
                  )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Message key={`${message.id}-${i}`} from={message.role}>
                          <MessageContent className="group-[.is-user]:bg-foreground/7 ">
                            <MessageResponse>{part.text}</MessageResponse>
                          </MessageContent>
                          {message.role === "assistant" &&
                            i === messages.length - 1 && (
                              <MessageActions>
                                <MessageAction
                                  onClick={() => regenerate()}
                                  label="Retry"
                                >
                                  <RefreshCcwIcon className="size-3" />
                                </MessageAction>
                                <MessageAction
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                  label="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </MessageAction>
                              </MessageActions>
                            )}
                        </Message>
                      );
                    case "reasoning":
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={
                            status === "streaming" &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      if (part.type.startsWith("tool-") && "state" in part) {
                        const toolName = part.type.replace("tool-", "");
                        const toolState =
                          part.state === "output-available"
                            ? "completed"
                            : part.state === "input-available"
                              ? "running"
                              : "pending";
                        return (
                          <ToolStatus
                            key={`${message.id}-${i}`}
                            toolName={toolName}
                            state={toolState}
                          />
                        );
                      }
                      return null;
                  }
                })}
              </div>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {messages.length === 0 && <AgentGreeting />}

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4 "
          globalDrop
          multiple
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder={
                messages.length === 0
                  ? "Paste your job description"
                  : "Describe the role you're hiring for..."
              }
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
          </div>
        </div>
      </div>

      {/* THE THING */}
      <CandidatesArtifact
        candidates={candidates}
        isOpen={artifactOpen}
        onClose={() => setArtifactOpen(false)}
      />
    </div>
  );
}

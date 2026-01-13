"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_CHARS = 256;

interface PostComposerProps {
  onSubmit: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function PostComposer({ onSubmit, isLoading }: PostComposerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");

  const charsRemaining = MAX_CHARS - content.length;
  const isOverLimit = charsRemaining < 0;
  const isEmpty = content.trim().length === 0;

  const handleSubmit = async () => {
    if (isEmpty || isOverLimit || isLoading) return;

    try {
      await onSubmit(content.trim());
      setContent("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* FAB */}
      <Button
        onClick={() => setIsOpen(true)}
        size="icon-lg"
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg hover:shadow-xl transition-shadow md:bottom-8 md:right-8"
      >
        <Plus className="size-6" />
      </Button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Create Post
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[120px] resize-none text-base"
              autoFocus
            />

            <div className="flex items-center justify-between py-3">
              <span
                className={cn(
                  "text-sm tabular-nums transition-colors",
                  charsRemaining <= 20
                    ? charsRemaining < 0
                      ? "text-destructive font-medium"
                      : "text-amber-500"
                    : "text-muted-foreground"
                )}
              >
                {charsRemaining}
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isEmpty || isOverLimit || isLoading}
                >
                  {isLoading ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> to post
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

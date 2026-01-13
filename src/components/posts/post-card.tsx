"use client";

import { Post } from "@/lib/interfaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string, isLiked: boolean) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
}: PostCardProps) {
  const isOwner = currentUserId === post.user_id;
  const initials = post.author_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

  return (
    <Card className="w-full border-border/50 hover:border-border transition-colors">
      <CardContent className="py-2 px-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Link href={`/profile/${post.user_id}`}>
            <Avatar className="size-10 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={post.author_pfp_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Link
                  href={`/profile/${post.user_id}`}
                  className="font-semibold text-foreground hover:underline truncate"
                >
                  {post.author_name || "Anonymous"}
                </Link>
                <span className="text-muted-foreground text-sm shrink-0">
                  · {timeAgo}
                </span>
              </div>

              {isOwner && onDelete && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>

            {/* Content */}
            <p className="mt-2 text-foreground whitespace-pre-wrap wrap-break-word">
              {post.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 mt-3 -ml-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10",
                  post.is_liked_by_user && "text-rose-500"
                )}
                onClick={() => onLike(post.id, post.is_liked_by_user)}
              >
                <Heart
                  className={cn(
                    "size-4 transition-all",
                    post.is_liked_by_user && "fill-current"
                  )}
                />
                <span className="text-sm tabular-nums">{post.like_count}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

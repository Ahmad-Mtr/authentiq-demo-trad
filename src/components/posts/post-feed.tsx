"use client";

import { useEffect } from "react";
import { usePostsStore } from "@/lib/stores/postsStore";
import { PostCard } from "./post-card";
import { Skeleton } from "@/components/ui/skeleton";

interface PostFeedProps {
  currentUserId?: string;
  filterByUserId?: string;
}

export function PostFeed({ currentUserId, filterByUserId }: PostFeedProps) {
  const { posts, isLoading, error, fetchPosts, toggleLike, deletePost } =
    usePostsStore();

  useEffect(() => {
    fetchPosts(currentUserId);
  }, [currentUserId, fetchPosts]);

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!currentUserId) return;
    await toggleLike(postId, currentUserId, isLiked);
  };

  const handleDelete = async (postId: string) => {
    if (!currentUserId) return;
    await deletePost(postId);
  };

  const displayedPosts = filterByUserId
    ? posts.filter((p) => p.user_id === filterByUserId)
    : posts;

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <button
          onClick={() => fetchPosts(currentUserId)}
          className="text-primary hover:underline mt-2"
        >
          Try again
        </button>
      </div>
    );
  }

  if (displayedPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No posts yet</p>
        <p className="text-muted-foreground/70 text-sm mt-1">
          Be the first to share something!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onLike={handleLike}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

function PostCardSkeleton() {
  return (
    <div className="border border-border/50 rounded-xl p-4">
      <div className="flex gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="pt-2">
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

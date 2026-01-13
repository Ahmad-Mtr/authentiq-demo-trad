"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { useProfileStore } from "@/lib/stores/profileStore";
import { usePostsStore } from "@/lib/stores/postsStore";
import { profileAPI } from "@/lib/supabase/profile";
import { PostFeed, PostComposer } from "@/components/posts";
import ProfileOnboarding from "@/components/profile/profile-onboarding";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User } from "lucide-react";

export function FeedContainer() {
  const router = useRouter();
  const {
    profile,
    isLoading: profileLoading,
    hasChecked,
    setProfile,
    setLoading,
    setHasChecked,
  } = useProfileStore();
  const { createPost } = usePostsStore();

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndProfile();
  }, []);

  const checkAuthAndProfile = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user:", userError);
        router.push("/login");
        return;
      }

      setUserId(user.id);

      // Check if profile exists
      const existingProfile = await profileAPI.getProfileByUserId(user.id);

      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        setProfile(null);
      }

      setHasChecked(true);
    } catch (error) {
      console.error("Error checking auth/profile:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (content: string) => {
    if (!userId || !profile) return;
    await createPost(userId, content, profile.name, profile.pfp_url || null);
  };

  if (profileLoading || !hasChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return <ProfileOnboarding />;
  }

  const initials = profile.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="w-full flex items-center justify-between py-1 px-4 md:px-8 ">
          <h1 className="text-2xl! font-raleway font-semibold">authentiq</h1>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="size-10 md:size-12">
                <AvatarImage src={profile.pfp_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm  md:text-base font-medium">
                  {initials || <User className="size-4" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-2  md:border-l md:border-r rounded-sm h-full min-h-screen">
        <PostFeed currentUserId={userId || undefined} />
      </main>

      <PostComposer onSubmit={handleCreatePost} />
    </div>
  );
}

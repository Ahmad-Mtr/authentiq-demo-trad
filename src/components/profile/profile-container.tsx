"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/stores/profileStore";
import { profileAPI } from "@/lib/supabase/profile";
import supabase from "@/lib/supabase";
import { ProfileSidebar } from "./profile-sidebar";
import { ProfileTabs } from "./profile-tabs";
import ProfileOnboarding from "./profile-onboarding";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils";
import { useBrowser } from "@/lib/hooks/useBrowser";

export function ProfileContainer() {
  const router = useRouter();
  const {
    profile,
    isLoading,
    hasChecked,
    setProfile,
    setLoading,
    setHasChecked,
  } = useProfileStore();
  const { isDesktop, isChromium } = useBrowser();

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      setLoading(true);

      // Get current user from Supabase
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user:", userError);
        router.push("/login");
        return;
      }

      // Check if profile exists
      const existingProfile = await profileAPI.getProfileByUserId(user.id);

      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        setProfile(null);
      }

      setHasChecked(true);
    } catch (error) {
      console.error("Error checking profile:", error);
      // If user is not authenticated, redirect to login
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !hasChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) return <ProfileOnboarding />;

  return (
    <div className="min-h-screen flex flex-col  md:flex-row items-center justify-center ">
      <div className="  flex md:flex-3/10 flex-col items-center h-full w-full   p-6 ">
        <ProfileSidebar profile={profile} />
      </div>

      <div className="hidden md:block border border-border min-h-screen"></div>

      <div
        className={cn(
          "md:flex-7/10  w-full md:max-h-screen md:overflow-scroll md:overflow-x-hidden  shadow-lg md:p-6",
          isChromium && isDesktop ? "md:px-10" : ""
        )}
      >
        <ProfileTabs profile={profile} />
      </div>
    </div>
  );
}

"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/stores/profileStore";
import { profileAPI } from "@/lib/appwrite/profile";
import { account } from "@/lib/appwrite";
import { ProfileSidebar } from "./profile-sidebar";
import { ProfileTabs } from "./profile-tabs";
import ProfileOnboarding from "./profile-onboarding";
import { useAuthStore } from "@/lib/stores/authStore";

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

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      setLoading(true);

      // Get current user
      const user = await account.get();

      // Check if profile exists
      const existingProfile = await profileAPI.getProfileByUserId(user.$id);

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
    <div className="flex flex-col md:flex-row min-h-screen items-center justify-center bg-background">
      <ProfileSidebar profile={profile} />
      <ProfileTabs profile={profile} />
    </div>
  );
}

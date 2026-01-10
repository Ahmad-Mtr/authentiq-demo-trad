"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Profile } from "@/lib/interfaces";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import ProfileResume from "./profile-resume";

interface ProfileTabsProps {
  profile: Profile;
  /** Whether the current user is viewing their own profile */
  isOwnProfile?: boolean;
}

export function ProfileTabs({ profile, isOwnProfile = true }: ProfileTabsProps) {
  const router = useRouter();
  const { logOut } = useAuthStore();

  const handleLogout = async () => {
    await logOut();
    router.push("/login");
  };

  return (
    <section className="flex md:flex-2 2xl:flex-3 md:h-screen w-full flex-col items-center justify-between sm:items-start ">
      <Tabs defaultValue="home" className="w-full">

        {/* Profile Body Tab bar */}
        <div className="flex justify-between font-mono w-full h-auto px-4 border-b-2 border-border ">
          
          <TabsList className="px-1 md:px-7 space-x-3 py-6  bg-background">
            <TabsTrigger
              className="text-xs md:text-lg font-semibold py-4 px-2 md:px-5 data-[state=active]:text-foreground text-muted-foreground"
              value="home"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              className="text-xs md:text-lg font-semibold py-4 px-2 md:px-5 data-[state=active]:text-foreground text-muted-foreground"
              value="resume"
            >
              Resume
            </TabsTrigger>
          </TabsList>

            {isOwnProfile && (
              <Button variant="outline" size="lg" className="hidden md:block my-auto" onClick={handleLogout}>Logout</Button>
            )}
        </div>


        <TabsContent value="home" className="w-full py-8 px-16">See Posts here.</TabsContent>
        <TabsContent value="resume" className="w-full py-8 px-8 md:px-16">
            <Suspense fallback={<div>Loading profile...</div>}>
              <ProfileResume profile={profile}/>
            </Suspense>
        </TabsContent>
      </Tabs>
    </section>
  );
}

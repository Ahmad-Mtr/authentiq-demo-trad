"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Profile } from "@/lib/interfaces";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

interface ProfileTabsProps {
  profile: Profile;
}

export function ProfileTabs({ profile }: ProfileTabsProps) {
  const router = useRouter();
  const { logOut } = useAuthStore();

  const handleLogout = async () => {
    await logOut();
    router.push("/login");
  };

  return (
    <section className="flex md:flex-2 2xl:flex-3 md:h-screen w-full flex-col items-center justify-between sm:items-start">
      <Tabs defaultValue="home" className="w-full">

        {/* Profile Body Tab bar */}
        <div className="flex justify-between font-mono w-full h-auto p-4 border-b-2 border-border">
          <TabsList className="px-12 py-6 space-x-3 bg-background">
            <TabsTrigger
              className="text-lg font-semibold py-4 px-5 data-[state=active]:text-foreground text-muted-foreground"
              value="home"
            >
              Home
            </TabsTrigger>
            <TabsTrigger
              className="text-lg font-semibold py-4 px-5 data-[state=active]:text-foreground text-muted-foreground"
              value="account"
            >
              Resume
            </TabsTrigger>
          </TabsList>

            <Button variant="outline" size="lg" className="my-auto" onClick={handleLogout}>Logout</Button>
        </div>


        <TabsContent value="home">See your Posts here.</TabsContent>
        <TabsContent value="account">
          <div className="w-full py-32 px-16">
            <Suspense fallback={<div>Loading profile...</div>}>
              <div className="txt-title">Resume</div>
              <Button onClick={handleLogout}>Logout</Button>
              {profile && (
                <div>
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <p className="text-foreground/75">{profile.role}</p>
                  <p className="text-muted-foreground text-sm">
                    {profile.email}
                  </p>
                </div>
              )}
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

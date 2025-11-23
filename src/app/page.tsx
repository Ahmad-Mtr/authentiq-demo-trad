"use client";

import Image from "next/image";

import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";

import { useAuthStore } from "@/lib/stores/authStore";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { profileAPI } from "@/lib/appwrite/profile";

import { account } from "@/lib/appwrite";

import { Suspense, useEffect, useState } from "react";

import { useProfileStore } from "@/lib/stores/profileStore";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { getInitials } from "@/lib/utils";

import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Input } from "@/components/ui/input";

import { Label } from "@radix-ui/react-label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const router = useRouter();

  const {
    profile,

    isLoading,

    hasChecked,

    setProfile,

    setLoading,

    setHasChecked,
  } = useProfileStore();

  const { user, logOut } = useAuthStore();

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      setLoading(true);

      // Get current user

      const user = await account.get();

      setCurrentUser(user);

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

  const handleLogout = async () => {
    await logOut();

    router.push("/login");
  };

  if (isLoading || !hasChecked) {
    return <div>22Loading...</div>;
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen items-center justify-center bg-background">
      <main className="flex md:flex-1 md:h-screen w-full  flex-col items-center justify-center py-32 px-16  border-r-2 border-border sm:items-start space-y-6">
        {/* avatar */}

        <div className="*:data-[slot=avatar]:ring-ring/60 *:data-[slot=avatar]:ring-2  w-full flex justify-center ">
          <Avatar className="w-32 h-32 rounded-4xl">
            <AvatarImage src={profile?.profilePictureUrl} />

            <AvatarFallback className="text-5xl rounded-4xl ">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name & Handle */}

        <div className="flex justify-center w-full flex-col items-center space-y-1 mt-2 text-center">
          <h1 className="txt-idk">{profile.name}</h1>

          <span className="text-muted-foreground">{profile.email}</span>
        </div>

        {/* Role & bio */}

        <div className="flex justify-center w-full flex-col items-center text-center space-y-2 mt-12 mb-24">
          <h1 className="txt-idk max-w-md">{profile.role}</h1>

          <p className="text-muted-foreground text-xl max-w-md line-clamp-3">
            {profile.bio}
          </p>
        </div>

        {/* Connect btn */}

        <Button size={"main"} className="w-full! h-16 text-lg  ">
          Connect
        </Button>
      </main>

      <section className="flex md:flex-2  2xl:flex-3 md:h-screen w-full  flex-col items-center justify-between   sm:items-start">
        <Tabs defaultValue="home" className="w-full">
          <div className="font-mono w-full h-auto p-4 border-b-2 border-border">
            <TabsList className=" px-12 py-6 space-x-3 bg-background">
              <TabsTrigger
                className="text-lg font-semibold py-4 px-5 data-[state=active]:text-foreground text-muted-foreground"
                value="home"
              >
                Home
              </TabsTrigger>{" "}
              <TabsTrigger
                className="text-lg font-semibold py-4 px-5 data-[state=active]:text-foreground text-muted-foreground"
                value="account"
              >
                Resume
              </TabsTrigger>
            </TabsList>
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
    </div>
  );
}

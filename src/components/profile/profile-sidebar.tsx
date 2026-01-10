"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import { Profile } from "@/lib/interfaces";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import router from "next/router";
import { useBrowser } from "@/lib/hooks/useBrowser";

interface ProfileSidebarProps {
  profile: Profile;
  /** Whether the current user is viewing their own profile */
  isOwnProfile?: boolean;
}

export function ProfileSidebar({ profile, isOwnProfile = true }: ProfileSidebarProps) {
  const { logOut } = useAuthStore();
  const { isChromium, isDesktop } = useBrowser();

  const handleLogout = async () => {
    await logOut();
    router.push("/login");
  };
  return (
    <main className={cn(isDesktop && isChromium ? "px-6" : "")}>
      {/* Profile info */}
      <div className="flex  flex-col items-start md:items-center w-full ">
        {/* Avatar & Logout */}
        <div className="flex justify-between md:justify-center w-full">
          <div className="*:data-[slot=avatar]:ring-ring/60 *:data-[slot=avatar]:ring-2">
            <Avatar className="size-24 md:size-32 rounded-4xl">
              <AvatarImage src={profile?.pfp_url} />
              <AvatarFallback className="text-3xl md:text-5xl rounded-4xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {isOwnProfile && (
            <Button
              variant="outline"
              size="lg"
              className="md:hidden my-auto"
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </div>

        {/* Name, Email & Location */}
        <div className="flex flex-col items-start md:items-center text-left md:text-center ">
          <span className="text-muted-foreground text-sm pt-5 ">
            {profile.location}
          </span>
          <h1 className="txt-idk md:text-2xl!  mt-2!">{profile.name}</h1>
        </div>

        {/* Role & Bio */}
        <div className="flex flex-col items-start md:items-center text-center   pt-10 md:pt-12">
          <h2 className="txt-idk text-2xl md:text-3xl font-medium ">
            {profile.role}
          </h2>
          <p className="text-muted-foreground text-base md:text-sm leading-normal max-w-md md:max-w-sm text-justify md:text-center ">
            {profile.bio}
          </p>
        </div>

        {/* Connect button */}
        <div className="w-full mt-8">
          <Button size={"main" as any} className="w-full! md:h-16 text-lg">
            <Link
              href={`mailto:${profile.email}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

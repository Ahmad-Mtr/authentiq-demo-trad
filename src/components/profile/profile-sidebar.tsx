"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { Profile } from "@/lib/interfaces";
import Link from "next/link";

interface ProfileSidebarProps {
  profile: Profile;
}

export function ProfileSidebar({ profile }: ProfileSidebarProps) {
  return (
    <main className="flex md:flex-1 md:h-screen w-full flex-col items-center justify-center py-16 px-16 border-r-2 border-border">
      {/* Profile info */}
      <div className="flex flex-col items-center w-full space-y-8 pt-20">
        {/* Avatar */}
        <div className="*:data-[slot=avatar]:ring-ring/60 *:data-[slot=avatar]:ring-2">
          <Avatar className="w-32 h-32 rounded-4xl">
            <AvatarImage src={profile?.pfp_url} />
            <AvatarFallback className="text-5xl rounded-4xl">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name, Email & Location */}
        <div className="flex flex-col items-center text-center ">
          <h1 className="txt-idk">{profile.name}</h1>
          <span className="text-muted-foreground text-sm">{profile.location}</span>
        </div>

        {/* Role & Bio */}
        <div className="flex flex-col items-center text-center space-y-3 max-w-md mt-10">
          <h2 className="txt-idk">{profile.role}</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            {profile.bio}
          </p>
        </div>

        {/* Connect button */}
        <div className="w-full mt-8">
          <Button size={"main" as any} className="w-full! h-16 text-lg">
            <Link href={`mailto:${profile.email}`} target="_blank" rel="noopener noreferrer">
              Contact
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
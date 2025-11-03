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
    <main className="flex md:flex-1 md:h-screen w-full flex-col items-center justify-center py-32 px-16 border-r-2 border-border sm:items-start space-y-6">
      {/* avatar */}
      <div className="*:data-[slot=avatar]:ring-ring/60 *:data-[slot=avatar]:ring-2 w-full flex justify-center">
        <Avatar className="w-32 h-32 rounded-4xl">
          <AvatarImage src={profile?.profilePictureUrl} />
          <AvatarFallback className="text-5xl rounded-4xl">
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
      <Button size={"main" as any} className="w-full! h-16 text-lg">
       <Link href={`mailto:${profile.email}`} target="_blank" rel="noopener noreferrer">
        Contact
       </Link>
      </Button>
    </main>
  );
}
0
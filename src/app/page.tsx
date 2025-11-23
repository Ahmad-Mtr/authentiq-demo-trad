import { ProfileContainer } from "@/components/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Authentiq",
  description: "View your professional profile",
};

export default function Home() {
  return (
      <ProfileContainer />
  );
}
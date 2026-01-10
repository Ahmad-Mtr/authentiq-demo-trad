import { ProfileContainer } from "@/components/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Authentiq",
  description: "View professional profile",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;

  return <ProfileContainer userId={id} />;
}

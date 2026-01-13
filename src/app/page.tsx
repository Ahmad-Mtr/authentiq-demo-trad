import { FeedContainer } from "@/components/feed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed | Authentiq",
  description: "See what's happening in your feed",
};

export default function Home() {
  return <FeedContainer />;
}
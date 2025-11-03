import type { Metadata } from "next";
import { Raleway, Geist_Mono, Mona_Sans, Kalnia } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});
const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kalnia = Kalnia({
  variable: "--font-kalnia",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Authentiq Proof of Concept (non-atproto version)",
  description: "This is the non-atproto version of the Authentiq proof of concept. supported authentiq features here are: auth, user profile, and Hiring Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body
        className={`${monaSans.variable} ${geistMono.variable} ${raleway.variable} ${kalnia.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

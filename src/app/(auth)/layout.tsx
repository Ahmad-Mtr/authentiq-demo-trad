import { EvervaultCard } from "@/components/ui/evervault-card";
import React from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full min-h-svh md:max-h-screen ">
      <div className=" bg-background flex flex-col gap-4 p-6 md:p-8 flex-2/5">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="/"
            className="flex items-center gap-1 text-2xl font-semibold font-raleway"
          >
            authentiq
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full  max-w-xs">{children}</div>
        </div>
      </div>
      <div className=" bg-muted relative hidden lg:flex flex-3/5 overflow-hidden h-full max-h-screen">
        <svg
          width="1"
          height={"100vh"}
          viewBox="0 0 1 100"
          className="stroke-emerald-500/50 dark:stroke-border/70 h-full  w-0.5 "
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="0.5" y1="0" x2="0.5" y2="100" strokeWidth="1" />
        </svg>
        <EvervaultCard text="Join Authentiq" />

        {/* <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        /> */}
      </div>
    </div>
  );
}

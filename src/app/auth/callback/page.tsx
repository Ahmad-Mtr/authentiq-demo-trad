"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import supabase from "@/lib/supabase";
import { use } from 'react'
export default function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const router = useRouter();
  const params = use(searchParams)
  const { checkSession } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL params (Supabase OAuth flow)
        const code = params.code;
        
        if (code) {
          console.log("[OAuth Callback] Exchanging code for session...");
          
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("[OAuth Callback] Error exchanging code:", error);
            throw error;
          }
          
          console.log("[OAuth Callback] Session established:", data);
        }

        // Small delay to ensure session is fully established
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Verify authentication
        const isAuthenticated = await checkSession();
        
        console.log("[OAuth Callback] isAuthenticated:", isAuthenticated);
        
        if (isAuthenticated) {
          console.log("[OAuth Callback] Authentication successful!");
          setStatus("success");
          
          setTimeout(() => {
            console.log("[OAuth Callback] Redirecting to /");
            router.push("/");
          }, 500);
          return;
        }
        
        throw new Error("Authentication verification failed");
        
      } catch (error) {
        console.error("[OAuth Callback] Error:", error);
        setStatus("error");
        
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [checkSession, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <h2 className="text-xl font-semibold">Completing sign in...</h2>
            <p className="text-muted-foreground">
              Please wait while we authenticate you.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <svg
                className="h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Sign in successful!</h2>
            <p className="text-muted-foreground">Redirecting you now...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <svg
                className="h-12 w-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Sign in failed</h2>
            <p className="text-muted-foreground">
              Something went wrong. Redirecting back to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

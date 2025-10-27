"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { checkSession } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const handleCallback = async () => {
        // Wait u nigga appwrite
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let retries = 0;
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second between retries

      while (retries < maxRetries) {
        try {
          console.log(`[OAuth Callback] Attempt ${retries + 1}/${maxRetries} - Checking session...`);
          const isAuthenticated = await checkSession();
          
          console.log(`[OAuth Callback] isAuthenticated:`, isAuthenticated);
          
          if (isAuthenticated) {
            console.log("[OAuth Callback] Authentication successful!");
            setStatus("success");
            
            setTimeout(() => {
              console.log("[OAuth Callback] Redirecting to /");
              router.push("/");
            }, 500);
            return;
          }
          
          console.log(`[OAuth Callback] Not authenticated yet, retrying in ${retryDelay}ms...`);
          retries++;
          if (retries < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        } catch (error) {
          console.error(`[OAuth Callback] Error on attempt ${retries + 1}:`, error);
          retries++;
          
          if (retries < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }
      }

      console.error("[OAuth Callback] Failed after", maxRetries, "attempts");
      setStatus("error");
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    };

    handleCallback();
  }, [checkSession, router]);

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

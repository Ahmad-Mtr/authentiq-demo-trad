"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * Hook to handle authentication redirects
 * @param requireAuth - If true, redirects to /login if not authenticated
 * @param requireGuest - If true, redirects to / if authenticated
 */
export function useAuthRedirect(options?: {
  requireAuth?: boolean;
  requireGuest?: boolean;
  redirectTo?: string;
}) {
  const { requireAuth = false, requireGuest = false, redirectTo } = options || {};
  const router = useRouter();
  const { checkSession, isLoggedIn, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!_hasHydrated) {
        return;
      }

      try {
        const isAuthenticated = await checkSession();

        if (requireAuth && !isAuthenticated) {
          router.push("/login");
          return;
        }

        if (requireGuest && isAuthenticated) {
          router.push(redirectTo || "/");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (requireAuth) {
          router.push("/login");
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAndRedirect();
  }, [_hasHydrated, checkSession, requireAuth, requireGuest, redirectTo, router]);

  return { isChecking, isLoggedIn };
}

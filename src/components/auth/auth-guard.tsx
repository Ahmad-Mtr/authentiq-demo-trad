"use client";

import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth,
  requireGuest,
  redirectTo,
}: AuthGuardProps) {
  const { isChecking } = useAuthRedirect({
    requireAuth,
    requireGuest,
    redirectTo,
  });

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}

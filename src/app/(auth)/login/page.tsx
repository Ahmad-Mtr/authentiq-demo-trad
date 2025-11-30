"use client";

import { LoginForm } from "@/components/login-form";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";

export default function LoginPage() {
  // const { isChecking } = useAuthRedirect({ requireGuest: true });

  // if (isChecking) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  //     </div>
  //   );
  // }

  return <LoginForm />;
}

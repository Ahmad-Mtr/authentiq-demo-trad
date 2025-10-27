import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { account, ID } from "@/lib/appwrite";
import { Models, OAuthProvider } from "appwrite";

type UserState = {
  isLoggedIn: boolean;
  user: Models.User<Models.Preferences> | null;
  _hasHydrated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<Models.User<Models.Preferences>>;
  signInWithGithub: () => void;
  logOut: () => Promise<void>;
  checkSession: () => Promise<boolean>;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create(
  persist<UserState>(
    (set) => ({
      isLoggedIn: false,
      user: null,
      _hasHydrated: false,
      signUp: async (
        name: string,
        email: string,
        password: string
      ): Promise<Models.User<Models.Preferences>> => {
        try {
          const res = await account.create({
            userId: ID.unique(),
            email,
            password,
            name,
          });
          return res;
        } catch (error) {
          console.error("Registration failed:", error);
          throw error;
        }
      },
      signIn: async (email: string, password: string) => {
        try {
          await account.createEmailPasswordSession({ email, password });
          const user = await account.get();
          set((state) => ({
            ...state,
            isLoggedIn: true,
            user,
          }));
          
        } catch (error) {
          console.error("Sign in failed:", error);
          throw error;
        }
      },
      signInWithGithub: () => {
        try {
          const hostUrl = process.env.NEXT_PUBLIC_HOST_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
          console.log("[authStore] GitHub OAuth redirecting to:", `${hostUrl}/auth/callback`);
          
          account.createOAuth2Session({
            provider: OAuthProvider.Github,
            success: `${hostUrl}/auth/callback`,
            failure: `${hostUrl}/auth/callback`,
            scopes: ["account"],
          });
        } catch (error) {
          console.error("GitHub OAuth failed:", error);
          throw error;
        }
      },
      logOut: async () => {
        try {
          await account.deleteSession({ sessionId: "current" });
          set((state) => ({
            ...state,
            isLoggedIn: false,
            user: null,
          }));
        } catch (error) {
          console.error("Logout failed:", error);
          throw error;
        }
      },
      checkSession: async () => {
        try {
          console.log("[authStore] Checking session...");
          const user = await account.get();
          console.log("[authStore] Session valid, user:", user);
          set((state) => ({
            ...state,
            isLoggedIn: true,
            user,
          }));
          return true;
        } catch (error) {
          console.log("[authStore] No valid session:", error);
          set((state) => ({
            ...state,
            isLoggedIn: false,
            user: null,
          }));
          return false;
        }
      },
      setHasHydrated: (value: boolean) => {
        set((state) => {
          return {
            ...state,
            _hasHydrated: value,
          };
        });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state.setHasHydrated(true);
            state.checkSession();
          }
        };
      },
    }
  )
);

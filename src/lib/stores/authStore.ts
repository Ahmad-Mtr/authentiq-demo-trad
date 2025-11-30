"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import supabase from "../supabase";
import { User } from "@supabase/supabase-js";

type UserState = {
  isLoggedIn: boolean;
  user: User | null;
  _hasHydrated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<User>;
  signInWithGithub: () => Promise<void>;
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
      ): Promise<User> => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
              },
            },
          });

          if (error) {
            console.error("Registration failed:", error);
            throw error;
          }

          if (!data.user) {
            throw new Error("No user returned from signup");
          }

          return data.user;
        } catch (error) {
          console.error("Registration failed:", error);
          throw error;
        }
      },
      signIn: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error("Sign in failed:", error);
            throw error;
          }

          set((state) => ({
            ...state,
            isLoggedIn: true,
            user: data.user,
          }));
        } catch (error) {
          console.error("Sign in failed:", error);
          throw error;
        }
      },
      signInWithGithub: async () => {
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            console.error("GitHub OAuth failed:", error);
            throw error;
          }
        } catch (error) {
          console.error("GitHub OAuth failed:", error);
          throw error;
        }
      },
      logOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error("Logout failed:", error);
            throw error;
          }

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
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.log("[authStore] Session check error:", error);
            set((state) => ({
              ...state,
              isLoggedIn: false,
              user: null,
            }));
            return false;
          }

          if (session?.user) {
            console.log("[authStore] Session valid, user:", session.user);
            set((state) => ({
              ...state,
              isLoggedIn: true,
              user: session.user,
            }));
            return true;
          }

          console.log("[authStore] No valid session");
          set((state) => ({
            ...state,
            isLoggedIn: false,
            user: null,
          }));
          return false;
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

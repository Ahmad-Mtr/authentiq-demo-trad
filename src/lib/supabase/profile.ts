import supabase from "@/lib/supabase";
import { Profile } from "../interfaces";

export const profileAPI = {
  // Check if profile exists
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data as Profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  // Create new profile
  async createProfile(profileData: {
    user_id: string;
    name: string;
    email: string;
    pfp_url?: string | null;
    location: string;
    date_of_birth: string;
    gender: string;
    role: string;
    bio: string;
  }): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data as Profile;
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  },

  // Update existing profile
  async updateProfile(
    userId: string,
    profileData: Partial<Profile>
  ): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...profileData,
          updatedAt: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return data as Profile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
};

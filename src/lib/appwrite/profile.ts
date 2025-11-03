import { tablesDB, appwriteConfig, ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Profile } from "../interfaces";

// Type for Appwrite row that includes metadata
type ProfileRow = Profile & {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $tableId: string;
};

// Helper function to map Appwrite row to Profile interface
const mapRowToProfile = (row: any): Profile => {
  return {
    userId: row.userId,
    name: row.name,
    email: row.email,
    profilePictureUrl: row.profilePictureUrl,
    role: row.role,
    bio: row.bio,
    gender: row.gender,
    location: row.location,
    dateOfBirth: row.dateOfBirth,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const profileAPI = {
  // Check if profile exists
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    try {
      const response = await tablesDB.listRows({ 
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.profilesTableId,
        queries: [Query.equal("userId", userId)],
      });
      
      if (!response.rows[0]) {
        return null;
      }

      // Map the Appwrite row to your Profile interface
      return mapRowToProfile(response.rows[0]);
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  // Create new profile
  async createProfile(profileData: {
    userId: string;
    name: string;
    email: string;
    profilePictureUrl?: string | null;
    location: string;
    dateOfBirth: string;
    gender: string;
    role: string;
    bio: string;
  }): Promise<Profile> {
    try {
      const response = await tablesDB.createRow({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.profilesTableId,
        rowId: ID.unique(),
        data: {
          ...profileData,
        },
      });
      
      // Map the response to Profile interface
      return mapRowToProfile(response);
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  },

  // Update existing profile
  async updateProfile(documentId: string, profileData: Partial<Profile>): Promise<Profile> {
    try {
      const response = await tablesDB.updateRow({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.profilesTableId,
        rowId: documentId,
        data: {
          ...profileData,
          updatedAt: new Date().toISOString(),
        },
      });
      
      // Map the response to Profile interface
      return mapRowToProfile(response);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
};

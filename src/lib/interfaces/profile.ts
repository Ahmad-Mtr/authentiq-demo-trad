
export interface Profile {
  userId: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  role: string;
  bio: string;
  gender: string;
  location: string;
  dateOfBirth: string;
  createdAt?: string;
  updatedAt?: string;
}
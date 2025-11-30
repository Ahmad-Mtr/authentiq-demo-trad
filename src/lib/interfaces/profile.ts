
export interface Profile {
  user_id: string;
  name: string;
  email: string;
  pfp_url?: string;
  role: string;
  bio: string;
  gender: string;
  location: string;
  date_of_birth: string;
  created_at?: string;
  updated_at?: string;
}
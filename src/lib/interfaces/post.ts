export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  like_count: number;
  is_liked_by_user: boolean;
  author_name: string;
  author_pfp_url: string | null;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface CreatePostData {
  content: string;
}

import supabase from "@/lib/supabase";
import { Post, CreatePostData } from "../interfaces";

export const postsAPI = {
  // Get all posts with details (likes, author info)
  async getPosts(userId?: string): Promise<Post[]> {
    try {
      const { data, error } = await supabase.rpc("get_posts_with_details", {
        requesting_user_id: userId || null,
      });

      if (error) throw error;

      return (data as Post[]) || [];
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  async getPostsByUserId(
    targetUserId: string,
    requestingUserId?: string
  ): Promise<Post[]> {
    try {
      const posts = await this.getPosts(requestingUserId);
      return posts.filter((post) => post.user_id === targetUserId);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  },

  async createPost(userId: string, postData: CreatePostData): Promise<Post> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            user_id: userId,
            content: postData.content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Return with default values for computed fields
      return {
        ...data,
        like_count: 0,
        is_liked_by_user: false,
        author_name: "",
        author_pfp_url: null,
      } as Post;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  async deletePost(postId: string): Promise<void> {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },

  async likePost(postId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase.from("post_likes").insert([
        {
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  },

  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error unliking post:", error);
      throw error;
    }
  },

  async toggleLike(
    postId: string,
    userId: string,
    isCurrentlyLiked: boolean
  ): Promise<boolean> {
    try {
      if (isCurrentlyLiked) {
        await this.unlikePost(postId, userId);
        return false;
      } else {
        await this.likePost(postId, userId);
        return true;
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  },
};

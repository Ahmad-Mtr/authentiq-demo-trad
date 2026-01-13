import { create } from "zustand";
import { Post } from "../interfaces";
import { postsAPI } from "../supabase/posts";

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  removePost: (postId: string) => void;
  updatePostLike: (postId: string, isLiked: boolean, likeCount: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchPosts: (userId?: string) => Promise<void>;
  createPost: (userId: string, content: string, authorName: string, authorPfpUrl: string | null) => Promise<Post>;
  toggleLike: (postId: string, userId: string, isCurrentlyLiked: boolean) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,

  setPosts: (posts) => set({ posts }),

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
    })),

  updatePostLike: (postId, isLiked, likeCount) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, is_liked_by_user: isLiked, like_count: likeCount }
          : p
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  fetchPosts: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });
      const posts = await postsAPI.getPosts(userId);
      set({ posts, isLoading: false });
    } catch (error) {
      console.error("Error fetching posts:", error);
      set({ error: "Failed to fetch posts", isLoading: false });
    }
  },

  createPost: async (userId: string, content: string, authorName: string, authorPfpUrl: string | null) => {
    try {
      set({ isLoading: true, error: null });
      const newPost = await postsAPI.createPost(userId, { content });
      
      // Enrich with author info
      const enrichedPost: Post = {
        ...newPost,
        author_name: authorName,
        author_pfp_url: authorPfpUrl,
      };
      
      get().addPost(enrichedPost);
      set({ isLoading: false });
      return enrichedPost;
    } catch (error) {
      console.error("Error creating post:", error);
      set({ error: "Failed to create post", isLoading: false });
      throw error;
    }
  },

  toggleLike: async (postId: string, userId: string, isCurrentlyLiked: boolean) => {
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    const newLikeCount = isCurrentlyLiked
      ? post.like_count - 1
      : post.like_count + 1;
    get().updatePostLike(postId, !isCurrentlyLiked, newLikeCount);

    try {
      await postsAPI.toggleLike(postId, userId, isCurrentlyLiked);
    } catch (error) {
      // Revert on error
      get().updatePostLike(postId, isCurrentlyLiked, post.like_count);
      console.error("Error toggling like:", error);
    }
  },

  deletePost: async (postId: string) => {
    const posts = get().posts;
    const postIndex = posts.findIndex((p) => p.id === postId);
    const post = posts[postIndex];

    // Optimistic update
    get().removePost(postId);

    try {
      await postsAPI.deletePost(postId);
    } catch (error) {
      // Revert on error
      if (post) {
        set((state) => ({
          posts: [
            ...state.posts.slice(0, postIndex),
            post,
            ...state.posts.slice(postIndex),
          ],
        }));
      }
      console.error("Error deleting post:", error);
      throw error;
    }
  },
}));

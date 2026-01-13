"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface ChatContext {
  jobDescription?: string;
  extractedQuery?: {
    semantic_query: string;
    min_experience_years?: number;
    max_experience_years?: number;
    required_skills?: string[];
    preferred_skills?: string[];
  };
  candidateIds?: string[];
}

// Use generic type for messages to avoid version conflicts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoredMessage = any;

type ChatState = {
  messages: StoredMessage[];
  context: ChatContext;
  _hasHydrated: boolean;
  setMessages: (messages: StoredMessage[]) => void;
  addMessage: (message: StoredMessage) => void;
  updateMessage: (id: string, message: Partial<StoredMessage>) => void;
  setContext: (context: Partial<ChatContext>) => void;
  clearChat: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useChatStore = create(
  persist<ChatState>(
    (set, get) => ({
      messages: [],
      context: {},
      _hasHydrated: false,

      setMessages: (messages) => set({ messages }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      setContext: (context) =>
        set((state) => ({
          context: { ...state.context, ...context },
        })),

      clearChat: () =>
        set({
          messages: [],
          context: {},
        }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "authentiq-chat-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        messages: state.messages,
        context: state.context,
        _hasHydrated: state._hasHydrated,
        setMessages: state.setMessages,
        addMessage: state.addMessage,
        updateMessage: state.updateMessage,
        setContext: state.setContext,
        clearChat: state.clearChat,
        setHasHydrated: state.setHasHydrated,
      }),
    }
  )
);

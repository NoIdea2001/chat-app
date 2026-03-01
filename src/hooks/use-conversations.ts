"use client";

import { useMyConversations as useMyConversationsBackend } from "@/lib/adapters/backend";

export function useConversations() {
  const conversations = useMyConversationsBackend();
  return { conversations, isLoading: conversations === undefined };
}

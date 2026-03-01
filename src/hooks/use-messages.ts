"use client";

import { useMessages as useMessagesBackend } from "@/lib/adapters/backend";

export function useMessages(conversationId: string) {
  const messages = useMessagesBackend(conversationId);
  return { messages, isLoading: messages === undefined };
}

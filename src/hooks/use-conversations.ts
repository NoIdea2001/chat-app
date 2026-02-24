"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useConversations() {
  const conversations = useQuery(api.conversations.getMyConversations);
  return { conversations, isLoading: conversations === undefined };
}

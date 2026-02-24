"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useMessages(conversationId: Id<"conversations">) {
  const messages = useQuery(api.messages.getMessages, { conversationId });
  return { messages, isLoading: messages === undefined };
}

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { TYPING_TIMEOUT_MS } from "@/lib/constants";

export function useTyping() {
  const setTypingMutation = useMutation(api.typing.setTyping);
  const clearTypingMutation = useMutation(api.typing.clearTyping);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeConversationRef = useRef<Id<"conversations"> | null>(null);

  const clearTyping = useCallback(
    (conversationId: Id<"conversations">) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      activeConversationRef.current = null;
      clearTypingMutation({ conversationId });
    },
    [clearTypingMutation]
  );

  const startTyping = useCallback(
    (conversationId: Id<"conversations">) => {
      activeConversationRef.current = conversationId;
      setTypingMutation({ conversationId });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        clearTypingMutation({ conversationId });
        activeConversationRef.current = null;
      }, TYPING_TIMEOUT_MS);
    },
    [setTypingMutation, clearTypingMutation]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (activeConversationRef.current) {
        clearTypingMutation({ conversationId: activeConversationRef.current });
      }
    };
  }, [clearTypingMutation]);

  return { startTyping, clearTyping };
}

"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  useSetTyping as useSetTypingBackend,
  useClearTyping as useClearTypingBackend,
} from "@/lib/adapters/backend";
import { TYPING_TIMEOUT_MS } from "@/lib/constants";

export function useTyping() {
  const setTypingMutation = useSetTypingBackend();
  const clearTypingMutation = useClearTypingBackend();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeConversationRef = useRef<string | null>(null);

  const clearTyping = useCallback(
    (conversationId: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      activeConversationRef.current = null;
      clearTypingMutation({ conversationId });
    },
    [clearTypingMutation],
  );

  const startTyping = useCallback(
    (conversationId: string) => {
      activeConversationRef.current = conversationId;
      setTypingMutation({ conversationId });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        clearTypingMutation({ conversationId });
        activeConversationRef.current = null;
      }, TYPING_TIMEOUT_MS);
    },
    [setTypingMutation, clearTypingMutation],
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

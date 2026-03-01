"use client";

import { useCallback } from "react";
import {
  useUnreadCounts as useUnreadCountsBackend,
  useMarkAsRead as useMarkAsReadBackend,
} from "@/lib/adapters/backend";

export function useUnread() {
  const unreadCounts = useUnreadCountsBackend() ?? {};
  const markAsReadMutation = useMarkAsReadBackend();

  const markAsRead = useCallback(
    (conversationId: string) => {
      markAsReadMutation({ conversationId });
    },
    [markAsReadMutation],
  );

  return { unreadCounts, markAsRead };
}

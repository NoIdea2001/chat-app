"use client";

import { useQuery, useMutation } from "convex/react";
import { useCallback } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useUnread() {
  const unreadCounts = useQuery(api.readStatus.getUnreadCounts) ?? {};
  const markAsReadMutation = useMutation(api.readStatus.markAsRead);

  const markAsRead = useCallback(
    (conversationId: Id<"conversations">) => {
      markAsReadMutation({ conversationId });
    },
    [markAsReadMutation]
  );

  return { unreadCounts, markAsRead };
}

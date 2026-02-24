"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Check, CheckCheck } from "lucide-react";

interface ReadReceiptProps {
  conversationId: Id<"conversations">;
  messageTimestamp: number;
}

export function ReadReceipt({ conversationId, messageTimestamp }: ReadReceiptProps) {
  const readStatus = useQuery(api.readStatus.getReadStatusForMessages, {
    conversationId,
  });

  if (readStatus === undefined) return null;

  const isRead = readStatus !== null && readStatus >= messageTimestamp;

  return isRead ? (
    <CheckCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
  ) : (
    <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
  );
}

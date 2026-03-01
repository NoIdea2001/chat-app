"use client";

import { useReadStatus } from "@/lib/adapters/backend";
import { Check, CheckCheck } from "lucide-react";

interface ReadReceiptProps {
  conversationId: string;
  messageTimestamp: number;
}

export function ReadReceipt({ conversationId, messageTimestamp }: ReadReceiptProps) {
  const readStatus = useReadStatus(conversationId);

  if (readStatus === undefined) return null;

  const isRead = readStatus !== null && readStatus >= messageTimestamp;

  return isRead ? (
    <CheckCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
  ) : (
    <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
  );
}

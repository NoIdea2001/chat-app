"use client";

import { SelectConversation } from "@/components/chat/empty-states";

export default function ChatPage() {
  return (
    <div className="hidden md:flex h-full w-full items-center justify-center bg-muted/10">
      <SelectConversation />
    </div>
  );
}

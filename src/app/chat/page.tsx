"use client";

import { SelectConversation } from "@/components/chat/empty-states";

export default function ChatPage() {
  return (
    <div className="hidden md:flex h-full">
      <SelectConversation />
    </div>
  );
}

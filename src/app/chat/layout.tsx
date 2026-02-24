"use client";

import { useStoreUser } from "@/hooks/use-store-user";
import { Sidebar } from "@/components/chat/sidebar";
import { useParams } from "next/navigation";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  useStoreUser();
  const params = useParams();
  const hasConversation = !!params?.conversationId;

  return (
    <div className="flex h-dvh">
      {/* Sidebar: hidden on mobile when a conversation is open */}
      <div
        className={`w-full md:w-80 md:shrink-0 ${
          hasConversation ? "hidden md:flex" : "flex"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content area */}
      <div
        className={`flex-1 min-w-0 ${
          hasConversation ? "flex" : "hidden md:flex"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

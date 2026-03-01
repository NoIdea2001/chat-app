"use client";

import { useStoreUser } from "@/hooks/use-store-user";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Sidebar } from "@/components/chat/sidebar";
import { useParams } from "next/navigation";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  useStoreUser();
  useOnlineStatus();
  const params = useParams();
  const hasConversation = !!params?.conversationId;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <div
        className={`w-full md:w-80 lg:w-96 md:shrink-0 flex-col border-r ${
          hasConversation ? "hidden md:flex" : "flex"
        }`}
      >
        <Sidebar />
      </div>
      <div
        className={`flex-1 min-w-0 h-full ${
          hasConversation ? "block" : "hidden md:block"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

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
    <div className="flex h-dvh w-full overflow-hidden bg-muted/10">
      <div
        className={`w-full md:w-80 lg:w-[350px] lg:shrink-0 flex-col border-r bg-background shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10 ${hasConversation ? "hidden md:flex" : "flex"
          }`}
      >
        <Sidebar />
      </div>
      <div
        className={`flex-1 min-w-0 h-full bg-background md:rounded-l-2xl md:my-2 md:mr-2 md:border border-border/30 overflow-hidden shadow-sm ${hasConversation ? "block" : "hidden md:block"
          }`}
      >
        {children}
      </div>
    </div>
  );
}

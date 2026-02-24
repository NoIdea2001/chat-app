"use client";

import { useQuery } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ChatAreaProps {
  conversationId: Id<"conversations">;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const conversation = useQuery(api.conversations.getConversation, {
    conversationId,
  });
  const router = useRouter();

  if (conversation === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (conversation === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  const otherUser = conversation.otherParticipants[0];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={() => router.push("/chat")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {otherUser && (
          <>
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarImage src={otherUser.imageUrl} alt={otherUser.name} />
                <AvatarFallback>
                  {otherUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {otherUser.isOnline && (
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">{otherUser.name}</p>
              <p className="text-xs text-muted-foreground">
                {otherUser.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <MessageList conversationId={conversationId} />

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}

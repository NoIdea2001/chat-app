"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { GroupSettingsDialog } from "./group-settings-dialog";
import { TypingIndicator } from "./typing-indicator";
import { ChatAreaSkeleton } from "./loading-states";
import { ChatErrorBoundary } from "./error-boundary";
import { useConversation } from "@/lib/adapters/backend";
import { useMessages } from "@/hooks/use-messages";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUnread } from "@/hooks/use-unread";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import { useEffect, useRef } from "react";

interface ChatAreaProps {
  conversationId: string;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const conversation = useConversation(conversationId);
  const router = useRouter();
  const { markAsRead } = useUnread();
  const { playSound, sendBrowserNotification } = useNotificationSound();
  const { messages } = useMessages(conversationId);
  const prevMessageCount = useRef(0);

  // Play notification sound for new messages from others
  useEffect(() => {
    if (!messages || !conversation) return;
    const count = messages.length;
    if (count > prevMessageCount.current && prevMessageCount.current > 0) {
      const lastMessage = messages[count - 1];
      const me = conversation.currentUserId;
      if (lastMessage && lastMessage.senderId !== me) {
        playSound();
        // Browser notification only when tab is hidden
        const senderName = conversation.otherParticipants?.find(
          (p) => p?._id === lastMessage.senderId
        )?.name ?? "Someone";
        sendBrowserNotification(senderName, lastMessage.body ?? "New message");
      }
    }
    prevMessageCount.current = count;
  }, [messages, conversation, playSound, sendBrowserNotification]);

  useEffect(() => {
    if (conversation) {
      markAsRead(conversationId);
    }
  }, [conversationId, conversation, markAsRead]);

  if (conversation === undefined) {
    return <ChatAreaSkeleton />;
  }

  if (conversation === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  const isGroup = conversation.isGroup;
  const otherUser = conversation.otherParticipants[0];

  return (
    <ChatErrorBoundary>
      <div className="flex flex-col h-full w-full bg-background">
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

          {isGroup ? (
            <>
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {conversation.groupName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {conversation.participants.length} members
                </p>
              </div>
              <GroupSettingsDialog
                conversationId={conversationId}
                groupName={conversation.groupName}
                participants={conversation.resolvedParticipants}
                currentUserId={conversation.currentUserId}
              />
            </>
          ) : otherUser ? (
            <>
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={otherUser.imageUrl}
                    alt={otherUser.name}
                  />
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
          ) : null}
        </div>

        {/* Messages */}
        <MessageList conversationId={conversationId} isGroup={isGroup} />

        {/* Typing Indicator */}
        <TypingIndicator conversationId={conversationId} />

        {/* Input */}
        <MessageInput conversationId={conversationId} />
      </div>
    </ChatErrorBoundary>
  );
}

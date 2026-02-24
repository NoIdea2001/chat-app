"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessages } from "@/hooks/use-messages";
import { formatMessageTime } from "@/lib/format-time";
import { NoMessages } from "./empty-states";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

interface MessageListProps {
  conversationId: Id<"conversations">;
}

export function MessageList({ conversationId }: MessageListProps) {
  const { messages, isLoading } = useMessages(conversationId);
  const me = useQuery(api.users.getMe);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1">
        <NoMessages />
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === me?._id;
          const sender = message.sender;

          return (
            <div
              key={message._id}
              className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
            >
              {!isOwn && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage
                    src={sender?.imageUrl}
                    alt={sender?.name ?? ""}
                  />
                  <AvatarFallback>
                    {sender?.name?.charAt(0).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`flex flex-col max-w-[70%] ${
                  isOwn ? "items-end" : "items-start"
                }`}
              >
                {!isOwn && sender && (
                  <span className="text-xs text-muted-foreground mb-1">
                    {sender.name}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {message.body}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {formatMessageTime(message.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

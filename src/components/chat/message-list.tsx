"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessages } from "@/hooks/use-messages";
import { formatMessageTime } from "@/lib/format-time";
import { MESSAGE_SCROLL_THRESHOLD } from "@/lib/constants";
import { NoMessages } from "./empty-states";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { ArrowDown } from "lucide-react";

interface MessageListProps {
  conversationId: Id<"conversations">;
}

export function MessageList({ conversationId }: MessageListProps) {
  const { messages, isLoading } = useMessages(conversationId);
  const me = useQuery(api.users.getMe);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const prevMessageCount = useRef(0);
  const initialScrollDone = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
    setShowNewMessages(false);
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom <= MESSAGE_SCROLL_THRESHOLD;
    setIsNearBottom(nearBottom);
    if (nearBottom) setShowNewMessages(false);
  }, []);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages && messages.length > 0 && !initialScrollDone.current) {
      initialScrollDone.current = true;
      // Use instant scroll for initial load
      setTimeout(() => scrollToBottom("instant"), 0);
    }
  }, [messages, scrollToBottom]);

  // Reset on conversation change
  useEffect(() => {
    initialScrollDone.current = false;
    prevMessageCount.current = 0;
    setShowNewMessages(false);
    setIsNearBottom(true);
  }, [conversationId]);

  // Handle new messages
  useEffect(() => {
    if (!messages) return;
    const count = messages.length;

    if (count > prevMessageCount.current && prevMessageCount.current > 0) {
      if (isNearBottom) {
        scrollToBottom();
      } else {
        setShowNewMessages(true);
      }
    }

    prevMessageCount.current = count;
  }, [messages?.length, isNearBottom, scrollToBottom, messages]);

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
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto p-4"
      >
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
      </div>

      {/* New messages button */}
      {showNewMessages && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => scrollToBottom()}
            className="rounded-full shadow-lg gap-1"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            New messages
          </Button>
        </div>
      )}
    </div>
  );
}

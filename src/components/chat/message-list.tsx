"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMessages } from "@/hooks/use-messages";
import { formatMessageTime } from "@/lib/format-time";
import { MESSAGE_SCROLL_THRESHOLD } from "@/lib/constants";
import { NoMessages } from "./empty-states";
import { MessageListSkeleton } from "./loading-states";
import { MessageReactions } from "./message-reactions";
import { ReactionPicker } from "./reaction-picker";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { ArrowDown, MoreVertical, Trash2 } from "lucide-react";

interface MessageListProps {
  conversationId: Id<"conversations">;
  isGroup?: boolean;
}

const SENDER_COLORS = [
  "text-blue-600 dark:text-blue-400",
  "text-green-600 dark:text-green-400",
  "text-purple-600 dark:text-purple-400",
  "text-orange-600 dark:text-orange-400",
  "text-pink-600 dark:text-pink-400",
  "text-teal-600 dark:text-teal-400",
  "text-red-600 dark:text-red-400",
  "text-indigo-600 dark:text-indigo-400",
];

function getSenderColor(senderId: string, participantIds: string[]): string {
  const index = participantIds.indexOf(senderId);
  return SENDER_COLORS[index % SENDER_COLORS.length];
}

export function MessageList({ conversationId, isGroup = false }: MessageListProps) {
  const { messages, isLoading } = useMessages(conversationId);
  const me = useQuery(api.users.getMe);
  const conversation = useQuery(api.conversations.getConversation, { conversationId });
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const prevMessageCount = useRef(0);
  const initialScrollDone = useRef(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);

  const messageIds = useMemo(
    () => messages?.map((m) => m._id) ?? [],
    [messages]
  );
  const reactions = useQuery(
    api.reactions.getReactions,
    messageIds.length > 0 ? { messageIds } : "skip"
  );

  const participantIds = useMemo(
    () => conversation?.participants?.map(String) ?? [],
    [conversation?.participants]
  );

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

  useEffect(() => {
    if (messages && messages.length > 0 && !initialScrollDone.current) {
      initialScrollDone.current = true;
      setTimeout(() => scrollToBottom("instant"), 0);
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    initialScrollDone.current = false;
    prevMessageCount.current = 0;
    setShowNewMessages(false);
    setIsNearBottom(true);
  }, [conversationId]);

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
    return <MessageListSkeleton />;
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
            const isHovered = hoveredMessage === message._id;
            const messageReactions = reactions?.[message._id] ?? {};

            return (
              <div
                key={message._id}
                className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                onMouseEnter={() => setHoveredMessage(message._id)}
                onMouseLeave={() => setHoveredMessage(null)}
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
                  {!isOwn && sender && isGroup && (
                    <span
                      className={`text-xs font-medium mb-1 ${getSenderColor(
                        message.senderId,
                        participantIds
                      )}`}
                    >
                      {sender.name}
                    </span>
                  )}
                  <div className="relative group">
                    <div className={`flex items-center gap-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm ${
                          message.isDeleted
                            ? "bg-muted/50 border border-dashed border-border"
                            : isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                        }`}
                      >
                        {message.isDeleted ? (
                          <p className="italic text-muted-foreground text-xs">
                            This message was deleted
                          </p>
                        ) : (
                          <p className="whitespace-pre-wrap break-words">
                            {message.body}
                          </p>
                        )}
                      </div>

                      {/* Action buttons on hover */}
                      {isHovered && !message.isDeleted && (
                        <div className={`flex items-center gap-0.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                          <ReactionPicker messageId={message._id} />
                          {isOwn && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isOwn ? "end" : "start"}>
                                <DropdownMenuItem
                                  onClick={() =>
                                    deleteMessage({ messageId: message._id })
                                  }
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reactions */}
                    <MessageReactions
                      messageId={message._id}
                      reactions={messageReactions}
                    />
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

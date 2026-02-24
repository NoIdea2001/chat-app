"use client";

import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations } from "@/hooks/use-conversations";
import { formatSidebarTime } from "@/lib/format-time";
import { UserSearch } from "./user-search";
import { NoConversations } from "./empty-states";
import { Id } from "../../../convex/_generated/dataModel";

export function Sidebar() {
  const { conversations, isLoading } = useConversations();
  const params = useParams();
  const router = useRouter();
  const activeConversationId = params?.conversationId as string | undefined;

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="p-4 space-y-2">
        <h2 className="text-lg font-semibold">Chats</h2>
        <UserSearch />
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <NoConversations />
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => {
              const otherUser = conversation.otherParticipants[0];
              if (!otherUser) return null;
              const isActive = activeConversationId === conversation._id;

              return (
                <button
                  key={conversation._id}
                  onClick={() => router.push(`/chat/${conversation._id}`)}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-left ${
                    isActive
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={otherUser.imageUrl}
                        alt={otherUser.name}
                      />
                      <AvatarFallback>
                        {otherUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {otherUser.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {otherUser.name}
                      </p>
                      {conversation.lastMessageTime && (
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">
                          {formatSidebarTime(conversation.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessagePreview && (
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessagePreview}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

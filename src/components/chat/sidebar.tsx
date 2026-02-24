"use client";

import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useConversations } from "@/hooks/use-conversations";
import { useUnread } from "@/hooks/use-unread";
import { formatSidebarTime } from "@/lib/format-time";
import { UserSearch } from "./user-search";
import { CreateGroupDialog } from "./create-group-dialog";
import { SidebarSkeleton } from "./loading-states";
import { NoConversations } from "./empty-states";
import { Users } from "lucide-react";

export function Sidebar() {
  const { conversations, isLoading } = useConversations();
  const { unreadCounts } = useUnread();
  const params = useParams();
  const router = useRouter();
  const activeConversationId = params?.conversationId as string | undefined;

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="p-4 space-y-2">
        <h2 className="text-lg font-semibold">Chats</h2>
        <UserSearch />
        <CreateGroupDialog />
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        {isLoading ? (
          <SidebarSkeleton />
        ) : !conversations || conversations.length === 0 ? (
          <NoConversations />
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => {
              const isGroup = conversation.isGroup;
              const otherUser = conversation.otherParticipants[0];
              if (!isGroup && !otherUser) return null;
              const isActive = activeConversationId === conversation._id;
              const unreadCount = unreadCounts[conversation._id] ?? 0;

              const displayName = isGroup
                ? conversation.groupName ?? "Group"
                : otherUser!.name;

              return (
                <button
                  key={conversation._id}
                  onClick={() => router.push(`/chat/${conversation._id}`)}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-left ${
                    isActive ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <div className="relative">
                    {isGroup ? (
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    ) : (
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={otherUser!.imageUrl}
                          alt={otherUser!.name}
                        />
                        <AvatarFallback>
                          {otherUser!.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!isGroup && otherUser?.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {displayName}
                      </p>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        {conversation.lastMessageTime && (
                          <span className="text-xs text-muted-foreground">
                            {formatSidebarTime(conversation.lastMessageTime)}
                          </span>
                        )}
                        {unreadCount > 0 && (
                          <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isGroup && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {conversation.participants.length}m ·
                        </span>
                      )}
                      {conversation.lastMessagePreview && (
                        <p
                          className={`text-xs truncate ${
                            unreadCount > 0
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {conversation.lastMessagePreview}
                        </p>
                      )}
                    </div>
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

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NoUsersFound } from "./empty-states";
import { Id } from "../../../convex/_generated/dataModel";

export function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const me = useQuery(api.users.getMe);
  const allUsers = useQuery(api.users.getAllUsers);
  const searchResults = useQuery(
    api.users.searchUsers,
    searchTerm.length > 0 ? { name: searchTerm } : "skip"
  );
  const createOrGetConversation = useMutation(
    api.conversations.createOrGetConversation
  );

  const displayUsers = searchTerm.length > 0 ? searchResults : allUsers;
  const filteredResults = displayUsers?.filter(
    (user) => user._id !== me?._id
  );

  const handleSelectUser = async (userId: Id<"users">) => {
    const conversationId = await createOrGetConversation({
      participantUserId: userId,
    });
    setSearchTerm("");
    router.push(`/chat/${conversationId}`);
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-9"
      />
      {(
        <ScrollArea className="max-h-60">
          {filteredResults && filteredResults.length === 0 ? (
            <div className="py-4">
              <NoUsersFound />
            </div>
          ) : (
            <div className="space-y-1">
              {filteredResults?.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user._id)}
                  className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-accent transition-colors text-left"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} alt={user.name} />
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  {user.isOnline && (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}

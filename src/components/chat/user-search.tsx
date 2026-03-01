"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCurrentUser,
  useAllUsers,
  useSearchUsers,
  useCreateOrGetConversation,
} from "@/lib/adapters/backend";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NoUsersFound } from "./empty-states";
import type { User } from "@/types";

interface UserSearchProps {
  onSelect?: (user: User) => void;
  placeholder?: string;
}

export function UserSearch({ onSelect, placeholder = "Search users..." }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const me = useCurrentUser();
  const allUsers = useAllUsers();
  const searchResults = useSearchUsers(
    searchTerm.length > 0 ? searchTerm : undefined,
  );
  const createOrGetConversation = useCreateOrGetConversation();

  const displayUsers = searchTerm.length > 0 ? searchResults : allUsers;
  const filteredResults = displayUsers?.filter(
    (user) => user._id !== me?._id
  );

  const handleSelectUser = async (user: User) => {
    if (onSelect) {
      onSelect(user);
    } else {
      const conversationId = await createOrGetConversation({
        participantUserId: user._id,
      });
      setSearchTerm("");
      router.push(`/chat/${conversationId}`);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-9"
      />
      {searchTerm.length > 0 && (
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
                  onClick={() => handleSelectUser(user)}
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

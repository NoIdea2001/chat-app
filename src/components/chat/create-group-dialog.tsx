"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAllUsers,
  useCurrentUser,
  useCreateGroupConversation,
} from "@/lib/adapters/backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

export function CreateGroupDialog() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const allUsers = useAllUsers();
  const me = useCurrentUser();
  const createGroup = useCreateGroupConversation();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const otherUsers = allUsers?.filter((u) => u._id !== me?._id) ?? [];

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;
    setIsCreating(true);
    try {
      const conversationId = await createGroup({
        groupName: groupName.trim(),
        participantIds: selectedUsers,
      });
      setOpen(false);
      setGroupName("");
      setSelectedUsers([]);
      router.push(`/chat/${conversationId}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-full gap-2" disabled>
        <Users className="h-4 w-4" />
        New Group
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Users className="h-4 w-4" />
          New Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div>
            <p className="text-sm font-medium mb-2">
              Select members ({selectedUsers.length} selected)
            </p>
            <ScrollArea className="h-60 border rounded-lg">
              <div className="p-2 space-y-1">
                {otherUsers.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onCheckedChange={() => toggleUser(user._id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.imageUrl} alt={user.name} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    {user.isOnline && (
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    )}
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={
              !groupName.trim() || selectedUsers.length < 1 || isCreating
            }
          >
            {isCreating ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

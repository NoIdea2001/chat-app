"use client";

import { useState } from "react";
import {
  useAddGroupMember,
  useRemoveGroupMember,
} from "@/lib/adapters/backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, UserPlus, UserMinus, ShieldAlert } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserSearch } from "./user-search";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { User } from "@/types";

interface GroupSettingsDialogProps {
  conversationId: string;
  groupName?: string;
  participants: User[];
  currentUserId: string;
}

export function GroupSettingsDialog({
  conversationId,
  groupName,
  participants,
  currentUserId,
}: GroupSettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const addMember = useAddGroupMember();
  const removeMember = useRemoveGroupMember();

  const handleAddMember = async (userId: string) => {
    try {
      await addMember({ conversationId, userId });
      toast.success("Member added to group");
      setIsAdding(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add member",
      );
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember({ conversationId, userId });
      toast.success("Member removed from group");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove member",
      );
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await removeMember({ conversationId, userId: currentUserId });
      toast.success("You left the group");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to leave group",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            {groupName || "Group Settings"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Members ({participants.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(!isAdding)}
                className="h-8 gap-2 rounded-full"
              >
                {isAdding ? "Cancel" : "Add Member"}
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>

            {isAdding && (
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50 shadow-inner">
                <UserSearch
                  onSelect={(user) => handleAddMember(user._id)}
                  placeholder="Search users to add..."
                />
              </div>
            )}

            <ScrollArea className="h-64 rounded-xl border border-border/50 bg-muted/10 p-2">
              <div className="space-y-1">
                {participants.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                          {user._id === currentUserId && " (You)"}
                        </p>
                      </div>
                    </div>
                    {user._id !== currentUserId && participants.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveMember(user._id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Danger Zone */}
          {participants.length > 2 && (
            <div className="pt-2 border-t border-border/50">
              <Button
                variant="destructive"
                className="w-full gap-2 rounded-xl group"
                onClick={handleLeaveGroup}
              >
                <ShieldAlert className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Leave Group
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

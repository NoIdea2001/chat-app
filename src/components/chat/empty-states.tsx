"use client";

import { MessageSquare, Search, SmilePlus, Users } from "lucide-react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function NoConversations() {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-muted-foreground" />}
      title="No conversations yet"
      description="Search for users to start chatting"
    />
  );
}

export function SelectConversation() {
  return (
    <EmptyState
      icon={<MessageSquare className="w-8 h-8 text-muted-foreground" />}
      title="Select a conversation"
      description="Choose a conversation from the sidebar to start messaging"
    />
  );
}

export function NoMessages() {
  return (
    <EmptyState
      icon={<SmilePlus className="w-8 h-8 text-muted-foreground" />}
      title="No messages yet"
      description="Say hello!"
    />
  );
}

export function NoUsersFound() {
  return (
    <EmptyState
      icon={<Users className="w-8 h-8 text-muted-foreground" />}
      title="No users found"
      description="Try a different search term"
    />
  );
}

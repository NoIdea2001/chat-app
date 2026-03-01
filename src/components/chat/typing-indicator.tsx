"use client";

import { useTypingUsers } from "@/lib/adapters/backend";

interface TypingIndicatorProps {
  conversationId: string;
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const typingUsers = useTypingUsers(conversationId);

  if (!typingUsers || typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.name);
  const text =
    names.length === 1
      ? `${names[0]} is typing`
      : `${names.join(", ")} are typing`;

  return (
    <div className="px-4 py-1">
      <p className="text-xs text-muted-foreground">
        {text}
        <span className="inline-flex ml-0.5">
          <span className="animate-bounce [animation-delay:0ms]">.</span>
          <span className="animate-bounce [animation-delay:150ms]">.</span>
          <span className="animate-bounce [animation-delay:300ms]">.</span>
        </span>
      </p>
    </div>
  );
}

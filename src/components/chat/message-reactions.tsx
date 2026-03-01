"use client";

import { useToggleReaction } from "@/lib/adapters/backend";

interface ReactionData {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: ReactionData[];
}

export function MessageReactions({ messageId, reactions }: MessageReactionsProps) {
  const toggleReaction = useToggleReaction();

  if (reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map(({ emoji, count, reacted }) => (
        <button
          key={emoji}
          onClick={() => toggleReaction({ messageId, emoji })}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border transition-colors ${
            reacted
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-muted border-transparent hover:border-border"
          }`}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </button>
      ))}
    </div>
  );
}

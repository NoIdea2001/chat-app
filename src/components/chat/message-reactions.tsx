"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { REACTION_EMOJIS } from "@/lib/constants";

interface MessageReactionsProps {
  messageId: Id<"messages">;
  reactions: Record<string, { count: number; reacted: boolean }>;
}

export function MessageReactions({ messageId, reactions }: MessageReactionsProps) {
  const toggleReaction = useMutation(api.reactions.toggleReaction);

  const entries = Object.entries(reactions);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {entries.map(([emoji, { count, reacted }]) => (
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

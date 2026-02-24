"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { REACTION_EMOJIS } from "@/lib/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";
import { useState } from "react";

interface ReactionPickerProps {
  messageId: Id<"messages">;
}

export function ReactionPicker({ messageId }: ReactionPickerProps) {
  const toggleReaction = useMutation(api.reactions.toggleReaction);
  const [open, setOpen] = useState(false);

  const handleReact = async (emoji: string) => {
    await toggleReaction({ messageId, emoji });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
          <SmilePlus className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" side="top" align="center">
        <div className="flex gap-1">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="p-1.5 rounded hover:bg-accent transition-colors text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

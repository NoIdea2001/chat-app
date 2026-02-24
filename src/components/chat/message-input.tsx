"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { useTyping } from "@/hooks/use-typing";

interface MessageInputProps {
  conversationId: Id<"conversations">;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [body, setBody] = useState("");
  const sendMessage = useMutation(api.messages.sendMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startTyping, clearTyping } = useTyping();

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;

    setBody("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    clearTyping(conversationId);
    await sendMessage({ conversationId, body: trimmed });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            handleInput();
            if (e.target.value.trim()) {
              startTyping(conversationId);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!body.trim()}
          className="shrink-0"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

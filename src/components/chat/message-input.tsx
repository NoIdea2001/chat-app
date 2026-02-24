"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { AlertCircle, SendHorizontal } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { useTyping } from "@/hooks/use-typing";

interface MessageInputProps {
  conversationId: Id<"conversations">;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const sendMessage = useMutation(api.messages.sendMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startTyping, clearTyping } = useTyping();
  const lastFailedMessage = useRef<string | null>(null);

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed || isSending) return;

    setBody("");
    setError(null);
    setIsSending(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    clearTyping(conversationId);

    try {
      await sendMessage({ conversationId, body: trimmed });
      lastFailedMessage.current = null;
    } catch (err) {
      lastFailedMessage.current = trimmed;
      setBody(trimmed);
      setError(
        err instanceof Error ? err.message : "Failed to send message"
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage.current) {
      setBody(lastFailedMessage.current);
      handleSend();
    }
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
      {error && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={handleRetry}
            className="font-medium underline hover:no-underline"
          >
            Retry
          </button>
          <button
            onClick={() => setError(null)}
            className="font-medium hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setError(null);
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
          disabled={!body.trim() || isSending}
          className="shrink-0"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

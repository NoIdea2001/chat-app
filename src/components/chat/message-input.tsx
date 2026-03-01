"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useSendMessage } from "@/lib/adapters/backend";
import { Button } from "@/components/ui/button";
import { AlertCircle, SendHorizontal } from "lucide-react";
import { useTyping } from "@/hooks/use-typing";

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const sendMessage = useSendMessage();
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
    <div className="p-4 bg-background mb-4">
      {error && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 font-medium">{error}</span>
          <button
            onClick={handleRetry}
            className="font-semibold underline hover:no-underline"
          >
            Retry
          </button>
          <button
            onClick={() => setError(null)}
            className="font-medium hover:opacity-70 p-1"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 max-w-4xl mx-auto align-middle">
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
          className="flex-1 resize-none rounded-2xl border border-border/50 bg-muted/20 px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 min-h-[44px]"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!body.trim() || isSending}
          className="shrink-0 h-11 w-11 rounded-full shadow-md hover:shadow-lg transition-shadow bg-primary text-primary-foreground"
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

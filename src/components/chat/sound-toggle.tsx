"use client";

import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useNotificationSound } from "@/hooks/use-notification-sound";

export function SoundToggle() {
  const { isMuted, toggleMute } = useNotificationSound();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMute}
      className="h-8 w-8"
    >
      {isMuted ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      <span className="sr-only">{isMuted ? "Unmute" : "Mute"} notifications</span>
    </Button>
  );
}

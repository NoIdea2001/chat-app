"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const MUTE_KEY = "chat-notification-muted";

function playNotificationTone() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);

    oscillator.onended = () => ctx.close();
  } catch {
    // Audio not available
  }
}

export function useNotificationSound() {
  const [isMuted, setIsMuted] = useState(true); // default muted until loaded
  const initialized = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(MUTE_KEY);
    setIsMuted(stored === "true");
    initialized.current = true;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem(MUTE_KEY, String(next));
      return next;
    });
  }, []);

  const playSound = useCallback(() => {
    if (!initialized.current) return;
    if (isMuted) return;
    playNotificationTone();
  }, [isMuted]);

  return { isMuted, toggleMute, playSound };
}

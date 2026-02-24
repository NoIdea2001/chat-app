"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const MUTE_KEY = "chat-notification-muted";

function playNotificationTone() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Gentle two-note chime (C6 → E6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1047, now); // C6
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.start(now);
    osc1.stop(now + 0.15);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1319, now + 0.12); // E6
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.06, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.3);

    osc2.onended = () => ctx.close();
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

  // Request browser notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
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

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted" &&
      document.hidden
    ) {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  }, []);

  return { isMuted, toggleMute, playSound, sendBrowserNotification };
}

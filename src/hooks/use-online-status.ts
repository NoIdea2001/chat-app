"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/adapters/auth";
import { useUpdateOnlineStatus } from "@/lib/adapters/backend";
import { ONLINE_CHECK_INTERVAL_MS } from "@/lib/constants";

export function useOnlineStatus() {
  const { user } = useAuth();
  const updateStatus = useUpdateOnlineStatus();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;

    const externalAuthId = user.id;

    const setOnline = () => updateStatus({ externalAuthId, isOnline: true });
    const setOffline = () => updateStatus({ externalAuthId, isOnline: false });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setOnline();
      } else {
        setOffline();
      }
    };

    // Set online on mount
    setOnline();

    // Heartbeat
    intervalRef.current = setInterval(setOnline, ONLINE_CHECK_INTERVAL_MS);

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", setOffline);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", setOffline);
      setOffline();
    };
  }, [user, updateStatus]);
}

"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ONLINE_CHECK_INTERVAL_MS } from "@/lib/constants";

export function useOnlineStatus() {
  const { user } = useUser();
  const updateStatus = useMutation(api.users.updateOnlineStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;

    const clerkId = user.id;

    const setOnline = () => updateStatus({ clerkId, isOnline: true });
    const setOffline = () => updateStatus({ clerkId, isOnline: false });

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

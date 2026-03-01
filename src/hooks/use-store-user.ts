"use client";

import { useAuth } from "@/lib/adapters/auth";
import { useUpsertUser } from "@/lib/adapters/backend";
import { useEffect, useRef } from "react";

export function useStoreUser() {
  const { user, isLoaded } = useAuth();
  const upsertUser = useUpsertUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || hasSynced.current) return;

    const syncUser = async () => {
      await upsertUser({
        externalAuthId: user.id,
        name: user.fullName ?? user.firstName ?? "Unknown",
        email: user.email ?? "",
        imageUrl: user.imageUrl,
      });
      hasSynced.current = true;
    };

    syncUser();
  }, [isLoaded, user, upsertUser]);
}

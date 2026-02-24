"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../convex/_generated/api";

export function useStoreUser() {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || hasSynced.current) return;

    const syncUser = async () => {
      await upsertUser({
        clerkId: user.id,
        name: user.fullName ?? user.firstName ?? "Unknown",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        imageUrl: user.imageUrl,
      });
      hasSynced.current = true;
    };

    syncUser();
  }, [isLoaded, user, upsertUser]);
}

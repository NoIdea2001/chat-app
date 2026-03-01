"use client";

import { useUser, useClerk, useAuth as useClerkAuth_ } from "@clerk/nextjs";
import { useMemo, useCallback } from "react";
import type { IAuthProvider, AuthUser } from "./types";

/**
 * Clerk implementation of IAuthProvider.
 *
 * Returns a stable object that satisfies the auth interface so that
 * consumers never import from `@clerk/nextjs` directly.
 *
 * Note: `isAuthenticated` is derived from Clerk's own `isSignedIn` state
 * rather than from a backend-specific hook, keeping auth decoupled from
 * the database layer.
 */
export function useClerkAuth(): IAuthProvider {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useClerkAuth_();
  const { signOut: clerkSignOut } = useClerk();

  const authUser: AuthUser | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      fullName: user.fullName,
      firstName: user.firstName,
      email: user.primaryEmailAddress?.emailAddress ?? null,
      imageUrl: user.imageUrl,
    };
  }, [user]);

  const signOut = useCallback(async () => {
    await clerkSignOut();
  }, [clerkSignOut]);

  return useMemo(
    () => ({
      isLoaded,
      isAuthenticated: !!isSignedIn,
      user: authUser,
      signOut,
    }),
    [isLoaded, isSignedIn, authUser, signOut],
  );
}

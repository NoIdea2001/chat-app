"use client";

import { createContext, useContext } from "react";
import type { IAuthProvider } from "./types";

const defaultAuth: IAuthProvider = {
  isLoaded: false,
  isAuthenticated: false,
  user: null,
  signOut: async () => {},
};

export const AuthContext = createContext<IAuthProvider>(defaultAuth);

/**
 * Hook to consume the auth adapter from any component.
 *
 * Usage:
 *   const { user, signOut, isAuthenticated } = useAuth();
 */
export function useAuth(): IAuthProvider {
  return useContext(AuthContext);
}

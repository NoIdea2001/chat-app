/**
 * Platform-independent auth types and interface.
 *
 * Any auth provider (Clerk, Auth0, Firebase Auth, …) must satisfy
 * IAuthProvider so that the rest of the application never imports
 * provider-specific code directly.
 */

export interface AuthUser {
  id: string; // provider-scoped unique id (e.g. Clerk userId)
  fullName: string | null;
  firstName: string | null;
  email: string | null;
  imageUrl: string;
}

export interface IAuthProvider {
  /** Whether the auth state has finished loading. */
  isLoaded: boolean;
  /** Whether the user is currently authenticated. */
  isAuthenticated: boolean;
  /** The currently authenticated user, or null. */
  user: AuthUser | null;
  /** Sign the user out. */
  signOut: () => Promise<void>;
}

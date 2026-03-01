import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Resolve the currently authenticated user from the Convex auth identity.
 *
 * Throws if the request is not authenticated or the user record does not
 * exist in the database.  Use `getCurrentUserOrNull` when a null return
 * is acceptable (e.g. in queries that simply return an empty result).
 */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_externalAuthId", (q) =>
      q.eq("externalAuthId", identity.subject),
    )
    .unique();
  if (!user) throw new Error("User not found");

  return user;
}

/**
 * Same as `getCurrentUser` but returns `null` instead of throwing when
 * the user is not authenticated or not found.
 */
export async function getCurrentUserOrNull(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_externalAuthId", (q) =>
      q.eq("externalAuthId", identity.subject),
    )
    .unique();
}

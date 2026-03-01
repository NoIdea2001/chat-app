import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getCurrentUserOrNull } from "./helpers";

// If a user hasn't sent a heartbeat in this window, treat them as offline
const ONLINE_TIMEOUT_MS = 60_000; // 60 seconds (2x the 30s heartbeat)

function isUserOnline(user: Doc<"users">): boolean {
  if (!user.isOnline) return false;
  return Date.now() - user.lastSeen < ONLINE_TIMEOUT_MS;
}

export const upsertUser = mutation({
  args: {
    externalAuthId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_externalAuthId", (q) =>
        q.eq("externalAuthId", args.externalAuthId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        isOnline: true,
        lastSeen: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      externalAuthId: args.externalAuthId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      isOnline: true,
      lastSeen: Date.now(),
    });
  },
});

export const getUser = query({
  args: { externalAuthId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_externalAuthId", (q) =>
        q.eq("externalAuthId", args.externalAuthId),
      )
      .unique();
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((user) => ({
      ...user,
      isOnline: isUserOnline(user),
    }));
  },
});

export const searchUsers = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withSearchIndex("search_name", (q) => q.search("name", args.name))
      .collect();
    return users.map((user) => ({
      ...user,
      isOnline: isUserOnline(user),
    }));
  },
});

export const updateOnlineStatus = mutation({
  args: {
    externalAuthId: v.string(),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_externalAuthId", (q) =>
        q.eq("externalAuthId", args.externalAuthId),
      )
      .unique();

    if (!user) return;

    await ctx.db.patch(user._id, {
      isOnline: args.isOnline,
      lastSeen: Date.now(),
    });
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx);
  },
});

// Internal mutation used by the cron job to clean stale online statuses
export const cleanStaleOnlineStatuses = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const now = Date.now();
    for (const user of users) {
      if (user.isOnline && now - user.lastSeen >= ONLINE_TIMEOUT_MS) {
        await ctx.db.patch(user._id, { isOnline: false });
      }
    }
  },
});

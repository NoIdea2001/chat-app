import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("readStatus")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", user._id).eq("conversationId", args.conversationId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastReadTime: Date.now() });
    } else {
      await ctx.db.insert("readStatus", {
        conversationId: args.conversationId,
        userId: user._id,
        lastReadTime: Date.now(),
      });
    }
  },
});

export const getUnreadCounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return {};

    const allConversations = await ctx.db.query("conversations").collect();
    const myConversations = allConversations.filter((c) =>
      c.participants.includes(user._id)
    );

    const counts: Record<string, number> = {};

    for (const conversation of myConversations) {
      const readStatus = await ctx.db
        .query("readStatus")
        .withIndex("by_user_conversation", (q) =>
          q.eq("userId", user._id).eq("conversationId", conversation._id)
        )
        .unique();

      const lastReadTime = readStatus?.lastReadTime ?? 0;

      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id)
        )
        .collect();

      const unread = messages.filter(
        (m) => m.createdAt > lastReadTime && m.senderId !== user._id
      ).length;

      if (unread > 0) {
        counts[conversation._id] = unread;
      }
    }

    return counts;
  },
});

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, getCurrentUserOrNull } from "./helpers";

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

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

export const getReadStatusForMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) return null;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    // Only for 1:1 conversations
    if (conversation.isGroup || conversation.participants.length !== 2) return null;

    const otherUserId = conversation.participants.find((id) => id !== user._id);
    if (!otherUserId) return null;

    const otherReadStatus = await ctx.db
      .query("readStatus")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", otherUserId).eq("conversationId", args.conversationId)
      )
      .unique();

    return otherReadStatus?.lastReadTime ?? null;
  },
});

export const getUnreadCounts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
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

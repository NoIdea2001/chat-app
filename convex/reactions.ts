import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) throw new Error("User not found");

    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_message_user_emoji", (q) =>
        q
          .eq("messageId", args.messageId)
          .eq("userId", currentUser._id)
          .eq("emoji", args.emoji)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId: currentUser._id,
        emoji: args.emoji,
      });
    }
  },
});

export const getReactions = query({
  args: {
    messageIds: v.array(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const result: Record<
      string,
      Record<string, { count: number; reacted: boolean }>
    > = {};

    for (const messageId of args.messageIds) {
      const reactions = await ctx.db
        .query("reactions")
        .withIndex("by_message", (q) => q.eq("messageId", messageId))
        .collect();

      if (reactions.length === 0) continue;

      const grouped: Record<string, { count: number; reacted: boolean }> = {};
      for (const r of reactions) {
        if (!grouped[r.emoji]) {
          grouped[r.emoji] = { count: 0, reacted: false };
        }
        grouped[r.emoji].count++;
        if (currentUser && r.userId === currentUser._id) {
          grouped[r.emoji].reacted = true;
        }
      }
      result[messageId] = grouped;
    }

    return result;
  },
});

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

    // Find existing reaction by scanning (more reliable than compound index with emoji)
    const allUserReactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();

    const existing = allUserReactions.find(
      (r) => r.userId === currentUser._id && r.emoji === args.emoji
    );

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

    let currentUserId: string | null = null;
    if (identity) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();
      currentUserId = currentUser?._id ?? null;
    }

    const result: Array<{
      messageId: string;
      emoji: string;
      count: number;
      reacted: boolean;
    }> = [];

    for (const messageId of args.messageIds) {
      const reactions = await ctx.db
        .query("reactions")
        .withIndex("by_message", (q) => q.eq("messageId", messageId))
        .collect();

      if (reactions.length === 0) continue;

      const grouped = new Map<string, { count: number; reacted: boolean }>();
      for (const r of reactions) {
        const existing = grouped.get(r.emoji) ?? { count: 0, reacted: false };
        existing.count++;
        if (currentUserId && r.userId === currentUserId) {
          existing.reacted = true;
        }
        grouped.set(r.emoji, existing);
      }

      for (const [emoji, data] of grouped) {
        result.push({
          messageId,
          emoji,
          count: data.count,
          reacted: data.reacted,
        });
      }
    }

    return result;
  },
});

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

    // Fetch all user reactions for the given message
    const userReactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();

    // Delete all other reactions by the same user for the message to ensure only one exists
    const userExistingReactions = userReactions.filter((r) => r.userId === currentUser._id);
    for (const reaction of userExistingReactions) {
      if (reaction.emoji !== args.emoji) {
        await ctx.db.delete(reaction._id);
      }
    }

    // Check for the specific emoji reaction by the user
    const existingReaction = userReactions.find(
      (r) => r.userId === currentUser._id && r.emoji === args.emoji
    );

    if (existingReaction) {
      await ctx.db.delete(existingReaction._id);
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
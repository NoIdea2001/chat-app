import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (!conversation.participants.includes(currentUser._id)) {
      throw new Error("Not a participant");
    }

    const now = Date.now();

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: currentUser._id,
      body: args.body,
      isDeleted: false,
      createdAt: now,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageTime: now,
      lastMessagePreview: args.body.slice(0, 100),
      lastMessageSender: currentUser._id,
    });
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== currentUser._id) {
      throw new Error("Can only delete your own messages");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      body: "",
    });
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return { ...message, sender };
      }),
    );
  },
});

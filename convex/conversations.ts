import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createOrGetConversation = mutation({
  args: {
    participantUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) throw new Error("User not found");

    if (currentUser._id === args.participantUserId) {
      throw new Error("Cannot create conversation with yourself");
    }

    // Search for existing 1:1 conversation between these two users
    const allConversations = await ctx.db.query("conversations").collect();
    const existing = allConversations.find(
      (c) =>
        !c.isGroup &&
        c.participants.length === 2 &&
        c.participants.includes(currentUser._id) &&
        c.participants.includes(args.participantUserId)
    );

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      isGroup: false,
      participants: [currentUser._id, args.participantUserId],
      lastMessageTime: Date.now(),
      createdBy: currentUser._id,
    });
  },
});

export const getMyConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) return [];

    const allConversations = await ctx.db
      .query("conversations")
      .withIndex("by_lastMessageTime")
      .order("desc")
      .collect();

    const myConversations = allConversations.filter((c) =>
      c.participants.includes(currentUser._id)
    );

    const result = await Promise.all(
      myConversations.map(async (conversation) => {
        const otherParticipantIds = conversation.participants.filter(
          (id) => id !== currentUser._id
        );
        const otherParticipants = await Promise.all(
          otherParticipantIds.map((id) => ctx.db.get(id))
        );

        return {
          ...conversation,
          otherParticipants: otherParticipants.filter(Boolean),
          currentUserId: currentUser._id,
        };
      })
    );

    return result;
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) return null;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    if (!conversation.participants.includes(currentUser._id)) return null;

    const otherParticipantIds = conversation.participants.filter(
      (id) => id !== currentUser._id
    );
    const otherParticipants = await Promise.all(
      otherParticipantIds.map((id) => ctx.db.get(id))
    );

    return {
      ...conversation,
      otherParticipants: otherParticipants.filter(Boolean),
      currentUserId: currentUser._id,
    };
  },
});

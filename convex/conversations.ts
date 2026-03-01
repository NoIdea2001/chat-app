import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, getCurrentUserOrNull } from "./helpers";

export const createOrGetConversation = mutation({
  args: {
    participantUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

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
    const currentUser = await getCurrentUserOrNull(ctx);
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

export const createGroupConversation = mutation({
  args: {
    participantIds: v.array(v.id("users")),
    groupName: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    if (args.participantIds.length < 1) {
      throw new Error("Group must have at least 1 other participant");
    }

    const allParticipants = [currentUser._id, ...args.participantIds.filter(
      (id) => id !== currentUser._id
    )];

    return await ctx.db.insert("conversations", {
      isGroup: true,
      groupName: args.groupName,
      participants: allParticipants,
      lastMessageTime: Date.now(),
      createdBy: currentUser._id,
    });
  },
});

export const addGroupMember = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (!conversation.isGroup) throw new Error("Not a group conversation");
    if (!conversation.participants.includes(currentUser._id)) {
      throw new Error("Not a participant");
    }
    if (conversation.participants.includes(args.userId)) {
      throw new Error("User already in group");
    }

    await ctx.db.patch(args.conversationId, {
      participants: [...conversation.participants, args.userId],
    });
  },
});

export const removeGroupMember = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (!conversation.isGroup) throw new Error("Not a group conversation");
    if (!conversation.participants.includes(currentUser._id)) {
      throw new Error("Not a participant");
    }
    if (!conversation.participants.includes(args.userId)) {
      throw new Error("User not in group");
    }

    // Prevent removing the last member or the creator if they are the only one left
    if (conversation.participants.length <= 1) {
      throw new Error("Cannot remove the last member of the group");
    }

    await ctx.db.patch(args.conversationId, {
      participants: conversation.participants.filter((id) => id !== args.userId),
    });
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrNull(ctx);
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

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    externalAuthId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  })
    .index("by_externalAuthId", ["externalAuthId"])
    .searchIndex("search_name", { searchField: "name" }),

  conversations: defineTable({
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    participants: v.array(v.id("users")),
    lastMessageTime: v.optional(v.number()),
    lastMessagePreview: v.optional(v.string()),
    lastMessageSender: v.optional(v.id("users")),
    createdBy: v.optional(v.id("users")),
  }).index("by_lastMessageTime", ["lastMessageTime"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
    isDeleted: v.boolean(),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId", "createdAt"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_message_user_emoji", ["messageId", "userId", "emoji"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastTyped: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  readStatus: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadTime: v.number(),
  })
    .index("by_user_conversation", ["userId", "conversationId"])
    .index("by_conversation", ["conversationId"]),
});

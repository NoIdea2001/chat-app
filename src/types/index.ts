import { Id } from "../../convex/_generated/dataModel";

export type User = {
  _id: Id<"users">;
  clerkId: string;
  name: string;
  email: string;
  imageUrl?: string;
  isOnline: boolean;
  lastSeen: number;
};

export type Conversation = {
  _id: Id<"conversations">;
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  participants: Id<"users">[];
  lastMessageTime?: number;
  lastMessagePreview?: string;
  lastMessageSender?: Id<"users">;
  createdBy?: Id<"users">;
};

export type Message = {
  _id: Id<"messages">;
  conversationId: Id<"conversations">;
  senderId: Id<"users">;
  body: string;
  isDeleted: boolean;
  fileId?: Id<"_storage">;
  fileName?: string;
  fileType?: string;
  createdAt: number;
};

export type Reaction = {
  _id: Id<"reactions">;
  messageId: Id<"messages">;
  userId: Id<"users">;
  emoji: string;
};

export type TypingIndicator = {
  _id: Id<"typingIndicators">;
  conversationId: Id<"conversations">;
  userId: Id<"users">;
  lastTyped: number;
};

export type ReadStatus = {
  _id: Id<"readStatus">;
  conversationId: Id<"conversations">;
  userId: Id<"users">;
  lastReadTime: number;
};

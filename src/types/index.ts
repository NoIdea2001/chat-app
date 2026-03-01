/**
 * Platform-independent type definitions.
 *
 * All IDs are opaque strings so that the domain layer never depends on a
 * concrete backend (Convex, Supabase, Firebase, …).
 */

// ---------------------------------------------------------------------------
// Core entities
// ---------------------------------------------------------------------------

export type User = {
  _id: string;
  externalAuthId: string;
  name: string;
  email: string;
  imageUrl?: string;
  isOnline: boolean;
  lastSeen: number;
};

export type Conversation = {
  _id: string;
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  participants: string[];
  lastMessageTime?: number;
  lastMessagePreview?: string;
  lastMessageSender?: string;
  createdBy?: string;
};

export type Message = {
  _id: string;
  conversationId: string;
  senderId: string;
  body: string;
  isDeleted: boolean;
  fileId?: string;
  fileName?: string;
  fileType?: string;
  createdAt: number;
};

export type MessageWithSender = Message & {
  sender: Pick<User, "_id" | "name" | "imageUrl"> | null;
};

export type Reaction = {
  _id: string;
  messageId: string;
  userId: string;
  emoji: string;
};

export type AggregatedReaction = {
  messageId: string;
  emoji: string;
  count: number;
  reacted: boolean;
};

export type TypingIndicator = {
  _id: string;
  conversationId: string;
  userId: string;
  lastTyped: number;
};

export type TypingUser = {
  _id: string;
  name: string;
};

export type ReadStatus = {
  _id: string;
  conversationId: string;
  userId: string;
  lastReadTime: number;
};

// ---------------------------------------------------------------------------
// Enriched / view-level types returned by repository queries
// ---------------------------------------------------------------------------

export type ConversationWithParticipants = Conversation & {
  otherParticipants: User[];
  currentUserId: string;
};

export type ConversationDetail = ConversationWithParticipants & {
  resolvedParticipants: User[];
};

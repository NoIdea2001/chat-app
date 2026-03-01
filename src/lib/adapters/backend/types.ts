/**
 * Backend adapter interfaces.
 *
 * Each interface describes a repository whose methods are standalone
 * React hooks.  The hooks are called directly by consumers — they are
 * NOT methods on an object returned by another hook.
 *
 * Every "use*" function follows React's Rules of Hooks.
 */

import type {
  User,
  ConversationWithParticipants,
  ConversationDetail,
  MessageWithSender,
  AggregatedReaction,
  TypingUser,
} from "@/types";

// ---------------------------------------------------------------------------
// User hooks
// ---------------------------------------------------------------------------

export interface IUserRepository {
  useCurrentUser(): User | null | undefined;
  useAllUsers(): User[] | undefined;
  useSearchUsers(name: string | undefined): User[] | undefined;
  useUpsertUser(): (params: {
    externalAuthId: string;
    name: string;
    email: string;
    imageUrl?: string;
  }) => Promise<string>;
  useUpdateOnlineStatus(): (params: {
    externalAuthId: string;
    isOnline: boolean;
  }) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Conversation hooks
// ---------------------------------------------------------------------------

export interface IConversationRepository {
  useMyConversations(): ConversationWithParticipants[] | undefined;
  useConversation(conversationId: string): ConversationDetail | null | undefined;
  useCreateOrGetConversation(): (params: {
    participantUserId: string;
  }) => Promise<string>;
  useCreateGroupConversation(): (params: {
    participantIds: string[];
    groupName: string;
  }) => Promise<string>;
  useAddGroupMember(): (params: {
    conversationId: string;
    userId: string;
  }) => Promise<void>;
  useRemoveGroupMember(): (params: {
    conversationId: string;
    userId: string;
  }) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Message hooks
// ---------------------------------------------------------------------------

export interface IMessageRepository {
  useMessages(conversationId: string): MessageWithSender[] | undefined;
  useSendMessage(): (params: {
    conversationId: string;
    body: string;
  }) => Promise<void>;
  useDeleteMessage(): (params: { messageId: string }) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Reaction hooks
// ---------------------------------------------------------------------------

export interface IReactionRepository {
  useReactions(messageIds: string[]): AggregatedReaction[] | undefined;
  useToggleReaction(): (params: {
    messageId: string;
    emoji: string;
  }) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Typing hooks
// ---------------------------------------------------------------------------

export interface ITypingRepository {
  useTypingUsers(conversationId: string): TypingUser[] | undefined;
  useSetTyping(): (params: { conversationId: string }) => Promise<void>;
  useClearTyping(): (params: { conversationId: string }) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Read-status hooks
// ---------------------------------------------------------------------------

export interface IReadStatusRepository {
  useUnreadCounts(): Record<string, number> | undefined;
  useReadStatus(conversationId: string): number | null | undefined;
  useMarkAsRead(): (params: { conversationId: string }) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Aggregate backend (all repositories)
// ---------------------------------------------------------------------------

export interface IBackend {
  users: IUserRepository;
  conversations: IConversationRepository;
  messages: IMessageRepository;
  reactions: IReactionRepository;
  typing: ITypingRepository;
  readStatus: IReadStatusRepository;
}

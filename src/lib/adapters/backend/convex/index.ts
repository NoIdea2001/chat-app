"use client";

/**
 * Convex implementation of all backend adapter hooks.
 *
 * Each exported function is a standard React hook that wraps Convex's
 * `useQuery` / `useMutation`.  The Convex-specific Id types are cast
 * at this boundary so that consumers only work with plain strings.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCallback } from "react";
import type {
  User,
  ConversationWithParticipants,
  ConversationDetail,
  MessageWithSender,
  AggregatedReaction,
  TypingUser,
} from "@/types";

// ── User hooks ──────────────────────────────────────────────────────────────

export function useCurrentUser(): User | null | undefined {
  return useQuery(api.users.getMe) as User | null | undefined;
}

export function useAllUsers(): User[] | undefined {
  return useQuery(api.users.getAllUsers) as User[] | undefined;
}

export function useSearchUsers(name: string | undefined): User[] | undefined {
  return useQuery(
    api.users.searchUsers,
    name ? { name } : "skip",
  ) as User[] | undefined;
}

export function useUpsertUser(): (params: {
  externalAuthId: string;
  name: string;
  email: string;
  imageUrl?: string;
}) => Promise<string> {
  const mutation = useMutation(api.users.upsertUser);
  return useCallback(
    async (params) => {
      const id = await mutation(params);
      return id as unknown as string;
    },
    [mutation],
  );
}

export function useUpdateOnlineStatus(): (params: {
  externalAuthId: string;
  isOnline: boolean;
}) => Promise<void> {
  const mutation = useMutation(api.users.updateOnlineStatus);
  return useCallback(
    async (params) => {
      await mutation(params);
    },
    [mutation],
  );
}

// ── Conversation hooks ──────────────────────────────────────────────────────

export function useMyConversations(): ConversationWithParticipants[] | undefined {
  return useQuery(api.conversations.getMyConversations) as
    | ConversationWithParticipants[]
    | undefined;
}

export function useConversation(
  conversationId: string,
): ConversationDetail | null | undefined {
  return useQuery(api.conversations.getConversation, {
    conversationId: conversationId as Id<"conversations">,
  }) as ConversationDetail | null | undefined;
}

export function useCreateOrGetConversation(): (params: {
  participantUserId: string;
}) => Promise<string> {
  const mutation = useMutation(api.conversations.createOrGetConversation);
  return useCallback(
    async (params) => {
      const id = await mutation({
        participantUserId: params.participantUserId as Id<"users">,
      });
      return id as unknown as string;
    },
    [mutation],
  );
}

export function useCreateGroupConversation(): (params: {
  participantIds: string[];
  groupName: string;
}) => Promise<string> {
  const mutation = useMutation(api.conversations.createGroupConversation);
  return useCallback(
    async (params) => {
      const id = await mutation({
        participantIds: params.participantIds as Id<"users">[],
        groupName: params.groupName,
      });
      return id as unknown as string;
    },
    [mutation],
  );
}

export function useAddGroupMember(): (params: {
  conversationId: string;
  userId: string;
}) => Promise<void> {
  const mutation = useMutation(api.conversations.addGroupMember);
  return useCallback(
    async (params) => {
      await mutation({
        conversationId: params.conversationId as Id<"conversations">,
        userId: params.userId as Id<"users">,
      });
    },
    [mutation],
  );
}

export function useRemoveGroupMember(): (params: {
  conversationId: string;
  userId: string;
}) => Promise<void> {
  const mutation = useMutation(api.conversations.removeGroupMember);
  return useCallback(
    async (params) => {
      await mutation({
        conversationId: params.conversationId as Id<"conversations">,
        userId: params.userId as Id<"users">,
      });
    },
    [mutation],
  );
}

// ── Message hooks ───────────────────────────────────────────────────────────

export function useMessages(
  conversationId: string,
): MessageWithSender[] | undefined {
  return useQuery(api.messages.getMessages, {
    conversationId: conversationId as Id<"conversations">,
  }) as MessageWithSender[] | undefined;
}

export function useSendMessage(): (params: {
  conversationId: string;
  body: string;
}) => Promise<void> {
  const mutation = useMutation(api.messages.sendMessage);
  return useCallback(
    async (params) => {
      await mutation({
        conversationId: params.conversationId as Id<"conversations">,
        body: params.body,
      });
    },
    [mutation],
  );
}

export function useDeleteMessage(): (params: {
  messageId: string;
}) => Promise<void> {
  const mutation = useMutation(api.messages.deleteMessage);
  return useCallback(
    async (params) => {
      await mutation({
        messageId: params.messageId as Id<"messages">,
      });
    },
    [mutation],
  );
}

// ── Reaction hooks ──────────────────────────────────────────────────────────

export function useReactions(
  messageIds: string[],
): AggregatedReaction[] | undefined {
  return useQuery(
    api.reactions.getReactions,
    messageIds.length > 0
      ? { messageIds: messageIds as Id<"messages">[] }
      : "skip",
  ) as AggregatedReaction[] | undefined;
}

export function useToggleReaction(): (params: {
  messageId: string;
  emoji: string;
}) => Promise<void> {
  const mutation = useMutation(api.reactions.toggleReaction);
  return useCallback(
    async (params) => {
      await mutation({
        messageId: params.messageId as Id<"messages">,
        emoji: params.emoji,
      });
    },
    [mutation],
  );
}

// ── Typing hooks ────────────────────────────────────────────────────────────

export function useTypingUsers(
  conversationId: string,
): TypingUser[] | undefined {
  return useQuery(api.typing.getTypingUsers, {
    conversationId: conversationId as Id<"conversations">,
  }) as TypingUser[] | undefined;
}

export function useSetTyping(): (params: {
  conversationId: string;
}) => Promise<void> {
  const mutation = useMutation(api.typing.setTyping);
  return useCallback(
    async (params) => {
      await mutation({
        conversationId: params.conversationId as Id<"conversations">,
      });
    },
    [mutation],
  );
}

export function useClearTyping(): (params: {
  conversationId: string;
}) => Promise<void> {
  const mutation = useMutation(api.typing.clearTyping);
  return useCallback(
    async (params) => {
      await mutation({
        conversationId: params.conversationId as Id<"conversations">,
      });
    },
    [mutation],
  );
}

// ── Read-status hooks ───────────────────────────────────────────────────────

export function useUnreadCounts(): Record<string, number> | undefined {
  return useQuery(api.readStatus.getUnreadCounts) as
    | Record<string, number>
    | undefined;
}

export function useReadStatus(
  conversationId: string,
): number | null | undefined {
  return useQuery(api.readStatus.getReadStatusForMessages, {
    conversationId: conversationId as Id<"conversations">,
  }) as number | null | undefined;
}

export function useMarkAsRead(): (params: {
  conversationId: string;
}) => Promise<void> {
  const mutation = useMutation(api.readStatus.markAsRead);
  return useCallback(
    async (params) => {
      await mutation({
        conversationId: params.conversationId as Id<"conversations">,
      });
    },
    [mutation],
  );
}

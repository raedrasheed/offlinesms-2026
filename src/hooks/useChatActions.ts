import { useCallback, useMemo } from 'react';
import { ChatService, buildReplyPreview } from '@/services/chatService';
import { GroupService } from '@/services/groupService';
import { useAuth } from '@/hooks/useAuth';
import { Chat, ChatMessage, Group, ReplyPreview } from '@/types/models';

interface ChatActions {
  pin: (chat: Chat | Group, on: boolean) => Promise<void>;
  mute: (chat: Chat | Group, on: boolean) => Promise<void>;
  archive: (chat: Chat, on: boolean) => Promise<void>;
  react: (chatId: string, messageId: string, emoji: string, isGroup?: boolean) => Promise<void>;
  reply: (m: ChatMessage, senderName?: string) => ReplyPreview;
  remove: (chatId: string, messageId: string, isGroup?: boolean) => Promise<void>;
  isPinned: (chat: Chat | Group) => boolean;
  isMuted: (chat: Chat | Group) => boolean;
  isArchived: (chat: Chat) => boolean;
  hasReacted: (m: ChatMessage, emoji: string) => boolean;
}

/**
 * Returns memoized callbacks for the most common per-chat actions,
 * already bound to the current authenticated user. Callers just supply
 * the chat/message they're acting on.
 *
 * Group helpers automatically dispatch to GroupService when `isGroup`
 * is true; otherwise ChatService is used.
 */
export function useChatActions(): ChatActions {
  const { user } = useAuth();
  const uid = user?.uid;

  const pin = useCallback<ChatActions['pin']>(
    async (chat, on) => {
      if (!uid) return;
      const isGroup = !('members' in chat) || !('unread' in chat);
      const id = (chat as any).id;
      if ('admins' in chat) {
        await GroupService.togglePin(id, uid, on);
      } else {
        await ChatService.togglePin(id, uid, on);
      }
      void isGroup;
    },
    [uid],
  );

  const mute = useCallback<ChatActions['mute']>(
    async (chat, on) => {
      if (!uid) return;
      const id = (chat as any).id;
      if ('admins' in chat) {
        await GroupService.toggleMute(id, uid, on);
      } else {
        await ChatService.toggleMute(id, uid, on);
      }
    },
    [uid],
  );

  const archive = useCallback<ChatActions['archive']>(
    async (chat, on) => {
      if (!uid) return;
      await ChatService.toggleArchive(chat.id, uid, on);
    },
    [uid],
  );

  const react = useCallback<ChatActions['react']>(
    async (chatId, messageId, emoji, isGroup) => {
      if (!uid) return;
      if (isGroup) {
        await GroupService.toggleReaction(chatId, messageId, uid, emoji);
      } else {
        await ChatService.toggleReaction(chatId, messageId, uid, emoji);
      }
    },
    [uid],
  );

  const reply = useCallback<ChatActions['reply']>(
    (m, senderName) => buildReplyPreview(m, senderName),
    [],
  );

  const remove = useCallback<ChatActions['remove']>(
    async (chatId, messageId, isGroup) => {
      if (isGroup) {
        await GroupService.deleteGroupMessage(chatId, messageId);
      } else {
        await ChatService.deleteMessage(chatId, messageId);
      }
    },
    [],
  );

  return useMemo<ChatActions>(
    () => ({
      pin,
      mute,
      archive,
      react,
      reply,
      remove,
      isPinned: (chat) => !!uid && !!chat.pinnedBy?.includes(uid),
      isMuted: (chat) => !!uid && !!chat.mutedBy?.includes(uid),
      isArchived: (chat) => !!uid && !!(chat as Chat).archivedBy?.includes(uid),
      hasReacted: (m, emoji) => !!uid && !!m.reactions?.[emoji]?.includes(uid),
    }),
    [uid, pin, mute, archive, react, reply, remove],
  );
}

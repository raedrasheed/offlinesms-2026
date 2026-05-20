import { useEffect, useState } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { ChatService } from '@/services/chatService';
import { GroupService } from '@/services/groupService';
import { ChatMessage } from '@/types/models';

interface Options {
  /** When true, subscribes to a group's messages instead of a 1:1 chat. */
  isGroup?: boolean;
  /** Optional reader uid — if provided, unread incoming messages are
   * automatically marked as read on each snapshot. Only honoured for
   * 1:1 chats; groups use their own read tracking. */
  readerUid?: string;
}

/** Subscribe to the messages of a chat or group. Returns `null` until the
 * first snapshot arrives, then an in-order array (oldest first). */
export function useMessages(
  chatId: string | undefined,
  options: Options = {},
): ChatMessage[] | null {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);

  useEffect(() => {
    if (!chatId) {
      setMessages(null);
      return;
    }
    let unsub: Unsubscribe | undefined;
    setMessages(null);
    const handler = (msgs: ChatMessage[]) => {
      setMessages(msgs);
      if (!options.isGroup && options.readerUid) {
        const unread = msgs
          .filter(
            (m) =>
              m.senderId !== options.readerUid &&
              !(m.readBy ?? []).includes(options.readerUid!),
          )
          .map((m) => m.id);
        if (unread.length) {
          ChatService.markAsRead(chatId, options.readerUid, unread).catch(() => {});
        }
      }
    };
    unsub = options.isGroup
      ? GroupService.listenToGroupMessages(chatId, handler)
      : ChatService.listenToMessages(chatId, handler);
    return () => unsub?.();
  }, [chatId, options.isGroup, options.readerUid]);

  return messages;
}

import { useEffect, useState } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { ChatService } from '@/services/chatService';
import { Chat } from '@/types/models';

/**
 * Subscribe to the current user's chats. Returns `null` while the first
 * snapshot is in flight, then a sorted array (pinned first, then by
 * lastMessageAt desc).
 */
export function useChats(uid: string | undefined): Chat[] | null {
  const [chats, setChats] = useState<Chat[] | null>(null);

  useEffect(() => {
    if (!uid) {
      setChats(null);
      return;
    }
    let unsub: Unsubscribe | undefined;
    setChats(null);
    unsub = ChatService.listenToUserChats(uid, setChats);
    return () => unsub?.();
  }, [uid]);

  return chats;
}

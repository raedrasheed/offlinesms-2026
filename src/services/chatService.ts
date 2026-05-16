import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  arrayUnion,
  increment,
  writeBatch,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Collections } from '@/firebase/collections';
import { Chat, ChatMessage, MessageStatus } from '@/types/models';

const chatIdFor = (a: string, b: string) => [a, b].sort().join('_');

export const ChatService = {
  async getOrCreateOneToOneChat(currentUid: string, otherUid: string): Promise<string> {
    const chatId = chatIdFor(currentUid, otherUid);
    const ref = doc(db, Collections.chats, chatId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        members: [currentUid, otherUid],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageAt: null,
        lastMessageSenderId: '',
        unread: { [currentUid]: 0, [otherUid]: 0 },
      });
    }
    return chatId;
  },

  listenToUserChats(uid: string, cb: (chats: Chat[]) => void): Unsubscribe {
    const q = query(
      collection(db, Collections.chats),
      where('members', 'array-contains', uid),
      orderBy('lastMessageAt', 'desc'),
    );
    return onSnapshot(q, (snap) => {
      const chats: Chat[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      cb(chats);
    });
  },

  listenToMessages(chatId: string, cb: (msgs: ChatMessage[]) => void): Unsubscribe {
    const q = query(
      collection(db, Collections.chats, chatId, Collections.messages),
      orderBy('createdAt', 'asc'),
    );
    return onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = snap.docs.map((d) => ({
        id: d.id,
        chatId,
        ...(d.data() as any),
      }));
      cb(msgs);
    });
  },

  async sendMessage(chatId: string, senderId: string, text: string) {
    const chatRef = doc(db, Collections.chats, chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) throw new Error('Chat not found');
    const members: string[] = (chatSnap.data() as any).members ?? [];
    const others = members.filter((m) => m !== senderId);

    const msgRef = await addDoc(
      collection(db, Collections.chats, chatId, Collections.messages),
      {
        senderId,
        text,
        type: 'text',
        createdAt: serverTimestamp(),
        status: 'sent' as MessageStatus,
        readBy: [senderId],
      },
    );

    const unreadUpdate: Record<string, any> = {};
    others.forEach((uid) => {
      unreadUpdate[`unread.${uid}`] = increment(1);
    });

    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: senderId,
      ...unreadUpdate,
    });

    return msgRef.id;
  },

  async markAsRead(chatId: string, uid: string, messageIds: string[]) {
    const batch = writeBatch(db);
    messageIds.forEach((mid) => {
      const mref = doc(db, Collections.chats, chatId, Collections.messages, mid);
      batch.update(mref, { status: 'read', readBy: arrayUnion(uid) });
    });
    batch.update(doc(db, Collections.chats, chatId), { [`unread.${uid}`]: 0 });
    await batch.commit();
  },
};

export const formatChatTime = (ts?: Timestamp | null): string => {
  if (!ts) return '';
  const date = ts.toDate();
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (24 * 3600 * 1000));
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString();
};

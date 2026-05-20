import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, storage } from '@/firebase/config';
import { Collections } from '@/firebase/collections';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Chat, ChatMessage, MessageStatus, ReplyPreview } from '@/types/models';

const chatIdFor = (a: string, b: string) => [a, b].sort().join('_');

const previewFromMessage = (m: Pick<ChatMessage, 'text' | 'type'>) => {
  if (m.type === 'image') return '📷 Photo';
  return m.text.length > 60 ? m.text.slice(0, 57) + '…' : m.text;
};

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
        pinnedBy: [],
        mutedBy: [],
        archivedBy: [],
      });
    }
    return chatId;
  },

  listenToUserChats(uid: string, cb: (chats: Chat[]) => void): Unsubscribe {
    const q = query(collection(db, Collections.chats), where('members', 'array-contains', uid));
    return onSnapshot(
      q,
      (snap) => {
        const chats: Chat[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        chats.sort((a, b) => {
          const aPinned = a.pinnedBy?.includes(uid) ? 1 : 0;
          const bPinned = b.pinnedBy?.includes(uid) ? 1 : 0;
          if (aPinned !== bPinned) return bPinned - aPinned;
          const at = a.lastMessageAt?.toMillis?.() ?? 0;
          const bt = b.lastMessageAt?.toMillis?.() ?? 0;
          return bt - at;
        });
        cb(chats);
      },
      (err) => {
        console.warn('listenToUserChats error', err);
        cb([]);
      },
    );
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

  async sendMessage(
    chatId: string,
    senderId: string,
    text: string,
    options?: { replyTo?: ReplyPreview | null },
  ) {
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
        replyTo: options?.replyTo ?? null,
      },
    );

    const unreadUpdate: Record<string, any> = {};
    others.forEach((uid) => {
      unreadUpdate[`unread.${uid}`] = increment(1);
    });

    await updateDoc(chatRef, {
      lastMessage: previewFromMessage({ text, type: 'text' }),
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: senderId,
      ...unreadUpdate,
      // sending a message brings the chat back from archive for both parties
      archivedBy: [],
    });

    return msgRef.id;
  },

  async sendImage(chatId: string, senderId: string, localUri: string) {
    const res = await fetch(localUri);
    const blob = await res.blob();
    const name = `${Date.now()}_${senderId}.jpg`;
    const ref = storageRef(storage, `chats/${chatId}/${senderId}/${name}`);
    await uploadBytes(ref, blob, { contentType: 'image/jpeg' });
    const url = await getDownloadURL(ref);

    const chatRef = doc(db, Collections.chats, chatId);
    const chatSnap = await getDoc(chatRef);
    const members: string[] = (chatSnap.data() as any)?.members ?? [];
    const others = members.filter((m) => m !== senderId);

    await addDoc(collection(db, Collections.chats, chatId, Collections.messages), {
      senderId,
      text: '',
      type: 'image',
      attachmentURL: url,
      createdAt: serverTimestamp(),
      status: 'sent' as MessageStatus,
      readBy: [senderId],
      replyTo: null,
    });

    const unreadUpdate: Record<string, any> = {};
    others.forEach((uid) => {
      unreadUpdate[`unread.${uid}`] = increment(1);
    });
    await updateDoc(chatRef, {
      lastMessage: '📷 Photo',
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: senderId,
      ...unreadUpdate,
      archivedBy: [],
    });
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

  async deleteMessage(chatId: string, messageId: string) {
    await deleteDoc(doc(db, Collections.chats, chatId, Collections.messages, messageId));
  },

  async togglePin(chatId: string, uid: string, on: boolean) {
    await updateDoc(doc(db, Collections.chats, chatId), {
      pinnedBy: on ? arrayUnion(uid) : arrayRemove(uid),
    });
  },

  async toggleMute(chatId: string, uid: string, on: boolean) {
    await updateDoc(doc(db, Collections.chats, chatId), {
      mutedBy: on ? arrayUnion(uid) : arrayRemove(uid),
    });
  },

  async toggleArchive(chatId: string, uid: string, on: boolean) {
    await updateDoc(doc(db, Collections.chats, chatId), {
      archivedBy: on ? arrayUnion(uid) : arrayRemove(uid),
    });
  },

  async toggleReaction(chatId: string, messageId: string, uid: string, emoji: string) {
    const mref = doc(db, Collections.chats, chatId, Collections.messages, messageId);
    const snap = await getDoc(mref);
    const data = snap.data() as any;
    const current: string[] = data?.reactions?.[emoji] ?? [];
    const has = current.includes(uid);
    const next = has ? current.filter((u) => u !== uid) : [...current, uid];
    await updateDoc(mref, {
      [`reactions.${emoji}`]: next,
    });
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

export const buildReplyPreview = (m: ChatMessage, senderName?: string): ReplyPreview => ({
  messageId: m.id,
  senderId: m.senderId,
  senderName,
  snippet: m.type === 'image' ? '📷 Photo' : (m.text.length > 80 ? m.text.slice(0, 77) + '…' : m.text),
  type: m.type,
});

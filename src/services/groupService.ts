import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Collections } from '@/firebase/collections';
import { ChatMessage, Group, MessageStatus, ReplyPreview } from '@/types/models';

export const GroupService = {
  async createGroup(params: {
    name: string;
    members: string[];
    createdBy: string;
    photoURL?: string | null;
  }): Promise<string> {
    const ref = await addDoc(collection(db, Collections.groups), {
      name: params.name,
      members: params.members,
      admins: [params.createdBy],
      createdBy: params.createdBy,
      photoURL: params.photoURL ?? null,
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageAt: null,
      pinnedBy: [],
      mutedBy: [],
    });
    return ref.id;
  },

  listenToUserGroups(uid: string, cb: (groups: Group[]) => void): Unsubscribe {
    const q = query(collection(db, Collections.groups), where('members', 'array-contains', uid));
    return onSnapshot(
      q,
      (snap) => {
        const groups: Group[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        groups.sort((a, b) => {
          const aPinned = a.pinnedBy?.includes(uid) ? 1 : 0;
          const bPinned = b.pinnedBy?.includes(uid) ? 1 : 0;
          if (aPinned !== bPinned) return bPinned - aPinned;
          const at = a.lastMessageAt?.toMillis?.() ?? 0;
          const bt = b.lastMessageAt?.toMillis?.() ?? 0;
          return bt - at;
        });
        cb(groups);
      },
      (err) => {
        console.warn('listenToUserGroups error', err);
        cb([]);
      },
    );
  },

  listenToGroupMessages(groupId: string, cb: (msgs: ChatMessage[]) => void): Unsubscribe {
    const q = query(
      collection(db, Collections.groups, groupId, Collections.groupMessages),
      orderBy('createdAt', 'asc'),
    );
    return onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = snap.docs.map((d) => ({
        id: d.id,
        chatId: groupId,
        ...(d.data() as any),
      }));
      cb(msgs);
    });
  },

  async sendGroupMessage(
    groupId: string,
    senderId: string,
    text: string,
    options?: { replyTo?: ReplyPreview | null },
  ) {
    const ref = await addDoc(
      collection(db, Collections.groups, groupId, Collections.groupMessages),
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
    await updateDoc(doc(db, Collections.groups, groupId), {
      lastMessage: text.length > 60 ? text.slice(0, 57) + '…' : text,
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: senderId,
    });
    return ref.id;
  },

  async addMember(groupId: string, uid: string) {
    await updateDoc(doc(db, Collections.groups, groupId), {
      members: arrayUnion(uid),
    });
  },

  async removeMember(groupId: string, uid: string) {
    await updateDoc(doc(db, Collections.groups, groupId), {
      members: arrayRemove(uid),
      admins: arrayRemove(uid),
    });
  },

  async getGroup(groupId: string): Promise<Group | null> {
    const snap = await getDoc(doc(db, Collections.groups, groupId));
    return snap.exists() ? ({ id: groupId, ...(snap.data() as any) }) : null;
  },

  async deleteGroupMessage(groupId: string, messageId: string) {
    await deleteDoc(doc(db, Collections.groups, groupId, Collections.groupMessages, messageId));
  },

  async togglePin(groupId: string, uid: string, on: boolean) {
    await updateDoc(doc(db, Collections.groups, groupId), {
      pinnedBy: on ? arrayUnion(uid) : arrayRemove(uid),
    });
  },

  async toggleMute(groupId: string, uid: string, on: boolean) {
    await updateDoc(doc(db, Collections.groups, groupId), {
      mutedBy: on ? arrayUnion(uid) : arrayRemove(uid),
    });
  },

  async toggleReaction(groupId: string, messageId: string, uid: string, emoji: string) {
    const mref = doc(db, Collections.groups, groupId, Collections.groupMessages, messageId);
    const snap = await getDoc(mref);
    const current: string[] = (snap.data() as any)?.reactions?.[emoji] ?? [];
    const has = current.includes(uid);
    const next = has ? current.filter((u) => u !== uid) : [...current, uid];
    await updateDoc(mref, { [`reactions.${emoji}`]: next });
  },
};

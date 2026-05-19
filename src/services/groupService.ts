import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Unsubscribe,
  setDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Collections } from '@/firebase/collections';
import { ChatMessage, Group, MessageStatus } from '@/types/models';

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

  async sendGroupMessage(groupId: string, senderId: string, text: string) {
    const ref = await addDoc(
      collection(db, Collections.groups, groupId, Collections.groupMessages),
      {
        senderId,
        text,
        type: 'text',
        createdAt: serverTimestamp(),
        status: 'sent' as MessageStatus,
        readBy: [senderId],
      },
    );
    await updateDoc(doc(db, Collections.groups, groupId), {
      lastMessage: text,
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
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, Collections.groups, groupId, Collections.groupMessages, messageId));
  },
};

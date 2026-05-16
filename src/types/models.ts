import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  phoneNumber: string;
  displayName: string;
  photoURL?: string | null;
  about?: string;
  createdAt?: Timestamp;
  lastSeen?: Timestamp;
  fcmToken?: string;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'system';
  createdAt: Timestamp | null;
  status: MessageStatus;
  readBy?: string[];
  attachmentURL?: string | null;
}

export interface Chat {
  id: string;
  members: string[]; // exactly 2 uids for 1:1 chats
  lastMessage?: string;
  lastMessageAt?: Timestamp | null;
  lastMessageSenderId?: string;
  unread?: Record<string, number>;
}

export interface Group {
  id: string;
  name: string;
  photoURL?: string | null;
  members: string[];
  admins: string[];
  createdBy: string;
  createdAt?: Timestamp;
  lastMessage?: string;
  lastMessageAt?: Timestamp | null;
}

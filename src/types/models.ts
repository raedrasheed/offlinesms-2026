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
export type MessageType = 'text' | 'image' | 'system';

export interface ReplyPreview {
  messageId: string;
  senderId: string;
  senderName?: string;
  snippet: string;
  type: MessageType;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: MessageType;
  createdAt: Timestamp | null;
  status: MessageStatus;
  readBy?: string[];
  attachmentURL?: string | null;
  reactions?: Record<string, string[]>; // emoji → uids
  replyTo?: ReplyPreview | null;
}

export interface Chat {
  id: string;
  members: string[];
  lastMessage?: string;
  lastMessageAt?: Timestamp | null;
  lastMessageSenderId?: string;
  unread?: Record<string, number>;
  pinnedBy?: string[];
  mutedBy?: string[];
  archivedBy?: string[];
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
  pinnedBy?: string[];
  mutedBy?: string[];
}

export interface TypingState {
  uid: string;
  updatedAt: Timestamp;
}

export type StatusType = 'text' | 'image';

export interface Status {
  id: string;
  authorId: string;
  type: StatusType;
  text?: string;
  imageURL?: string | null;
  backgroundColor?: string;
  createdAt: Timestamp | null;
  expiresAt: Timestamp | null; // 24h after creation
  viewedBy?: string[];
}

export type CallDirection = 'incoming' | 'outgoing' | 'missed';
export type CallKind = 'voice' | 'video';

export interface CallLog {
  id: string;
  participants: string[]; // exactly 2 for 1:1
  initiatedBy: string;
  kind: CallKind;
  direction: CallDirection; // from the viewing user's perspective
  durationSeconds?: number;
  createdAt: Timestamp | null;
}

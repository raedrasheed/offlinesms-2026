// Centralized Firestore collection paths so naming is consistent app-wide.
export const Collections = {
  users: 'users',
  chats: 'chats',
  // Subcollection: chats/{chatId}/messages/{messageId}
  messages: 'messages',
  groups: 'groups',
  // Subcollection: groups/{groupId}/messages/{messageId}
  groupMessages: 'messages',
  contacts: 'contacts',
  notifications: 'notifications',
} as const;

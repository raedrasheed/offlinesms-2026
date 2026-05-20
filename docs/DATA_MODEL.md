# OfflineSMS Data Model (Phase 1.5 foundation)

This document mirrors `src/types/models.ts` and the Firestore collections
created by the services in `src/services/`. Everything here is enforced
by `firestore.rules`.

## Collections

```
users/{uid}
  uid, phoneNumber, displayName, photoURL, about
  createdAt, lastSeen, fcmToken

chats/{chatId}                            chatId = sorted("uidA_uidB")
  members:            [uidA, uidB]
  lastMessage:        string
  lastMessageAt:      timestamp
  lastMessageSenderId: string
  unread:             { [uid]: number }
  pinnedBy:           [uid, ...]         self-only diffs (rules)
  mutedBy:            [uid, ...]         self-only diffs (rules)
  archivedBy:         [uid, ...]         self-only diffs (rules)
  messages/{messageId}                    see Message shape below

groups/{groupId}
  name, photoURL, createdBy, createdAt
  members: [uid, ...]
  admins:  [uid, ...]
  lastMessage, lastMessageAt
  pinnedBy:           [uid, ...]         self-only diffs (rules)
  mutedBy:            [uid, ...]         self-only diffs (rules)
  messages/{messageId}                    same shape as chat messages

typing/{chatId}/users/{uid}
  uid, updatedAt                          server-only write by the uid
                                          stale entries (>4s) filtered
                                          client-side

statuses/{statusId}                       24h "stories"
  authorId, type ('text'|'image'),
  text?, imageURL?, backgroundColor?,
  createdAt, expiresAt,
  viewedBy: [uid, ...]                    only grows, viewer adds self

calls/{callId}                            call log only — no signaling
  participants: [uidA, uidB]
  initiatedBy:  uid
  kind:         'voice' | 'video'
  direction:    derived per-viewer at read-time
  durationSeconds?
  createdAt

contacts/{uid}/list/{contactId}           personal address-book entries
  name, phoneNumber, labels: [string]

notifications/{uid}/items/{notifId}       per-user inbox events
```

## Message shape

```
{
  senderId:       uid
  text:           string                 empty for image-only messages
  type:           'text' | 'image' | 'system'
  attachmentURL?: string                 set when type=image
  createdAt:      timestamp
  status:         'sending'|'sent'|'delivered'|'read'
  readBy:         [uid, ...]
  reactions?:     { [emoji]: [uid, ...] } client-validated only
  replyTo?: {
    messageId, senderId, senderName?,
    snippet, type
  } | null
}
```

After creation: `senderId`, `text`, `type`, `attachmentURL`, and
`replyTo` are immutable. `status`, `readBy`, and `reactions` are
mutable by any chat member (the client only writes its own uid into
reaction arrays).

## Service entry points

| File | Methods |
| ---- | ------- |
| `src/services/userService.ts` | `createOrUpdateProfile`, `getProfile`, `findByPhone`, `listAllUsers`, `touchLastSeen` |
| `src/services/chatService.ts` | `getOrCreateOneToOneChat`, `listenToUserChats`, `listenToMessages`, `sendMessage`, `sendImage`, `markAsRead`, `deleteMessage`, `togglePin`, `toggleMute`, `toggleArchive`, `toggleReaction`, `buildReplyPreview` |
| `src/services/groupService.ts` | `createGroup`, `listenToUserGroups`, `listenToGroupMessages`, `sendGroupMessage`, `addMember`, `removeMember`, `getGroup`, `deleteGroupMessage`, `togglePin`, `toggleMute`, `toggleReaction` |
| `src/services/presenceService.ts` | `setTyping`, `listenToTyping` |

## Hooks

| Hook | Purpose |
| ---- | ------- |
| `useAuth()` | Firebase auth user + profile, heartbeats `lastSeen` |
| `useChats(uid)` | Subscribe to the user's chat list (sorted: pinned first, then recent) |
| `useMessages(chatId, { isGroup, readerUid })` | Subscribe to messages, optionally auto-mark-as-read |
| `usePresence(uid)` | Subscribe to another user's live profile |
| `useTypingOthers(chatId, viewerUid)` | uids currently typing (excluding viewer) |
| `useTypingIndicator(chatId, uid)` | `notify()` to broadcast that the local user is typing |
| `useChatActions()` | Bound callbacks for pin / mute / archive / react / reply / delete |

## Rules invariants

- Senders cannot impersonate other users — `senderId == request.auth.uid` enforced on message creation.
- Pin / mute / archive arrays can only change for the acting user's own uid.
- Group membership and admin changes are admin-gated, with one exception: a member may remove themselves.
- 1:1 chats are members-immutable after creation (no add/remove).
- Statuses' `viewedBy` may only grow with the viewer's own uid; never shrink.
- Calls' participants and initiator are immutable post-create.

## Phase 2 hooks left in

- `attachmentURL` on messages and `sendImage` are wired end-to-end; only the picker UI is missing.
- `fcmToken` on users is captured by `notificationService.register`; a Cloud Function to fan-out pushes is in `functions/` but not deployed.
- `replyTo` and `reactions` fields are stored — UI to render and create them is the next visible step.

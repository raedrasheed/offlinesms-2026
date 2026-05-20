# Foundation smoke test

Manual checklist to verify the Phase 1.5 foundation (data model,
services, hooks, rules) before wiring UI on top of it. Each item maps
to a service method and the rule path it has to pass.

## Prerequisites

- Two test accounts signed into the app from two devices/emulators:
  - **A** → your dev device
  - **B** → another emulator or a teammate
- Firebase Console open on `offlinesms-prod-2026` for ad-hoc inspection.
- Latest `firestore.rules` deployed:
  ```
  firebase deploy --only firestore:rules
  ```

## Read / write smoke

| # | Step | Expected | Path verified |
| - | ---- | -------- | ------------- |
| 1 | A signs in (email/password) | `users/{A.uid}` doc exists with `lastSeen` recent | `users` |
| 2 | A opens any chat | Firestore: `chats/{id}` shows A in `members` | `chats` read |
| 3 | A sends a text message | `chats/{id}/messages/{auto}` created with `senderId=A.uid`, `type=text` | message create |
| 4 | B receives the message in realtime | snapshot fires on B's `listenToMessages` | listener |
| 5 | B opens the chat | `unread.B = 0`, status → `read`, `readBy` includes B | `markAsRead` |
| 6 | A long-presses own message → Delete | message doc gone | message delete |

## Pin / mute / archive

| # | Step | Expected | Path verified |
| - | ---- | -------- | ------------- |
| 7  | A calls `ChatService.togglePin(chatId, A.uid, true)` | `chats/{id}.pinnedBy` contains only `A.uid` | self-only diff rule |
| 8  | Sanity: try the same call but with B's uid (manually via console) | **Rejected** by rules | `listDiffOnlyTouchesSelf` |
| 9  | A pins, then B opens A's chat — chat order on B's side unchanged | pin is per-user | sorting logic in `useChats` |
| 10 | A archives the chat. A's chat list omits it from the active section. Sending a new message clears `archivedBy` | `archivedBy` resets on send | `sendMessage` |
| 11 | A toggles mute | `mutedBy` contains A's uid | rule + UI later |

## Reactions

| # | Step | Expected | Path verified |
| - | ---- | -------- | ------------- |
| 12 | A reacts 👍 to a message | `messages/{id}.reactions["👍"]` contains `[A.uid]` | reactions field |
| 13 | A toggles 👍 off | the array is empty (or key removed by Firestore) | toggle logic |
| 14 | B reacts ❤️ to the same message | both keys coexist with respective uids | nested map |

## Reply-to

| # | Step | Expected | Path verified |
| - | ---- | -------- | ------------- |
| 15 | A sends a message with `replyTo` built via `buildReplyPreview` | new message doc carries a `replyTo` object | create rule |
| 16 | A tries to update the message's `replyTo` later | **Rejected** by rules | message update rule |

## Typing indicator

| # | Step | Expected | Path verified |
| - | ---- | -------- | ------------- |
| 17 | A calls `PresenceService.setTyping(chatId, A.uid, true)` | `typing/{chatId}/users/{A.uid}` doc with `updatedAt` | typing write |
| 18 | B subscribes via `useTypingOthers(chatId, B.uid)` | gets `[A.uid]` while A's doc is fresh | listener + 4s stale filter |
| 19 | After 4–5 s without a refresh, A's uid drops out | client-side stale filter | `useTypingOthers` |
| 20 | A signs out / closes app — `useTypingIndicator` cleanup fires | `typing/{chatId}/users/{A.uid}` deleted | hook unmount |

## Image upload

| # | Step | Expected | Path verified |
| - | ---- | -------- | ------------- |
| 21 | A calls `ChatService.sendImage(chatId, A.uid, localUri)` | Storage object at `chats/{chatId}/{A.uid}/<file>.jpg`; new message with `type=image`, `attachmentURL=<download URL>`, `text=""` | Storage write + message create |
| 22 | B's chat list shows `📷 Photo` as the last message preview | `chats/{id}.lastMessage = "📷 Photo"` | preview path |

## Statuses & calls (no UI yet — exercise via console)

| # | Step | Expected | Path verified |
| - | ---- | -------- | ------------- |
| 23 | A writes `statuses/{auto}` with `authorId=A.uid, type=text, createdAt, expiresAt` | doc accepted | status create |
| 24 | B updates the same doc adding `viewedBy: [B.uid]` | accepted | viewedBy growth |
| 25 | B attempts to set `viewedBy: []` (strip A) | **Rejected** | viewedBy invariant |
| 26 | A writes `calls/{auto}` with `participants:[A.uid, B.uid], initiatedBy:A.uid, kind:voice` | accepted | call create |
| 27 | C (not a participant) tries to read it | **Rejected** | participants-only read |

## Pre-flight checks

Before each foundation merge, run:

```bash
npm run typecheck
```

Manual smoke run (UI):
1. Sign in as A → land on Chats tab.
2. Tap a contact → send a message → verify it lands in Firestore.
3. Long-press the message → Copy / Delete works.
4. Sign in as B on a second device → verify message arrives in realtime.
5. Reopen Settings → log out → log back in → state preserved.

If anything in this list fails, raise it in chat with the step number;
a failing item points directly at a rule or a service call.

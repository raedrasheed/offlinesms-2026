# OfflineSMS — Mobile Messaging App

A React Native + Expo + Firebase messaging app built with the OfflineSMS
brand. The user experience uses standard messaging conventions (chat
list, message bubbles with delivery ticks, group chats, presence, pin /
mute / archive) but the visual identity, logo, colors, and naming are
entirely OfflineSMS.

> **Website:** [offlinesms.com](http://offlinesms.com/)

---

## 1. Tech stack

| Layer          | Choice                                    |
| -------------- | ----------------------------------------- |
| Framework      | React Native (Expo SDK 51)                |
| Language       | TypeScript (strict)                       |
| Navigation     | React Navigation v6 (native-stack + tabs) |
| State          | React Context (auth) + hook-based subs    |
| Backend        | Firebase only (no custom server)          |
| Auth           | Firebase Authentication — Email + Password|
| Database       | Cloud Firestore (realtime listeners)      |
| Storage        | Firebase Storage (avatars, attachments)   |
| Push           | Expo Notifications → FCM                  |
| Persistence    | AsyncStorage (auth session)               |

---

## 2. Project structure

```
offlinesms-2026/
├─ App.tsx
├─ app.json                       # Expo config (brand, plugins, FB config)
├─ babel.config.js                # @ alias + reanimated
├─ firebase.json                  # CLI config for rules deploy
├─ firestore.rules                # Firestore security rules
├─ storage.rules                  # Storage security rules
├─ docs/
│  ├─ DATA_MODEL.md               # Collections, fields, rule invariants
│  └─ SMOKE_TEST.md               # Manual checklist for verifying changes
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ components/
   │  ├─ Avatar.tsx               # With optional online dot
   │  ├─ Button.tsx
   │  ├─ ChatListItem.tsx         # Pin / mute / unread badge
   │  ├─ DateSeparator.tsx
   │  ├─ EmptyState.tsx
   │  ├─ Header.tsx
   │  ├─ Icons.tsx                # Pin / Mute / Archive / Check SVGs
   │  ├─ Input.tsx
   │  ├─ Loader.tsx
   │  ├─ Logo.tsx
   │  ├─ MessageBubble.tsx        # Long-press menu, status ticks
   │  ├─ SearchBar.tsx
   │  └─ Wallpaper.tsx            # Chat-thread background pattern
   ├─ firebase/
   │  ├─ collections.ts
   │  └─ config.ts                # Firebase initialization
   ├─ hooks/
   │  ├─ useAuth.tsx              # Provider + lastSeen heartbeat
   │  ├─ useChats.ts              # Live chat list subscription
   │  ├─ useMessages.ts           # Live messages subscription
   │  ├─ usePresence.ts           # Live peer profile / lastSeen
   │  ├─ useTypingIndicator.ts    # Writes "I'm typing"
   │  ├─ useTypingOthers.ts       # Reads who else is typing
   │  └─ useChatActions.ts        # Bound pin/mute/archive/react/reply
   ├─ navigation/
   │  ├─ AppStack.tsx
   │  ├─ AuthStack.tsx
   │  ├─ MainTabs.tsx
   │  ├─ RootNavigator.tsx
   │  └─ types.ts
   ├─ screens/
   │  ├─ SplashScreen.tsx
   │  ├─ auth/
   │  │  ├─ WelcomeScreen.tsx
   │  │  ├─ EmailAuthScreen.tsx   # Sign-up / sign-in (email + password)
   │  │  └─ ProfileSetupScreen.tsx
   │  ├─ chats/
   │  │  ├─ ChatsScreen.tsx
   │  │  ├─ ChatDetailsScreen.tsx
   │  │  └─ NewChatScreen.tsx
   │  ├─ groups/
   │  │  ├─ GroupsScreen.tsx
   │  │  ├─ CreateGroupScreen.tsx
   │  │  └─ GroupChatScreen.tsx
   │  ├─ contacts/
   │  │  ├─ ContactsScreen.tsx    # Reads device contacts via expo-contacts
   │  │  └─ ContactProfileScreen.tsx
   │  └─ settings/
   │     └─ SettingsScreen.tsx
   ├─ services/
   │  ├─ authService.ts           # Email/password sign-up + sign-in
   │  ├─ chatService.ts           # 1:1 chats, messages, pin/mute/archive,
   │  │                           #   reactions, reply, image upload
   │  ├─ groupService.ts          # Groups + group messages + pin/mute
   │  ├─ presenceService.ts       # Typing indicator collection
   │  ├─ notificationService.ts   # FCM/Expo token registration
   │  └─ userService.ts           # Profile CRUD + lastSeen heartbeat
   ├─ theme/
   │  ├─ colors.ts                # #2596be palette + dark-mode prep
   │  ├─ spacing.ts
   │  ├─ typography.ts
   │  ├─ radii.ts
   │  └─ index.ts                 # Re-exports + shadow + motion tokens
   ├─ types/
   │  └─ models.ts                # UserProfile / Chat / ChatMessage /
   │                              #   Group / Status / CallLog / ReplyPreview
   └─ utils/
      ├─ format.ts
      └─ presence.ts              # isOnline + formatLastSeen
```

---

## 3. Installation

```powershell
# 1. Install JS deps
npm install

# 2. Add brand assets under /assets:
#    icon.png, splash.png, adaptive-icon.png, favicon.png
mkdir assets
```

The `assets/icon.png` file is referenced by `app.json` for the Android
launcher icon, the in-app splash, and the `Logo` component. Drop in
your real artwork (ideally 1024×1024 PNGs) before publishing.

---

## 4. Firebase setup

1. Create a project at the [Firebase console](https://console.firebase.google.com)
   (e.g. `offlinesms-prod`).
2. Enable products:
   - **Authentication → Sign-in method → Email/Password → Enable**.
   - **Cloud Firestore** (start in production mode).
   - **Storage**.
   - **Cloud Messaging** (FCM) — only needed when you wire push later.
3. Register apps:
   - Android package: `com.offlinesms.app` → download `google-services.json`.
   - iOS bundle id: `com.offlinesms.app` → download `GoogleService-Info.plist`.
4. Copy the **web** Firebase config (`apiKey`, `authDomain`, `projectId`,
   `storageBucket`, `messagingSenderId`, `appId`) into `app.json` under
   `expo.extra.firebase`.
5. Deploy rules — either via CLI:
   ```powershell
   npm i -g firebase-tools
   firebase login
   firebase use --add
   firebase deploy --only firestore:rules,storage:rules
   ```
   …or paste the contents of `firestore.rules` and `storage.rules` into
   the Firebase Console (**Firestore → Rules** and **Storage → Rules**)
   and click Publish.

> The Firestore database in this project is named `offlinesms-prod`
> (set via `getFirestore(app, 'offlinesms-prod')` in
> `src/firebase/config.ts`). If you create a new project with the
> default `(default)` database name, update that constant.

---

## 5. Running the app

```powershell
# Dev server
npm start

# Type-check the TS source
npx tsc --noEmit
```

In the Expo dev tools: `a` for Android emulator, `i` for iOS simulator,
or scan the QR code with Expo Go on a real device.

To build a release APK locally:

```powershell
npx expo prebuild --platform android --clean
cd android
.\gradlew assembleRelease
```

(Requires JDK 17, Android SDK, ~6 GB free disk. See the
release-build notes if you hit signing or disk-space issues.)

---

## 6. Data model and rules

The collections, fields, service entry points, hooks, and rule
invariants are documented in **[docs/DATA_MODEL.md](docs/DATA_MODEL.md)**.
A 27-step manual smoke checklist (data layer) plus 16 UI verification
steps live in **[docs/SMOKE_TEST.md](docs/SMOKE_TEST.md)** — run those
after any non-trivial change.

Quick summary:

```
users/{uid}                            displayName, photoURL, about,
                                        lastSeen, fcmToken
chats/{chatId}                          members[2], lastMessage*,
                                        unread{uid}, pinnedBy[],
                                        mutedBy[], archivedBy[]
chats/{chatId}/messages/{msgId}         senderId, text, type, replyTo,
                                        reactions{emoji:[uid]}, status,
                                        readBy[], attachmentURL?
groups/{groupId}                        members[], admins[], pinnedBy[],
                                        mutedBy[]
groups/{groupId}/messages/{msgId}       same shape as chat messages
typing/{chatId}/users/{uid}             uid, updatedAt   (server-only writes)
statuses/{statusId}                     authorId, type, expiresAt, viewedBy[]
calls/{callId}                          participants[], initiatedBy, kind
contacts/{uid}/list/{contactId}         personal address-book entries
notifications/{uid}/items/{notifId}     per-user inbox events
```

Rule highlights:

- Senders cannot impersonate other users (`senderId == request.auth.uid`).
- `pinnedBy` / `mutedBy` / `archivedBy` diffs must only touch the acting
  user's own uid.
- Messages: `text`, `type`, `attachmentURL`, and `replyTo` are immutable
  once written.
- Group membership / admin changes are admin-gated except a member can
  remove themselves.
- Statuses' `viewedBy` may only grow with the viewer's own uid.

---

## 7. UI / UX notes

- **Brand color**: `#2596be` (`theme/colors.ts`). All headers, FAB,
  send button, unread badge and active states pull from this palette.
- **Theme tokens** split across `colors.ts`, `spacing.ts`,
  `typography.ts`, `radii.ts`. Dark-mode palette is already defined in
  `palettes.dark` — flipping it on requires a small theme provider
  (TODO for a later phase).
- **Logo**: `assets/icon.png` rendered directly by `components/Logo.tsx`
  and the in-app splash. Drop your real PNGs into `/assets`.
- **Chat list polish**: pin/unpin & mute/unmute & archive/unarchive via
  long-press; pinned chats float to the top; archived chats live behind
  an expandable banner; muted chats show a small mute glyph beside the
  name and a desaturated unread badge.
- **Online indicator**: 2-minute `lastSeen` threshold (`utils/presence`).
  Green dot on avatars when fresh; chat header subtitle reads
  *"online"* / *"last seen Xm ago"* / *"yesterday"* / date.
- **Long-press a message**: Copy (via `expo-clipboard`) and, on your own
  messages, Delete.
- **RTL prep**: `theme/index.ts` exposes `isRTL` from `I18nManager`.
  Layouts use flex + gap so flipping for Arabic works automatically;
  add language detection + `I18nManager.forceRTL(true)` in Phase 2.
- **Loading / empty / error states**: `Loader`, `EmptyState` and inline
  validation messages are used across every screen.

---

## 8. Phase 2 roadmap

Phase 1 is the messaging foundation. Phase 2 adds OfflineSMS-specific
value:

1. **SMS fallback** — when the recipient is offline beyond a threshold,
   queue the message and deliver via carrier SMS (Twilio / local
   gateway). A Cloud Function listens to message writes and routes.
2. **Broadcast lists** — pick multiple contacts, send one message that
   fans out into per-recipient 1:1 conversations.
3. **Scheduled messages / reminders** — `reminders/{uid}/items/{id}`
   with `nextRunAt`, processed by a scheduled Cloud Function.
4. **Contact labels / segments** — extend `contacts/{uid}/list/*` with
   `labels: string[]` plus a `segments` collection per user.
5. **Marketing campaigns** — `campaigns` collection with target
   segments, scheduling, analytics aggregations.
6. **Staff / customer workflows** — workspace concept and a role
   attribute on `users`. Staff get assigned to customer threads.
7. **Admin dashboard** — separate web app reading the same Firestore
   data with admin-claim-gated rules.
8. **Typing indicator UI** (data layer already shipped — wiring screen
   subscriptions is small).
9. **Reply-to-message and reactions UI** (data layer shipped).
10. **End-to-end encryption** for sensitive workspaces.

The codebase is structured so each of these can land as a new service
module under `src/services/`, a hook under `src/hooks/`, and a screen
under `src/screens/` without churning the core chat code.

---

## 9. Notes & caveats

- **Email/password auth** is what's currently enabled. If you want
  phone-number auth later, re-enable the Phone provider in the Firebase
  Console and bring back a phone-auth flow. The previous WhatsApp OTP
  Cloud Function is no longer in the repo (see commit history if you
  want to reconstruct it).
- **Push notifications** register a device token via
  `notificationService.register`. To actually deliver pushes, add a
  Cloud Function that listens to message writes and sends FCM payloads
  to the recipient's `fcmToken`.
- **`/assets`** isn't checked in. Drop your real `icon.png`,
  `splash.png`, `adaptive-icon.png`, and `favicon.png` before
  prebuilding for release.

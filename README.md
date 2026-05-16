# OfflineSMS — Mobile Messaging App (Phase 1)

A React Native + Expo + Firebase messaging app built with the OfflineSMS brand. The
user experience is inspired by modern messaging apps (one-tap chats, real-time
delivery, message bubbles, group chats) but the visual identity, logo,
colors, and naming are entirely OfflineSMS — no third-party brand assets are
included.

> **Website:** [offlinesms.com](http://offlinesms.com/)

---

## 1. Tech stack

| Layer          | Choice                                    |
| -------------- | ----------------------------------------- |
| Framework      | React Native (Expo SDK 51)                |
| Language       | TypeScript (strict)                       |
| Navigation     | React Navigation v6 (native-stack + tabs) |
| State          | Local + React Context (auth)              |
| Backend        | Firebase only (no custom server)          |
| Auth           | Firebase Auth + Custom Tokens, OTP via Meta WhatsApp Cloud API |
| Database       | Cloud Firestore (realtime listeners)      |
| Storage        | Firebase Storage (avatars, attachments)   |
| Push           | Expo Notifications → FCM                  |
| Persistence    | AsyncStorage (auth session)               |

---

## 2. Project structure

```
offlinesms-2026/
├─ App.tsx                       # Root component, providers, splash gate
├─ app.json                      # Expo config (brand, plugins, FB extras)
├─ babel.config.js               # @ alias + reanimated
├─ firebase.json                 # CLI config for rules + functions deploy
├─ firestore.rules               # Firestore security rules
├─ storage.rules                 # Storage security rules
├─ functions/                    # Cloud Functions (WhatsApp OTP)
│  ├─ src/index.ts               # requestWhatsAppOtp + verifyWhatsAppOtp
│  ├─ package.json
│  └─ tsconfig.json
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ components/                # Reusable UI primitives
   │  ├─ Avatar.tsx
   │  ├─ Button.tsx
   │  ├─ ChatListItem.tsx
   │  ├─ EmptyState.tsx
   │  ├─ Header.tsx
   │  ├─ Input.tsx
   │  ├─ Loader.tsx
   │  ├─ Logo.tsx                # OfflineSMS SVG logo (original art)
   │  ├─ MessageBubble.tsx
   │  └─ SearchBar.tsx
   ├─ firebase/
   │  ├─ collections.ts          # Collection name constants
   │  └─ config.ts               # Firebase initialization (Auth, FS, Storage)
   ├─ hooks/
   │  └─ useAuth.tsx             # AuthProvider + useAuth() context
   ├─ navigation/
   │  ├─ AppStack.tsx            # Authenticated stack (tabs + modals)
   │  ├─ AuthStack.tsx           # Welcome → Phone → OTP → Profile
   │  ├─ MainTabs.tsx            # Chats / Groups / Contacts / Settings
   │  ├─ RootNavigator.tsx       # Splash / Auth / App switching
   │  └─ types.ts                # Type-safe nav params
   ├─ screens/
   │  ├─ SplashScreen.tsx
   │  ├─ auth/
   │  │  ├─ WelcomeScreen.tsx
   │  │  ├─ PhoneLoginScreen.tsx
   │  │  ├─ OtpVerifyScreen.tsx
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
   │  │  └─ ContactsScreen.tsx
   │  └─ settings/
   │     └─ SettingsScreen.tsx
   ├─ services/
   │  ├─ authService.ts          # WhatsApp OTP send + verify (callable fns)
   │  ├─ chatService.ts          # 1:1 chats + messages + read state
   │  ├─ groupService.ts         # Groups + group messages
   │  ├─ notificationService.ts  # FCM/Expo token registration
   │  └─ userService.ts          # Profile CRUD, user lookup
   ├─ theme/
   │  ├─ colors.ts               # OfflineSMS palette
   │  └─ index.ts                # spacing, radius, typography, RTL flag
   ├─ types/
   │  └─ models.ts               # UserProfile, Chat, ChatMessage, Group
   └─ utils/
      └─ format.ts
```

---

## 3. Installation

```bash
# 1. Install Node deps
npm install

# 2. Install Expo CLI globally if you don't have it
npm install -g expo-cli eas-cli

# 3. Add the required iOS / Android assets (icon, splash, etc.) under /assets
mkdir -p assets
# Drop in: icon.png, splash.png, adaptive-icon.png, favicon.png
```

> OfflineSMS authenticates with **WhatsApp OTP only** — there is no SMS
> fallback in the UI. The client never talks to WhatsApp directly; it calls
> two Firebase callable Cloud Functions which talk to Meta's WhatsApp Cloud
> API and return a Firebase Custom Token.

---

## 4. Firebase setup

1. Go to the [Firebase console](https://console.firebase.google.com) and create
   a project (e.g. `offlinesms-prod`). Upgrade to the **Blaze plan** — Cloud
   Functions require it.
2. Enable products:
   - **Authentication** — leave Phone sign-in **disabled**. We sign users in
     with Custom Tokens minted by Cloud Functions after WhatsApp verification.
   - **Cloud Firestore** (start in production mode).
   - **Storage**.
   - **Cloud Functions**.
   - **Cloud Messaging** (FCM).
3. Register apps:
   - iOS bundle id: `com.offlinesms.app` → download `GoogleService-Info.plist`.
   - Android package: `com.offlinesms.app` → download `google-services.json`.
4. Copy the **web** Firebase config (`apiKey`, `authDomain`, `projectId`,
   `storageBucket`, `messagingSenderId`, `appId`) into `app.json` under
   `expo.extra.firebase`.
5. Install function deps and deploy rules + functions:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use --add                # pick your project
   (cd functions && npm install)
   firebase deploy --only firestore:rules,storage:rules,functions
   ```
6. (Recommended) Add a composite index on `chats` for
   `members array-contains + lastMessageAt desc`, and on `groups` for
   `members array-contains + lastMessageAt desc`. Firestore will prompt you
   with a direct link the first time the queries run.

### 4a. WhatsApp Cloud API setup (Meta)

1. Open [Meta for Developers](https://developers.facebook.com), create an app
   of type **Business**, and add the **WhatsApp** product.
2. Under *WhatsApp → API Setup*:
   - Note your **Phone number ID** (numeric).
   - Generate a **permanent system-user access token** (Business Manager →
     System Users → Add → assign the WhatsApp app → generate token with
     `whatsapp_business_messaging` + `whatsapp_business_management` scopes).
3. Create an **authentication message template** named `otp_login`:
   - Category: **Authentication**.
   - Language: `en_US` (or whatever you want as default).
   - Body: `Your OfflineSMS verification code is {{1}}.`
   - Button: *Copy code* → `{{1}}`.
   - Submit for review and wait for approval.
4. Store the credentials as Firebase Functions secrets:
   ```bash
   firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID
   firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN
   firebase functions:secrets:set WHATSAPP_TEMPLATE_NAME    # otp_login
   firebase functions:secrets:set WHATSAPP_TEMPLATE_LANG    # en_US
   firebase functions:secrets:set WHATSAPP_API_VERSION      # v20.0
   firebase functions:secrets:set OTP_HASH_SECRET           # any long random string
   ```
5. Redeploy: `firebase deploy --only functions`.

### 4b. Auth flow at runtime

```
PhoneLoginScreen      ──requestWhatsAppOtp(phone)──▶  Cloud Function
                                                       │  generate 6-digit code
                                                       │  store hash in otpRequests/
                                                       │  POST to graph.facebook.com
                                                       ▼
                                                  WhatsApp delivers code
OtpVerifyScreen       ──verifyWhatsAppOtp(phone,code)─▶ Cloud Function
                                                       │  check hash, expiry, attempts
                                                       │  auth.createUser or getUser
                                                       │  mint custom token
                                                       ▼
                       ◀──{ token }──────────────────  signInWithCustomToken(token)
```

---

## 5. Running the app

```bash
# Start Metro / Expo dev server
npm start

# Open on iOS Simulator
npm run ios

# Open on Android Emulator
npm run android

# Type-check the TS source
npm run typecheck
```

Sign in with a phone number, complete OTP and profile setup, then you'll land
on the **Chats** tab. The Contacts tab lists every other OfflineSMS user — tap
one to open a 1:1 chat. The Groups tab supports creating groups and chatting
inside them. All chat surfaces use Firestore real-time listeners.

---

## 6. Firestore data model

```
users/{uid}
  ├─ uid, phoneNumber, displayName, photoURL, about
  ├─ createdAt, lastSeen, fcmToken

chats/{chatId}                       # chatId = sorted("uidA_uidB")
  ├─ members:        [uidA, uidB]
  ├─ lastMessage:    string
  ├─ lastMessageAt:  timestamp
  ├─ lastMessageSenderId: string
  ├─ unread:         { [uid]: number }
  └─ messages/{messageId}
       ├─ senderId, text, type
       ├─ createdAt, status (sent|delivered|read)
       └─ readBy: [uid, ...]

groups/{groupId}
  ├─ name, photoURL, createdBy
  ├─ members: [uid, ...]
  ├─ admins:  [uid, ...]
  ├─ lastMessage, lastMessageAt
  └─ messages/{messageId}            # same shape as chat messages

contacts/{uid}/list/{contactId}      # personal address book (Phase 1.5)
notifications/{uid}/items/{notifId}  # per-user inbox events

otpRequests/{phoneNumber}            # SERVER-ONLY. Holds the SHA-256 hash of
                                     # the active WhatsApp OTP, its expiry,
                                     # and an attempt counter. Clients are
                                     # denied by rules; only the admin SDK
                                     # used in Cloud Functions can touch it.
  ├─ codeHash, expiresAt, attempts
  └─ lastSentAt, createdAt
```

---

## 7. Security rules (summary)

- **Anyone signed in** can read user profiles (used to render avatars in shared
  chats).
- **Only the owner** can write their own profile, contacts, or notifications.
- **Chats** are readable/writable only by their members; 1:1 chats must have
  exactly two members at creation time.
- **Messages** must be created with `senderId == request.auth.uid`, are
  immutable for `senderId` and `text`, and can only be deleted by their sender.
- **Groups** can only be created with the creator listed as both member and
  admin. Membership/admin changes require admin role, except a user removing
  themselves.
- **Storage**: each user can only upload their own avatar (`avatars/<uid>.jpg`)
  and attachments are size-limited (25 MB).

See `firestore.rules` and `storage.rules` for the full definitions.

---

## 8. UI / UX notes

- **Brand color**: turquoise/blue `#0AB3B8` (`theme/colors.ts`), used for the
  primary button, send button, FAB, top headers, and badges.
- **Original logo** rendered with `react-native-svg` (`components/Logo.tsx`),
  so no third-party brand assets are bundled. Swap the SVG path with the
  official OfflineSMS art when you have the source file.
- **Rounded message bubbles** with directional tails; outgoing bubbles use a
  soft-tinted brand color, incoming bubbles are white-on-grey.
- **RTL prep**: `theme/index.ts` exports `isRTL` from `I18nManager`. Layouts
  use `flexDirection: 'row'` and gap-based spacing so flipping to RTL works
  automatically. Add language detection in Phase 2 to call
  `I18nManager.forceRTL(true)` for Arabic locales.
- **Responsive**: All layouts use `SafeAreaView`, flex, and `KeyboardAvoidingView`
  — no fixed widths. Verified to render correctly on iPhone SE through
  Pixel 7 Pro size classes.
- **Loading / empty / error states**: `Loader`, `EmptyState` and inline
  validation messages are used across every screen.

---

## 9. Phase 2 roadmap

Phase 1 is the messaging foundation. Phase 2 will add the OfflineSMS-specific
features:

1. **SMS fallback** — when the recipient is offline beyond a threshold, queue
   the message and deliver via carrier SMS through a Twilio / local-gateway
   integration. Suggested model:
   - Cloud Function listens to `chats/{id}/messages/{id}` writes.
   - If `recipient.lastSeen > 30m`, push to `smsQueue` collection.
   - Worker function delivers via SMS gateway and writes back delivery status.
2. **Bulk messaging** — campaign composer screen → fan-out via Cloud Functions
   to per-user `notifications` and `chats` writes; client-side rate limiting.
3. **Contact grouping & segments** — extend `contacts/{uid}/list/*` with
   `labels: string[]`, plus a `segments` collection per user.
4. **Alerts and reminders** — `reminders/{uid}/items/{id}` with `nextRunAt`,
   processed by a scheduled Cloud Function.
5. **Staff / customer comms** — workspace concept (`workspaces/{id}`) and a
   role attribute on `users`. Staff can be assigned to customer threads.
6. **Marketing campaigns** — `campaigns` collection with target segments,
   scheduling, analytics aggregations.
7. **Admin dashboard** — separate React app reading the same Firestore data
   with admin-claim-gated security rules.
8. **Realtime presence and typing indicators** — `users/{uid}/presence` doc or
   RTDB-based presence channel.
9. **Read receipts and delivery webhooks**, message reactions, replies.
10. **End-to-end encryption** for sensitive workspaces (libsodium-based).

The codebase is structured so each of these can land as a new service module
under `src/services/` and a screen under `src/screens/` without churning the
core chat code.

---

## 10. Notes & caveats

- **WhatsApp OTP** is implemented entirely through Cloud Functions calling
  Meta's WhatsApp Cloud API. The OTP itself is never readable by the client:
  only a salted SHA-256 hash is persisted in `otpRequests/{phoneNumber}`,
  with attempt and resend rate limits enforced server-side. After
  verification the function mints a Firebase Custom Token so the rest of the
  app sees a normal Firebase user and the existing Firestore rules apply
  unchanged.
- **No SMS fallback ships in the UI.** If a user doesn't have WhatsApp on
  their phone number they cannot sign in. To add SMS later, re-enable Phone
  Auth in the Firebase console and add a "Use SMS instead" link on
  `PhoneLoginScreen`.
- The WhatsApp `otp_login` template must be approved by Meta before OTPs
  will deliver. Approval usually takes <1 hour for authentication templates.
- Push notifications register a device token via `expo-notifications`. To
  fan-out actual pushes, deploy a small Cloud Function that listens to new
  message writes and sends FCM payloads to the recipient's `fcmToken`.
- The `/assets` icon and splash files are not committed (only branded SVG
  logo is in-code). Drop in your final PNGs before publishing.

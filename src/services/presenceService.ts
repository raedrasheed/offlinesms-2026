import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// Typing indicators live in their own collection so they don't bloat chat
// documents with frequent writes. Each entry: typing/{chatId}/users/{uid}
// with an `updatedAt` server timestamp. We treat anything older than 4
// seconds as stale so the indicator clears even if the writer crashed.

const STALE_MS = 4_000;

export const PresenceService = {
  async setTyping(chatId: string, uid: string, typing: boolean) {
    const ref = doc(db, 'typing', chatId, 'users', uid);
    if (typing) {
      await setDoc(ref, { uid, updatedAt: serverTimestamp() }, { merge: true });
    } else {
      await deleteDoc(ref).catch(() => {});
    }
  },

  /** Subscribe to typing state. Returns an array of uids currently typing
   * (excluding the current viewer). */
  listenToTyping(chatId: string, viewerUid: string, cb: (typingUids: string[]) => void): Unsubscribe {
    return onSnapshot(
      collection(db, 'typing', chatId, 'users'),
      (snap) => {
        const now = Date.now();
        const fresh: string[] = [];
        snap.forEach((d) => {
          if (d.id === viewerUid) return;
          const data = d.data() as { uid: string; updatedAt?: Timestamp };
          const ts = data.updatedAt?.toMillis?.() ?? 0;
          if (now - ts < STALE_MS) fresh.push(d.id);
        });
        cb(fresh);
      },
      () => cb([]),
    );
  },
};

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Collections } from '@/firebase/collections';
import { UserProfile } from '@/types/models';

/** Subscribe to another user's live profile (including lastSeen). Returns
 * `null` until the first snapshot lands. */
export function usePresence(uid: string | undefined): UserProfile | null {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      return;
    }
    setProfile(null);
    const unsub = onSnapshot(
      doc(db, Collections.users, uid),
      (snap) => {
        if (snap.exists()) setProfile({ uid, ...(snap.data() as any) });
      },
      () => setProfile(null),
    );
    return unsub;
  }, [uid]);

  return profile;
}

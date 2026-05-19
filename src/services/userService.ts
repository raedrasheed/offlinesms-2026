import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  limit,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Collections } from '@/firebase/collections';
import { UserProfile } from '@/types/models';

export const UserService = {
  async createOrUpdateProfile(uid: string, data: Partial<UserProfile>) {
    const ref = doc(db, Collections.users, uid);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, { ...data, lastSeen: serverTimestamp() });
    } else {
      await setDoc(ref, {
        ...data,
        uid,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      });
    }
  },

  async getProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, Collections.users, uid));
    return snap.exists() ? ({ uid, ...(snap.data() as any) }) : null;
  },

  async touchLastSeen(uid: string) {
    await updateDoc(doc(db, Collections.users, uid), { lastSeen: serverTimestamp() });
  },

  async findByPhone(phone: string): Promise<UserProfile | null> {
    const q = query(
      collection(db, Collections.users),
      where('phoneNumber', '==', phone),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { uid: d.id, ...(d.data() as any) };
  },

  async listAllUsers(currentUid: string): Promise<UserProfile[]> {
    const snap = await getDocs(collection(db, Collections.users));
    return snap.docs
      .map((d) => ({ uid: d.id, ...(d.data() as any) }) as UserProfile)
      .filter((u) => u.uid !== currentUid)
      .sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? ''));
  },
};

/** Strip all non-digit characters and keep only the last 9 digits — used to
 * fuzzy-match phone numbers across formats (with/without country codes,
 * spaces, dashes, etc.). Good enough for matching device contacts to
 * Firestore users. */
export const normalizePhoneTail = (raw?: string | null): string => {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  return digits.slice(-9);
};

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
    const q = query(collection(db, Collections.users), orderBy('displayName'));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ uid: d.id, ...(d.data() as any) }) as UserProfile)
      .filter((u) => u.uid !== currentUid);
  },
};

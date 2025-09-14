import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'users';

export async function createUserProfile(uid, data) {
  const ref = doc(db, COLLECTION, uid);
  await setDoc(ref, {
    ...data,
    createdAt: data.createdAt || Date.now(),
    updatedAt: Date.now()
  });
}

export async function getUserProfile(uid) {
  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function updateUserProfile(uid, data) {
  const ref = doc(db, COLLECTION, uid);
  await updateDoc(ref, { ...data, updatedAt: Date.now() });
}

export async function ensureUserDoc(user) {
  if (!user) return null;
  const existing = await getUserProfile(user.uid);
  if (!existing) {
    await createUserProfile(user.uid, { email: user.email, role: 'citizen', displayName: user.displayName || user.email.split('@')[0] });
    return getUserProfile(user.uid);
  }
  return existing;
}

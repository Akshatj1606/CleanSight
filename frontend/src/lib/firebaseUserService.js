import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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

// Ensure a Firestore user document exists. Optionally provide initialData
// to control fields (including role) at creation time. We intentionally do
// NOT overwrite an existing document here to keep this idempotent.
export async function ensureUserDoc(user, initialData = {}) {
  if (!user) return null;
  const existing = await getUserProfile(user.uid);
  if (existing) return existing;

  // Decide role: prefer explicit initialData.role, else derive from any legacy
  // pending session storage (defensive), else default to 'citizen'.
  let derivedRole = initialData.role;
  if (!derivedRole) {
    try {
      const pending = sessionStorage.getItem('pendingGoogleRole');
      if (pending) derivedRole = pending;
    } catch (_) {}
  }
  if (!derivedRole) derivedRole = 'citizen';

  const base = {
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    role: derivedRole,
    ...initialData
  };
  await createUserProfile(user.uid, base);
  return getUserProfile(user.uid);
}

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserProfile, getUserProfile, updateUserProfile } from './firebaseUserService';

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signUp(email, password, profileData = {}) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const baseProfile = {
    email,
    role: profileData.role || 'citizen',
    displayName: profileData.displayName || email.split('@')[0],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...profileData
  };
  await createUserProfile(cred.user.uid, baseProfile);
  if (baseProfile.displayName) {
    try { await updateProfile(cred.user, { displayName: baseProfile.displayName }); } catch (_) {}
  }
  return cred.user;
}

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut() {
  await fbSignOut(auth);
}

export async function getCurrentUserWithProfile(user) {
  if (!user) return null;
  const profile = await getUserProfile(user.uid);
  if (!profile) return null; // Could create lazily here
  return { uid: user.uid, email: user.email, ...profile };
}

export async function updateProfileData(uid, data) {
  await updateUserProfile(uid, data);
  return await getUserProfile(uid);
}

export function mapAuthError(error) {
  if (!error || !error.code) return 'Unknown authentication error';
  const map = {
    'auth/email-already-in-use': 'Email already in use',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password is too weak',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Incorrect password'
  };
  return map[error.code] || error.message || 'Authentication failed';
}

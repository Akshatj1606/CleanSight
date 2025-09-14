import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserProfile, getUserProfile, updateUserProfile, ensureUserDoc } from './firebaseUserService';

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

// Google OAuth sign-in / sign-up
export async function signInWithGoogle(extraProfile = {}) {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const cred = await signInWithPopup(auth, provider);
    let existing = await getUserProfile(cred.user.uid);
    if (!existing) {
      const baseProfile = {
        email: cred.user.email,
        role: extraProfile.role || 'citizen',
        displayName: cred.user.displayName || cred.user.email.split('@')[0],
        photoURL: cred.user.photoURL || null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...extraProfile
      };
      await createUserProfile(cred.user.uid, baseProfile);
      existing = baseProfile;
    } else if (extraProfile && Object.keys(extraProfile).length) {
      await updateUserProfile(cred.user.uid, { ...extraProfile, updatedAt: Date.now() });
      existing = { ...existing, ...extraProfile };
    }
    // Final guarantee
    await ensureUserDoc(cred.user);
    return cred.user;
  } catch (err) {
    console.error('[auth] Google sign-in failed', err);
    throw err;
  }
}

// Raw Google popup that returns the full user credential (used to decide if brand new before profile creation)
export async function signInWithGoogleRaw() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred; // contains user + _tokenResponse metadata (new user flag)
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

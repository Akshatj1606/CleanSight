import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Guard: ensure env vars exist (will throw helpful warning in console if missing)
const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID'
];

required.forEach(k => {
  if (!import.meta.env[k]) {
    console.warn(`[firebase] Missing env var ${k}. Check your .env.local file.`);
  }
});

const firebaseConfig = {
  apiKey: "AIzaSyCMsQFKbyAl5p9ekrBgG3YybYnxvvejWEc",
  authDomain: "cleansight-1.firebaseapp.com",
  projectId: "cleansight-1",
  storageBucket: "cleansight-1.firebasestorage.app",
  messagingSenderId: "909272556284",
  appId: "1:909272556284:web:151136c7a2af5431f36d79"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
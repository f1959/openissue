import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAHVf4nffmYhuVBvaQn2DFrUZFV_KR5iEM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'openissue-40eaa.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'openissue-40eaa',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'openissue-40eaa.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '324333369147',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:324333369147:web:bba398db5cb547c00d691e',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const storageFlag = String(import.meta.env.VITE_ENABLE_STORAGE ?? 'false').toLowerCase();
export const storageEnabled = storageFlag === 'true' || storageFlag === '1' || storageFlag === 'yes';

export const storage: FirebaseStorage | null = storageEnabled ? getStorage(app) : null;

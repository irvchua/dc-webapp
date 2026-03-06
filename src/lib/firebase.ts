import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every((value) => typeof value === "string" && value.length > 0);
}

export function getFirebaseAppOrNull(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function getFirestoreOrNull() {
  const app = getFirebaseAppOrNull();
  if (!app) return null;
  return getFirestore(app);
}

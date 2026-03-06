import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAppOrNull } from "./firebase";

export function getFirebaseAuthOrNull() {
  const app = getFirebaseAppOrNull();
  if (!app) return null;
  return getAuth(app);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  const auth = getFirebaseAuthOrNull();
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuthOrNull();
  if (!auth) return null;

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutFirebaseUser() {
  const auth = getFirebaseAuthOrNull();
  if (!auth) return;
  await signOut(auth);
}

export async function getCurrentUserId() {
  const auth = getFirebaseAuthOrNull();
  if (!auth) return null;

  if (auth.currentUser?.uid) return auth.currentUser.uid;

  return await new Promise<string | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user?.uid ?? null);
    });
  });
}

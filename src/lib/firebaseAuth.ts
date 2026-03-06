import {
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  linkWithCredential,
  onAuthStateChanged,
  signInWithEmailAndPassword,
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

export async function signInWithEmailPassword(email: string, password: string) {
  const auth = getFirebaseAuthOrNull();
  if (!auth) return null;

  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmailPassword(email: string, password: string) {
  const auth = getFirebaseAuthOrNull();
  if (!auth) return null;

  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function linkPasswordToCurrentUser(password: string, preferredEmail?: string) {
  const auth = getFirebaseAuthOrNull();
  if (!auth) return null;

  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user");

  const email = preferredEmail?.trim() || user.email;
  if (!email) throw new Error("No email found for user");

  const credential = EmailAuthProvider.credential(email, password);
  const result = await linkWithCredential(user, credential);
  return result.user;
}

export function userHasPasswordProvider(user: User | null) {
  if (!user) return false;
  return user.providerData.some((provider) => provider.providerId === "password");
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

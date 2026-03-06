"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  signInWithGoogle,
  signOutFirebaseUser,
  subscribeToAuthChanges,
} from "@/lib/firebaseAuth";

export default function AuthControls() {
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUid(user?.uid ?? null);
      setEmail(user?.email ?? null);
    });

    return unsubscribe;
  }, []);

  if (!isFirebaseConfigured()) {
    return null;
  }

  return (
    <div className="auth-controls">
      {uid ? (
        <>
          <div className="auth-pill" title={email ?? uid}>
            {email ?? "Signed in"}
          </div>
          <button
            type="button"
            className="btn"
            onClick={async () => {
              setIsBusy(true);
              try {
                await signOutFirebaseUser();
              } finally {
                setIsBusy(false);
              }
            }}
            disabled={isBusy}
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            setIsBusy(true);
            try {
              await signInWithGoogle();
            } finally {
              setIsBusy(false);
            }
          }}
          disabled={isBusy}
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}

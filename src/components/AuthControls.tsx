"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  signOutFirebaseUser,
  subscribeToAuthChanges,
} from "@/lib/firebaseAuth";

export default function AuthControls() {
  const pathname = usePathname();
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

  if (!isFirebaseConfigured() || pathname === "/login" || !uid) {
    return null;
  }

  return (
    <div className="auth-controls">
      <div className="auth-pill" title={email ?? uid}>
        {email ?? "Signed in"}
      </div>

      <div className="auth-actions">
        <Link href="/account" className="auth-btn">Account</Link>
        <button
          type="button"
          className="auth-btn auth-btn-signout"
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
      </div>
    </div>
  );
}


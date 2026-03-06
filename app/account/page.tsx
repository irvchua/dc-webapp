"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FirebaseError } from "firebase/app";
import {
  linkPasswordToCurrentUser,
  subscribeToAuthChanges,
  userHasPasswordProvider,
} from "@/lib/firebaseAuth";

function mapLinkError(error: unknown) {
  const code = (error as FirebaseError | undefined)?.code;

  switch (code) {
    case "auth/provider-already-linked":
      return "A password is already linked to this account.";
    case "auth/credential-already-in-use":
      return "That email/password is already linked to another account.";
    case "auth/requires-recent-login":
      return "Please sign in again with Google and retry.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/invalid-email":
      return "Please use a valid email address.";
    default:
      return "Could not add password right now. Please try again.";
  }
}

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");
      setHasPassword(userHasPasswordProvider(user));
      setIsChecking(false);
    });

    return unsubscribe;
  }, [router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setIsBusy(true);

    try {
      await linkPasswordToCurrentUser(password, email);
      setHasPassword(true);
      setPassword("");
      setStatus("Password login added successfully.");
    } catch (error) {
      setStatus(mapLinkError(error));
    } finally {
      setIsBusy(false);
    }
  };

  if (isChecking) {
    return (
      <main className="shell" style={{ maxWidth: 560 }}>
        <div className="card section-card">Loading account...</div>
      </main>
    );
  }

  return (
    <main className="shell" style={{ maxWidth: 560 }}>
      <section className="card section-card" style={{ padding: 24, gap: 14 }}>
        <button type="button" className="btn" onClick={() => router.push("/")} style={{ width: "fit-content" }}>
          <span className="btn-content"><span className="btn-icon" aria-hidden="true">&#8592;</span><span>Back</span></span>
        </button>
        <h1 className="title" style={{ fontSize: 30 }}>Account Settings</h1>
        <p className="muted" style={{ margin: 0 }}>
          Add email/password login to your Google account for backup sign-in.
        </p>

        {hasPassword ? (
          <div className="card" style={{ padding: 12, borderStyle: "dashed" }}>
            Password login is already linked to this account.
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
            <label className="input-wrap">
              <div className="label">Email</div>
              <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <label className="input-wrap">
              <div className="label">New Password</div>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            <button type="submit" className="btn btn-primary" disabled={isBusy} style={{ width: "fit-content" }}>
              Add Password Login
            </button>
          </form>
        )}

        {status ? (
          <div className="muted" style={{ color: hasPassword ? "var(--success-text)" : "var(--danger-text)" }}>
            {status}
          </div>
        ) : null}
      </section>
    </main>
  );
}

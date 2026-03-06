"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  signInWithEmailPassword,
  signInWithGoogle,
  signUpWithEmailPassword,
  subscribeToAuthChanges,
} from "@/lib/firebaseAuth";

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.2-1.9 3l3 2.3c1.8-1.6 2.8-4 2.8-6.8 0-.7-.1-1.4-.2-2H12z" />
      <path fill="#34A853" d="M12 22c2.6 0 4.8-.9 6.4-2.4l-3-2.3c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.2l-3.1 2.4C5 19.7 8.2 22 12 22z" />
      <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L3.3 7.6C2.5 9 2 10.4 2 12s.5 3 1.3 4.4L6.4 14z" />
      <path fill="#4285F4" d="M12 5.8c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 2.8 14.6 2 12 2 8.2 2 5 4.3 3.3 7.6L6.4 10c.8-2.4 3-4.2 5.6-4.2z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        router.replace("/");
        return;
      }
      setIsChecking(false);
    });

    return unsubscribe;
  }, [router]);

  const submitCredentials = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    setIsBusy(true);

    try {
      if (mode === "signin") {
        await signInWithEmailPassword(email.trim(), password);
      } else {
        await signUpWithEmailPassword(email.trim(), password);
      }
    } catch {
      setErrorMsg(mode === "signin" ? "Unable to sign in. Check email/password." : "Unable to sign up. Use a valid email and stronger password.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <main className="shell" style={{ maxWidth: 560, minHeight: "100vh", alignContent: "center" }}>
      <section className="card section-card" style={{ padding: 24, gap: 14 }}>
        <h1 className="title" style={{ fontSize: 32 }}>Welcome Back</h1>
        <p className="muted" style={{ margin: 0 }}>
          Sign in to access your deal dashboard.
        </p>

        {!isFirebaseConfigured() ? (
          <div className="card" style={{ padding: 14, borderStyle: "dashed" }}>
            Firebase config is missing. Add `NEXT_PUBLIC_FIREBASE_*` environment variables.
          </div>
        ) : (
          <>
            <form onSubmit={submitCredentials} style={{ display: "grid", gap: 10, width: "100%" }}>
              <label className="input-wrap">
                <div className="label">Email</div>
                <input
                  className="field"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              <label className="input-wrap">
                <div className="label">Password</div>
                <input
                  className="field"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </label>

              {errorMsg ? <div style={{ color: "var(--danger-text)", fontSize: 13 }}>{errorMsg}</div> : null}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isBusy || isChecking}
                style={{ width: "100%", maxWidth: 260, justifySelf: "center" }}
              >
                {isChecking ? "Checking session..." : mode === "signin" ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <button
              type="button"
              className="btn"
              onClick={() => {
                setMode((prev) => (prev === "signin" ? "signup" : "signin"));
                setErrorMsg(null);
              }}
              disabled={isBusy || isChecking}
              style={{ width: "100%", maxWidth: 260, justifySelf: "center" }}
            >
              {mode === "signin" ? "Need an account? Sign Up" : "Have an account? Sign In"}
            </button>

            <div className="muted" style={{ fontSize: 12, textAlign: "center" }}>or</div>

            <button
              type="button"
              className="google-signin-btn"
              onClick={async () => {
                setErrorMsg(null);
                setIsBusy(true);
                try {
                  await signInWithGoogle();
                } catch {
                  setErrorMsg("Google sign-in failed. Try again.");
                } finally {
                  setIsBusy(false);
                }
              }}
              disabled={isBusy || isChecking}
            >
              <GoogleMark />
              <span className="google-signin-label">Sign in with Google</span>
            </button>
          </>
        )}
      </section>
    </main>
  );
}

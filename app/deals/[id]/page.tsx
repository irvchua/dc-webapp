"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { DealInput } from "@/lib/dealCalc";
import { calcDeal } from "@/lib/dealCalc";
import { loadDeal, upsertDeal } from "@/lib/storage";
import { subscribeToAuthChanges } from "@/lib/firebaseAuth";
import { DealForm } from "@/components/DealForm";
import { DealOutputs } from "@/components/DealOutputs";

function formatSavedAt(value: string | null | undefined) {
  if (!value) return "Not saved yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not saved yet";
  return `Saved ${date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

export default function DealPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const router = useRouter();

  const [deal, setDeal] = useState<DealInput | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [isDealLoading, setIsDealLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  const out = useMemo(() => (deal ? calcDeal(deal) : null), [deal]);

  const [stackColumns, setStackColumns] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const loaded = await loadDeal(id);
      if (!isMounted) return;
      setDeal(loaded);
      setIsDealLoading(false);
    };

    const unsubscribe = subscribeToAuthChanges((user) => {
      if (!isMounted) return;

      if (!user) {
        setIsAuthed(false);
        setIsDealLoading(false);
        router.replace("/login");
        return;
      }

      setIsAuthed(true);
      setIsDealLoading(true);
      hydrate();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [id, router]);

  useEffect(() => {
    const updateLayout = () => setStackColumns(window.innerWidth < 1360);
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    if (saveState !== "saved") return;
    const timer = window.setTimeout(() => setSaveState("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [saveState]);

  if (isAuthed === null || isDealLoading) {
    return (
      <main className="shell" style={{ maxWidth: 1100 }}>
        <div className="card section-card">Loading deal...</div>
      </main>
    );
  }

  if (!isAuthed) {
    return null;
  }

  if (!deal) {
    return (
      <main className="shell" style={{ maxWidth: 1100 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <button onClick={() => router.push("/")} className="btn" style={{ width: "fit-content" }}>
            <span className="btn-content"><span className="btn-icon" aria-hidden="true">&#8592;</span><span>Back</span></span>
          </button>
          <div className="card section-card">Deal not found.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="card topbar">
        <button onClick={() => router.push("/")} className="btn">
          <span className="btn-content"><span className="btn-icon" aria-hidden="true">&#8592;</span><span>Back</span></span>
        </button>

        <div style={{ fontWeight: 800, fontSize: 18, marginInline: "auto" }}>{deal.propertyLabel}</div>

        <div style={{ display: "grid", justifyItems: "end", gap: 6 }}>
          <button
            onClick={async () => {
              const nowIso = new Date().toISOString();
              const nextDeal = { ...deal, lastSavedAt: nowIso };
              const saved = await upsertDeal(nextDeal);
              setDeal(saved);
              setSaveState("saved");
            }}
            className="btn btn-primary"
          >
            <span className="btn-content"><span className="btn-icon" aria-hidden="true">&#128190;</span><span>Save Deal</span></span>
          </button>
          <div className="muted" style={{ minHeight: 18, fontSize: 12, fontWeight: 700, color: saveState === "saved" ? "var(--success-text)" : undefined }}>
            {saveState === "saved" ? "Saved just now" : formatSavedAt(deal.lastSavedAt)}
          </div>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: stackColumns ? "minmax(0, 1fr)" : "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 14,
          alignItems: "start",
        }}
      >
        <DealForm
          deal={deal}
          out={out}
          onChange={(next) => {
            setDeal(next);
          }}
        />

        <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
          <div className="section-card card" style={{ gap: 6 }}>
            <div className="label">Purchase Price</div>
            <input
              className="field"
              inputMode="decimal"
              type="number"
              step={1000}
              value={deal.purchasePrice}
              onChange={(e) => {
                const raw = e.target.value;
                setDeal({ ...deal, purchasePrice: raw === "" ? 0 : Number(raw) || 0 });
              }}
              style={{ padding: "14px 16px", borderWidth: 2, fontSize: 22, fontWeight: 800 }}
            />
          </div>

          {out && <DealOutputs out={out} />}
        </div>
      </div>
    </main>
  );
}

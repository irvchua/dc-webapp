"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { DealInput } from "@/lib/dealCalc";
import { calcDeal } from "@/lib/dealCalc";
import { loadDeals, upsertDeal } from "@/lib/storage";
import { DealForm } from "@/components/DealForm";
import { DealOutputs } from "@/components/DealOutputs";

export default function DealPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const router = useRouter();

  const [deal, setDeal] = useState<DealInput | null>(() => {
    const deals = loadDeals();
    return deals.find((d) => d.id === id) ?? null;
  });

  const out = useMemo(() => (deal ? calcDeal(deal) : null), [deal]);

  const [stackColumns, setStackColumns] = useState(false);

  useEffect(() => {
    const updateLayout = () => setStackColumns(window.innerWidth < 1360);
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

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

        <button
          onClick={() => {
            upsertDeal(deal);
            alert("Saved");
          }}
          className="btn btn-primary"
        >
          <span className="btn-content"><span className="btn-icon" aria-hidden="true">&#128190;</span><span>Save Deal</span></span>
        </button>
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



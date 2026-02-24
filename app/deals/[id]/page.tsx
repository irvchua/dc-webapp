"use client";

import { useMemo, useState } from "react";
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

  if (!deal) {
    return (
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <button
            onClick={() => router.push("/")}
            style={{
              width: "fit-content",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
            }}
          >
            ← Back
          </button>
          <div
            style={{ padding: 14, border: "1px solid #eee", borderRadius: 14 }}
          >
            Deal not found.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 20,
        display: "grid",
        gap: 14,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
          }}
        >
          ← Back
        </button>

        <button
          onClick={() => {
            upsertDeal(deal);
            alert("Saved");
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            fontWeight: 800,
          }}
        >
          Save Deal
        </button>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        <DealForm
          deal={deal}
          onChange={(next) => {
            setDeal(next);
            // autosave optional:
            // upsertDeal(next);
          }}
        />
        {out && <DealOutputs out={out} />}
      </div>
    </main>
  );
}

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
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 20px 40px",
        }}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <button
            onClick={() => router.push("/")}
            style={{
              width: "fit-content",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <div
            style={{
              padding: 16,
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              background: "#ffffff",
            }}
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
        maxWidth: 1180,
        margin: "0 auto",
        padding: "28px 20px 40px",
        display: "grid",
        gap: 16,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          background: "#fff",
          border: "1px solid #e5eaf1",
          borderRadius: 16,
          padding: "14px 16px",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            background: "#f8fafc",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <div style={{ fontWeight: 800, fontSize: 18, marginInline: "auto" }}>
          {deal.propertyLabel}
        </div>

        <button
          onClick={() => {
            upsertDeal(deal);
            alert("Saved");
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #0f60ff",
            background: "#1463ff",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Save Deal
        </button>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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

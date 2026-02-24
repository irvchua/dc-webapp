"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DealInput } from "@/lib/dealCalc";
import { loadDeals, saveDeals, deleteDeal } from "@/lib/storage";
import { makeDefaultDeal } from "@/lib/DefaultDeal";

export default function Page() {
  const [deals, setDeals] = useState<DealInput[]>(() => loadDeals());
  const sorted = useMemo(() => deals.slice(), [deals]);

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
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>
          Deal Calculator
        </h1>

        <button
          onClick={() => {
            const next = makeDefaultDeal();
            const updated = [next, ...deals];
            setDeals(updated);
            saveDeals(updated);
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            fontWeight: 700,
          }}
        >
          + New Deal
        </button>
      </header>

      {sorted.length === 0 ? (
        <div
          style={{
            padding: 14,
            border: "1px solid #eee",
            borderRadius: 14,
            opacity: 0.8,
          }}
        >
          No deals yet. Click “New Deal”.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {sorted.map((d) => (
            <div
              key={d.id}
              style={{
                padding: 14,
                border: "1px solid #eee",
                borderRadius: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 900 }}>{d.propertyLabel}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  Sqft: {d.subjectSqft}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Link
                  href={`/deals/${d.id}`}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    fontWeight: 700,
                  }}
                >
                  Edit Deal
                </Link>

                <button
                  onClick={() => {
                    deleteDeal(d.id);
                    const updated = loadDeals();
                    setDeals(updated);
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

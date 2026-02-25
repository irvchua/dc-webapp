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
        padding: "32px 20px 40px",
        display: "grid",
        gap: 18,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          background: "#ffffff",
          borderRadius: 18,
          border: "1px solid #e5eaf1",
          boxShadow: "0 8px 25px rgba(17, 24, 39, 0.06)",
          padding: "20px 22px",
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
            Deal Calculator
          </h1>
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            Create and manage your acquisition scenarios.
          </div>
        </div>

        <button
          onClick={() => {
            const next = makeDefaultDeal();
            const updated = [next, ...deals];
            setDeals(updated);
            saveDeals(updated);
          }}
          style={{
            padding: "11px 16px",
            borderRadius: 12,
            border: "1px solid #0f60ff",
            background: "#1463ff",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + New Deal
        </button>
      </header>

      {sorted.length === 0 ? (
        <div
          style={{
            padding: 18,
            border: "1px dashed #cbd5e1",
            borderRadius: 16,
            color: "#475569",
            background: "#f8fafc",
          }}
        >
          No deals yet. Click <strong>New Deal</strong> to create your first one.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sorted.map((d) => (
            <div
              key={d.id}
              style={{
                padding: 16,
                border: "1px solid #e6ebf2",
                borderRadius: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                background: "#fff",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{d.propertyLabel}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  {d.subjectSqft.toLocaleString()} sqft
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  href={`/deals/${d.id}`}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    fontWeight: 700,
                    color: "#1e293b",
                    textDecoration: "none",
                    background: "#f8fafc",
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
                    borderRadius: 10,
                    border: "1px solid #fecaca",
                    background: "#fff1f2",
                    color: "#9f1239",
                    cursor: "pointer",
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

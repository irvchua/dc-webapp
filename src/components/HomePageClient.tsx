"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calcDeal, type DealInput } from "@/lib/dealCalc";
import { loadDeals, saveDeals, deleteDeal } from "@/lib/storage";
import { makeDefaultDeal } from "@/lib/DefaultDeal";

function money(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function HomePageClient() {
  const [deals, setDeals] = useState<DealInput[]>(() => loadDeals());
  const sorted = useMemo(() => deals.slice(), [deals]);

  return (
    <main
      style={{
        maxWidth: 1200,
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
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Deal Calculator</h1>
          <div style={{ color: "#6b7280", fontSize: 14 }}>Summary dashboard</div>
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
          {sorted.map((d) => {
            const out = calcDeal(d);
            return (
              <div
                key={d.id}
                style={{
                  padding: 16,
                  border: "1px solid #e6ebf2",
                  borderRadius: 14,
                  display: "grid",
                  gap: 12,
                  background: "#fff",
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{d.propertyLabel}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{d.propertyAddress || "No address"}</div>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: out.isComplete ? "#dcfce7" : "#fff7ed",
                      color: out.isComplete ? "#166534" : "#9a3412",
                      border: `1px solid ${out.isComplete ? "#86efac" : "#fdba74"}`,
                    }}
                  >
                    {out.isComplete ? "Complete" : "Needs Inputs"}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  <Metric label="SQFT" value={d.subjectSqft.toLocaleString()} />
                  <Metric label="Adjusted ARV" value={money(out.adjustedArv)} />
                  <Metric label="MAO (Novation)" value={money(out.maoNovation)} />
                  <Metric label="Walkaway Cash" value={money(out.totalWalkawayCash)} />
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
            );
          })}
        </div>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #edf2f7", background: "#fafcff" }}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

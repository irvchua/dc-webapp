"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { calcDeal, type DealInput } from "@/lib/dealCalc";
import { loadDeals, deleteDeal, upsertDeal } from "@/lib/storage";
import { subscribeToAuthChanges } from "@/lib/firebaseAuth";
import { makeDefaultDeal } from "@/lib/DefaultDeal";

function money(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function HomePageClient() {
  const [deals, setDeals] = useState<DealInput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sorted = useMemo(() => deals.slice(), [deals]);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const loaded = await loadDeals();
      if (!isMounted) return;
      setDeals(loaded);
      setIsLoading(false);
    };

    const unsubscribe = subscribeToAuthChanges(() => {
      hydrate();
    });

    hydrate();
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <main className="shell" style={{ maxWidth: 1200 }}>
      <header className="card topbar" style={{ boxShadow: "var(--shadow-soft)" }}>
        <div style={{ display: "grid", gap: 4 }}>
          <h1 className="title">Deal Calculator</h1>
          <div className="muted" style={{ fontSize: 14 }}>Summary dashboard</div>
        </div>

        <button
          onClick={async () => {
            const next = makeDefaultDeal();
            const saved = await upsertDeal(next);
            setDeals((prev) => [saved, ...prev.filter((d) => d.id !== saved.id)]);
          }}
          className="btn btn-primary"
          style={{ padding: "11px 16px" }}
        >
          <span className="btn-content"><span className="btn-icon" aria-hidden="true">+</span><span>New Deal</span></span>
        </button>
      </header>

      {!isLoading && sorted.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 18,
            borderStyle: "dashed",
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
              <div key={d.id} className="card" style={{ padding: 16, display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{d.propertyLabel}</div>
                    <div className="muted" style={{ fontSize: 13 }}>{d.propertyAddress || "No address"}</div>
                  </div>

                  <div className={`status-badge ${out.isComplete ? "status-ok" : "status-warn"}`}>
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
                  <Link href={`/deals/${d.id}`} className="btn">
                    <span className="btn-content"><span className="btn-icon" aria-hidden="true">&#9998;</span><span>Edit Deal</span></span>
                  </Link>

                  <button
                    onClick={async () => {
                      await deleteDeal(d.id);
                      setDeals((prev) => prev.filter((deal) => deal.id !== d.id));
                    }}
                    className="btn btn-danger"
                  >
                    <span className="btn-content"><span className="btn-icon" aria-hidden="true">&#128465;</span><span>Delete</span></span>
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
    <div className="metric-tile">
      <div className="label" style={{ marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}


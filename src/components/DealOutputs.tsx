"use client";

import { useMemo, useState } from "react";
import type { DealOutput } from "@/lib/dealCalc";
import { buildWholesaleTable } from "@/lib/wholesaleTable";
import { WholesaleTable } from "@/components/WholesaleTable";
import { WholesaleSnapshotModal } from "@/components/WholesaleSnapshotModal";

function money(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function num(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function DealOutputs({ out }: { out: DealOutput }) {
  const [isWholesaleSnapshotOpen, setIsWholesaleSnapshotOpen] = useState(false);

  const hardCosts =
    (out.retailCommission ?? 0) +
    (out.retailClosingCosts ?? 0) +
    (out.sellerRetailExpense ?? 0) +
    (out.mansionTax ?? 0) +
    (out.holdingTotal ?? 0) +
    (out.rehabTotal ?? 0);

  const wholesaleRows = buildWholesaleTable({
    flipMao: out.flipMao,
    arv: out.usedArv,
    hardCosts,
  });

  const wholesaleSnapshotRows = useMemo(
    () => [
      { label: "Investor Max Buy Price (Flip MAO)", value: money(out.flipMao), strong: true },
      { label: "ARV", value: money(out.usedArv), strong: false },
      { label: "Estimated Repairs + Adjustments", value: money(out.rehabTotal), strong: false },
      { label: "Net ARV (ARV minus repairs)", value: money(out.netArv), strong: false },
      { label: "Investor Selling + Holding + Mansion Tax", value: money(out.feesToRetail), strong: false },
    ],
    [out]
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 14, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 900 }}>Outputs</div>
          <button
            type="button"
            onClick={() => setIsWholesaleSnapshotOpen(true)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View Wholesale Snapshot
          </button>
        </div>
      </div>

      <WholesaleSnapshotModal
        isOpen={isWholesaleSnapshotOpen}
        onClose={() => setIsWholesaleSnapshotOpen(false)}
        rows={wholesaleSnapshotRows}
      />

      <div style={{ display: "grid", gap: 8, padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
        <div style={{ fontWeight: 900 }}>Novation</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>Novation MAO</div>
          <div style={{ textAlign: "right", fontWeight: 900 }}>{money(out.maoNovation)}</div>

          <div>Adjusted As-Is Value</div>
          <div style={{ textAlign: "right", fontWeight: 700 }}>{money(out.adjustedAsIsValue)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8, padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
        <div style={{ fontWeight: 900 }}>As-Is Value (Comps)</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>Sold $/Sqft</div>
          <div style={{ textAlign: "right" }}>{num(out.soldAsIsPpsf)}</div>

          <div>Active $/Sqft</div>
          <div style={{ textAlign: "right" }}>{num(out.activeAsIsPpsf)}</div>

          <div>As-Is Value (combined)</div>
          <div style={{ textAlign: "right" }}>{money(out.combinedAsIsValue)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8, padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
        <div style={{ fontWeight: 900 }}>ARV (Comps)</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>ARV from comps (combined)</div>
          <div style={{ textAlign: "right" }}>{money(out.combinedArvValue)}</div>

          <div>Sold ARV $/Sqft</div>
          <div style={{ textAlign: "right" }}>{num(out.soldArvPpsf)}</div>

          <div>Active ARV $/Sqft</div>
          <div style={{ textAlign: "right" }}>{num(out.activeArvPpsf)}</div>
        </div>
      </div>

      <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Offer Range to Seller</div>

        {out.offerRanges.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Enter sqft and ARV comps to see ranges.</div>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {out.offerRanges.map((r) => (
              <div key={r.pct} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>{Math.round(r.pct * 100)}% of Investor Max Buy Price</div>
                <div style={{ textAlign: "right", fontWeight: 800 }}>{money(r.offer)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WHOLESALE TABLE */}
      <WholesaleTable rows={wholesaleRows} />
    </div>
  );
}

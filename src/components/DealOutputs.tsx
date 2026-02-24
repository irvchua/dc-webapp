"use client";

import type { DealOutput } from "@/lib/dealCalc";
import { buildWholesaleTable } from "@/lib/wholesaleTable";
import { WholesaleTable } from "@/components/WholesaleTable";

function money(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function num(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function DealOutputs({ out }: { out: DealOutput }) {
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

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 8, padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
        <div style={{ fontWeight: 900 }}>Wholesale Snapshot</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>Investor Max Buy Price (Flip MAO)</div>
          <div style={{ textAlign: "right", fontWeight: 900 }}>{money(out.flipMao)}</div>

          <div>ARV</div>
          <div style={{ textAlign: "right", fontWeight: 700 }}>{money(out.usedArv)}</div>

          <div>Estimated Repairs + Adjustments</div>
          <div style={{ textAlign: "right", fontWeight: 700 }}>{money(out.rehabTotal)}</div>

          <div>Net ARV (ARV minus repairs)</div>
          <div style={{ textAlign: "right", fontWeight: 700 }}>{money(out.netArv)}</div>

          <div>Investor Selling + Holding + Mansion Tax</div>
          <div style={{ textAlign: "right", fontWeight: 700 }}>{money(out.feesToRetail)}</div>
        </div>
      </div>

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

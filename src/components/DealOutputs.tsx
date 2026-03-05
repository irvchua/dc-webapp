"use client";

import { useMemo, useState } from "react";
import type { DealOutput } from "@/lib/dealCalc";
import { WholesaleTable } from "@/components/WholesaleTable";

function money(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function pct(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "-";
  return `${(n * 100).toFixed(2)}%`;
}

function num(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function isNum(n: number | null): n is number {
  return n !== null && Number.isFinite(n);
}

export function DealOutputs({ out }: { out: DealOutput }) {
  const [selectedPct, setSelectedPct] = useState<number | null>(null);

  const selectedOffer = useMemo(() => {
    if (selectedPct === null) return null;
    return out.offerRanges.find((r) => r.pct === selectedPct) ?? null;
  }, [out.offerRanges, selectedPct]);

  const selectedDifference = useMemo(() => {
    if (!selectedOffer || !isNum(out.totalWalkawayCash)) return null;
    return out.totalWalkawayCash - selectedOffer.offer;
  }, [out.totalWalkawayCash, selectedOffer]);

  const buyerCostsExclSellerRetailExpense = useMemo(() => {
    if (!isNum(out.feesToRetail) || !isNum(out.sellerRetailExpense)) return null;
    return out.rehabFinalCost + out.holdingTotal + (out.feesToRetail - out.sellerRetailExpense);
  }, [out.feesToRetail, out.sellerRetailExpense, out.rehabFinalCost, out.holdingTotal]);

  return (
    <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
      <div className="section-card card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 900 }}>Outputs</div>
          <div className={`status-badge ${out.isComplete ? "status-ok" : "status-warn"}`}>{out.isComplete ? "Ready" : "Incomplete Inputs"}</div>
        </div>
      </div>

      <div className="section-card card" style={{ gap: 8 }}>
        <div style={{ fontWeight: 900 }}>As-Is and Novation</div>
        <MetricRow label="Sold As-Is $/Sqft" helper="Average of non-zero sold comp price/sqft values." value={num(out.soldAsIsPpsf)} />
        <MetricRow label="Active As-Is $/Sqft" helper="Average of non-zero active comp price/sqft values." value={num(out.activeAsIsPpsf)} />
        <MetricRow label="Adjusted As-Is Value" helper="Combined As-Is value x (1 - market adjustment %)." value={money(out.adjustedAsIsValue)} />
        <MetricRow label="MAO (Novation)" helper="Adjusted As-Is - novation closing fee - desired profit." value={money(out.maoNovation)} strong />
      </div>

      <div className="section-card card" style={{ gap: 8 }}>
        <div style={{ fontWeight: 900 }}>ARV and Rehab</div>
        <MetricRow label="ARV Before Adjustments" helper="ARV override if provided, else combined ARV comps." value={money(out.arvBeforeAdjustments)} />
        <MetricRow label="Rehab Final Cost" helper="Custom rehab if set, else rehab type cost + damage multiplier." value={money(out.rehabFinalCost)} />
        <MetricRow label="Flood Discount" helper="ARV before adjustments x 15% when Flood Zone is checked." value={money(out.floodDiscount)} />
        <MetricRow label="Double Yellow Discount" helper="ARV before adjustments x 5% when Double Yellow is checked." value={money(out.doubleYellowDiscount)} />
        <MetricRow label="Adjusted ARV" helper="ARV before adjustments - (flood discount + double yellow discount)." value={money(out.adjustedArv)} strong />
      </div>

      <div className="section-card card" style={{ gap: 8 }}>
        <div style={{ fontWeight: 900 }}>Holding and Fees</div>
        <MetricRow label="Holding / Month" helper="HOA/12 + insurance/12 + taxes/12 + monthly mortgage + monthly other." value={money(out.holdingMonthly)} />
        <MetricRow label="Holding Total" helper="Holding / Month x months until sold." value={money(out.holdingTotal)} />
        <MetricRow label="Fees to Retail" helper="Retail commission + closing costs + seller retail expense + mansion tax." value={money(out.feesToRetail)} />
        <MetricRow label="Mansion Tax %" helper="Tiered rate based on adjusted ARV." value={pct(out.mansionTaxPct)} />
      </div>

      <div className="section-card card" style={{ gap: 8 }}>
        <div style={{ fontWeight: 900 }}>Offer Planning</div>
        <MetricRow
          label="Buyer Costs (Excl. Seller Retail Expense)"
          helper="Rehab final cost + holding total + (fees to retail - seller retail expense)."
          value={money(buyerCostsExclSellerRetailExpense)}
        />
        <MetricRow
          label="Buyer Costs (Incl. Seller Retail Expense)"
          helper="Fees to retail + holding total + rehab final cost."
          value={money(out.totalWalkawayCosts)}
        />
        <MetricRow
          label="Projected Buyer Total Costs"
          helper="Purchase price + buyer costs (excl. seller retail expense)."
          value={money(out.wholesaleRows[0]?.totalCost ?? null)}
        />
        <MetricRow
          label="Projected Buyer Remaining Cash"
          helper="Adjusted ARV - buyer costs (incl. seller retail expense)."
          value={money(out.totalWalkawayCash)}
          strong
        />

        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {out.offerRanges.map((r) => {
            const isChecked = selectedPct === r.pct;
            return (
              <div key={r.pct} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <input type="checkbox" checked={isChecked} onChange={() => setSelectedPct((prev) => (prev === r.pct ? null : r.pct))} />
                  <span>{`${Math.round(r.pct * 100)}% of Maximum Allowable Offer (MAO)`}</span>
                </label>
                <div style={{ textAlign: "right", fontWeight: 700 }}>{money(r.offer)}</div>
              </div>
            );
          })}
        </div>

        <MetricRow
          label={selectedOffer ? `Selected MAO Buffer (${Math.round(selectedOffer.pct * 100)}%)` : "Selected MAO Buffer"}
          helper="Projected buyer remaining cash - selected percentage amount."
          value={money(selectedDifference)}
          strong
        />
      </div>

      <WholesaleTable rows={out.wholesaleRows} />
    </div>
  );
}

function MetricRow({ label, helper, value, strong }: { label: string; helper?: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10 }}>
      <div>
        <div>{label}</div>
        {helper ? <div className="muted" style={{ fontSize: 11 }}>{helper}</div> : null}
      </div>
      <div style={{ textAlign: "right", fontWeight: strong ? 900 : 700 }}>{value}</div>
    </div>
  );
}

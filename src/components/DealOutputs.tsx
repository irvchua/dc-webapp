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

function signColor(n: number | null): string | undefined {
  if (n === null || !Number.isFinite(n)) return undefined;
  if (n < 0) return "var(--danger-text)";
  return undefined;
}

export function DealOutputs({ out, onSetPurchasePrice }: { out: DealOutput; onSetPurchasePrice?: (value: number) => void }) {
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
        <MetricRow label="Sold As-Is $/Sqft" helper="Average of non-zero sold comps matching the subject's flood-zone status (falls back to all comps if none match)." value={num(out.soldAsIsPpsf)} />
        <MetricRow label="Active As-Is $/Sqft" helper="Average of non-zero active comps matching the subject's flood-zone status (falls back to all comps if none match)." value={num(out.activeAsIsPpsf)} />
        <MetricRow label="Combined As-Is Value" helper="Sold value x 70% + active value x 30% when both exist; otherwise whichever is available." value={money(out.combinedAsIsValue)} />
        <MetricRow label="As-Is Flood Discount" helper="Combined As-Is value x 15% when Flood Zone is checked." value={money(out.asIsFloodDiscount)} />
        <MetricRow label="As-Is Double Yellow Discount" helper="Combined As-Is value x 5% when Double Yellow is checked." value={money(out.asIsDoubleYellowDiscount)} />
        <MetricRow
          label="Adjusted As-Is Value"
          helper="(Combined As-Is value - flood/double-yellow discounts) x (1 - market adjustment %)."
          value={money(out.adjustedAsIsValue)}
        />
        <MetricRow
          label="MAO — Novation (As-Is Exit)"
          helper="Adjusted As-Is value - novation closing fee - desired profit. Use for as-is, no-rehab resale deals."
          value={money(out.maoNovation)}
          valueColor={signColor(out.maoNovation)}
          strong
          action={
            onSetPurchasePrice && isNum(out.maoNovation)
              ? { label: "Use as Purchase Price", onClick: () => onSetPurchasePrice(Math.max(0, out.maoNovation as number)) }
              : undefined
          }
        />
      </div>

      <div className="section-card card" style={{ gap: 8 }}>
        <div style={{ fontWeight: 900 }}>ARV and Rehab</div>
        <MetricRow label="ARV Before Adjustments" helper="ARV override if provided, else combined ARV comps (same 70/30 sold/active weighting as As-Is)." value={money(out.arvBeforeAdjustments)} />
        <MetricRow label="Rehab Final Cost" helper="Custom rehab if set, else rehab type cost + damage multiplier." value={money(out.rehabFinalCost)} />
        <MetricRow label="Flood Discount" helper="ARV before adjustments x 15% when Flood Zone is checked." value={money(out.floodDiscount)} />
        <MetricRow label="Double Yellow Discount" helper="ARV before adjustments x 5% when Double Yellow is checked." value={money(out.doubleYellowDiscount)} />
        <MetricRow label="Adjusted ARV" helper="ARV before adjustments - (flood discount + double yellow discount). Use for rehab-and-resell (wholesale/flip) deals." value={money(out.adjustedArv)} strong />
      </div>

      <div className="section-card card" style={{ gap: 8 }}>
        <div style={{ fontWeight: 900 }}>Holding and Fees</div>
        <MetricRow
          label={out.mortgageAutoApplied ? "Monthly Mortgage (Auto)" : "Monthly Mortgage"}
          helper={out.mortgageAutoApplied ? "Auto estimate: purchase price × 10% ÷ 12." : "Entered monthly mortgage; zero represents an all-cash deal."}
          value={money(out.monthlyMortgageUsed)}
        />
        <MetricRow label="Holding / Month" helper="HOA/12 + insurance/12 + taxes/12 + resolved monthly mortgage + monthly other." value={money(out.holdingMonthly)} />
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
          helper="Adjusted ARV - buyer costs (incl. seller retail expense). Negative means the deal loses money before a purchase price is even applied."
          value={money(out.totalWalkawayCash)}
          valueColor={signColor(out.totalWalkawayCash)}
          strong
        />

        <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
          These are ARV-based offers for a rehab-and-resell exit (distinct from the As-Is Novation MAO above).
        </div>
        <div style={{ marginTop: 4, display: "grid", gap: 6 }}>
          {out.offerRanges.map((r) => {
            const isChecked = selectedPct === r.pct;
            return (
              <div key={r.pct} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", gap: 10, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <input type="checkbox" checked={isChecked} onChange={() => setSelectedPct((prev) => (prev === r.pct ? null : r.pct))} />
                  <span>{`${Math.round(r.pct * 100)}% of ARV-Based Offer (Rehab Exit)`}</span>
                </label>
                <div style={{ textAlign: "right", fontWeight: 700, color: signColor(r.offer) }}>{money(r.offer)}</div>
                {onSetPurchasePrice ? (
                  <button type="button" className="btn" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => onSetPurchasePrice(Math.max(0, r.offer))}>
                    Use
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>

        <MetricRow
          label={selectedOffer ? `Selected Rehab-Exit Offer Buffer (${Math.round(selectedOffer.pct * 100)}%)` : "Selected Rehab-Exit Offer Buffer"}
          helper="Projected buyer remaining cash - selected percentage amount."
          value={money(selectedDifference)}
          valueColor={signColor(selectedDifference)}
          strong
        />
      </div>

      <WholesaleTable rows={out.wholesaleRows} />
    </div>
  );
}

function MetricRow({
  label,
  helper,
  value,
  strong,
  valueColor,
  action,
}: {
  label: string;
  helper?: string;
  value: string;
  strong?: boolean;
  valueColor?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", gap: 10, alignItems: "center" }}>
      <div>
        <div>{label}</div>
        {helper ? <div className="muted" style={{ fontSize: 11 }}>{helper}</div> : null}
      </div>
      <div style={{ textAlign: "right", fontWeight: strong ? 900 : 700, color: valueColor }}>{value}</div>
      {action ? (
        <button type="button" className="btn" style={{ padding: "4px 8px", fontSize: 11 }} onClick={action.onClick}>
          {action.label}
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}

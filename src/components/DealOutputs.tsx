"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type { CompConfidence, DealInput, DealOutput } from "@/lib/dealCalc";
import { ARV_OFFER_STEPS, WHOLESALE_PCT_STEPS, calcCashOfferScenario, makeWholesaleRows } from "@/lib/dealCalc";
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

function confidenceLabel(c: CompConfidence): string {
  const parts = [`${c.validCount} of ${c.totalCount} comps used`];
  if (c.avgAgeDays !== null) parts.push(`avg ${c.avgAgeDays}d old`);
  return parts.join(" · ");
}

function confidenceColor(c: CompConfidence): string | undefined {
  if (c.validCount <= 1) return "var(--warning-text)";
  if (c.avgAgeDays !== null && c.avgAgeDays > 180) return "var(--warning-text)";
  return undefined;
}

function ConfidenceNote({ c }: { c: CompConfidence }) {
  return (
    <div className="muted" style={{ fontSize: 11, marginTop: -4, color: confidenceColor(c) }}>
      {confidenceLabel(c)}
    </div>
  );
}

export function DealOutputs({
  out,
  deal,
  onSetPurchasePrice,
}: {
  out: DealOutput;
  deal: DealInput;
  onSetPurchasePrice?: (value: number) => void;
}) {
  const [selectedPct, setSelectedPct] = useState<number | null>(null);
  const [cashOfferPct, setCashOfferPct] = useState<number>(0.7);
  const [investorSplitPct, setInvestorSplitPct] = useState<number>(0.5);

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
    return out.rehabFinalCost + out.holdingTotal + out.totalAcquisitionCosts + (out.feesToRetail - out.sellerRetailExpense);
  }, [out.feesToRetail, out.sellerRetailExpense, out.rehabFinalCost, out.holdingTotal, out.totalAcquisitionCosts]);

  const cashScenario = useMemo(
    () => calcCashOfferScenario(deal, cashOfferPct),
    [deal, cashOfferPct]
  );
  const cashOfferToSeller = cashScenario.offer;
  const cashScenarioOut = cashScenario.output;
  const recommendedDealType =
    isNum(out.maoNovation) && isNum(cashOfferToSeller)
      ? out.maoNovation >= cashOfferToSeller ? "Novation" : "Cash"
      : isNum(out.maoNovation)
        ? "Novation"
        : isNum(cashOfferToSeller)
          ? "Cash"
          : null;
  const recommendationDifference =
    isNum(out.maoNovation) && isNum(cashOfferToSeller)
      ? Math.abs(out.maoNovation - cashOfferToSeller)
      : null;

  const investorRow = useMemo(() => {
    if (
      cashOfferToSeller === null ||
      !isNum(cashScenarioOut.adjustedArv) ||
      !isNum(cashScenarioOut.feesToRetail) ||
      !isNum(cashScenarioOut.sellerRetailExpense)
    ) return null;
    const candidateBuyerCosts =
      cashScenarioOut.rehabFinalCost +
      cashScenarioOut.holdingTotal +
      cashScenarioOut.totalAcquisitionCosts +
      (cashScenarioOut.feesToRetail - cashScenarioOut.sellerRetailExpense);
    const rows = makeWholesaleRows({
      arv: cashScenarioOut.adjustedArv,
      purchasePrice: cashOfferToSeller,
      rehabCost: cashScenarioOut.rehabFinalCost,
      financePurchaseLtvPct: cashScenarioOut.financePurchaseLtvPct,
      financeRehabLtvPct: cashScenarioOut.financeRehabLtvPct,
      holdingTotal: cashScenarioOut.holdingTotal,
      acquisitionCosts: cashScenarioOut.totalAcquisitionCosts,
      hardCosts: candidateBuyerCosts,
      monthsUntilSold: cashScenarioOut.monthsUntilSold,
    });
    return rows.find((r) => r.pct === investorSplitPct) ?? null;
  }, [
    cashOfferToSeller,
    cashScenarioOut,
    investorSplitPct,
  ]);

  return (
    <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
      <div className="section-card card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 900 }}>Outputs</div>
          <div className={`status-badge ${out.isComplete ? "status-ok" : "status-warn"}`}>{out.isComplete ? "Ready" : "Incomplete Inputs"}</div>
        </div>
      </div>

      <CollapsibleCard title="Who Each Number Applies To">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          <RoleTile title="1. Original Homeowner" text="Sells the property. Receives your Novation Offer or Cash Offer." />
          <RoleTile title="2. You — Acquirer / Wholesaler" text="Contracts with the homeowner. In a wholesale deal, you earn the assignment fee." />
          <RoleTile title="3. End Investor" text="Buys the assigned deal from you, then pays for acquisition, rehab, holding, and resale." />
          <RoleTile title="4. Retail Buyer" text="Eventually buys the finished property from the end investor at the modeled retail exit value." />
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="As-Is and Novation (Detail)">
        <MetricRow label="Sold As-Is $/Sqft" helper="Average of non-zero sold comps matching the subject's flood-zone status (falls back to all comps if none match)." value={num(out.soldAsIsPpsf)} />
        <ConfidenceNote c={out.compConfidence.asIsSold} />
        <MetricRow label="Active As-Is $/Sqft" helper="Average of non-zero active comps matching the subject's flood-zone status (falls back to all comps if none match)." value={num(out.activeAsIsPpsf)} />
        <ConfidenceNote c={out.compConfidence.asIsActive} />
        <MetricRow label="Combined As-Is Value" helper="Sold value x 70% + active value x 30% when both exist; otherwise whichever is available." value={money(out.combinedAsIsValue)} />
        <MetricRow label="As-Is Flood Discount" helper="Combined As-Is value x 15% when Flood Zone is checked." value={money(out.asIsFloodDiscount)} />
        <MetricRow label="As-Is Double Yellow Discount" helper="Combined As-Is value x 5% when Double Yellow is checked." value={money(out.asIsDoubleYellowDiscount)} />
        <MetricRow
          label="Adjusted As-Is Value"
          helper="(Combined As-Is value - flood/double-yellow discounts) x (1 - market adjustment %)."
          value={money(out.adjustedAsIsValue)}
          strong
        />
        <div className="muted" style={{ fontSize: 11 }}>
          The final Novation Offer number (and its Use as Purchase Price button) lives in the Novation Offer vs. Cash Offer card below.
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="ARV and Rehab (Detail)">
        <MetricRow label="ARV Before Adjustments" helper="ARV override if provided, else combined ARV comps (same 70/30 sold/active weighting as As-Is)." value={money(out.arvBeforeAdjustments)} />
        <div style={{ display: "grid", gap: 2, marginTop: -6 }}>
          <div className="muted" style={{ fontSize: 11, color: confidenceColor(out.compConfidence.arvSold) }}>
            Sold comps: {confidenceLabel(out.compConfidence.arvSold)}
          </div>
          <div className="muted" style={{ fontSize: 11, color: confidenceColor(out.compConfidence.arvActive) }}>
            Active comps: {confidenceLabel(out.compConfidence.arvActive)}
          </div>
        </div>
        <MetricRow label="Rehab Before Contingency" helper="Custom rehab amount if set, else rehab type cost per sqft + damage multiplier." value={money(out.rehabBeforeContingency)} />
        <MetricRow label="Rehab Contingency" helper="Rehab before contingency x contingency %. A buffer for the overruns most rehab budgets hit." value={money(out.rehabContingency)} />
        <MetricRow label="Rehab Final Cost" helper="Rehab before contingency + contingency buffer." value={money(out.rehabFinalCost)} strong />
        <MetricRow label="Flood Discount" helper="ARV before adjustments x 15% when Flood Zone is checked." value={money(out.floodDiscount)} />
        <MetricRow label="Double Yellow Discount" helper="ARV before adjustments x 5% when Double Yellow is checked." value={money(out.doubleYellowDiscount)} />
        <MetricRow label="Adjusted ARV" helper="ARV before adjustments - (flood discount + double yellow discount). Use for rehab-and-resell (wholesale/flip) deals." value={money(out.adjustedArv)} strong />
      </CollapsibleCard>

      <div className="section-card card" style={{ gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Novation Offer vs. Cash Offer</div>
          <Link href="/formulas#comparison" className="context-help">
            <span aria-hidden="true">?</span> Which deal type should I use?
          </Link>
        </div>
        <p className="muted" style={{ fontSize: 11, margin: 0 }}>
          Novation offer is priced off today&apos;s as-is value with no rehab. Cash offer is priced off ARV assuming a rehab-and-resell
          exit, then re-priced again for whichever investor takes the wholesale assignment. These will normally differ — pick the one
          matching how you actually plan to exit the deal.
        </p>

        <MetricRow
          label="Novation Offer (You → Original Homeowner)"
          helper="What you can offer the homeowner for an as-is, no-rehab novation exit."
          value={money(out.maoNovation)}
          valueColor={signColor(out.maoNovation)}
          strong
          action={
            onSetPurchasePrice && isNum(out.maoNovation)
              ? { label: "Use as Purchase Price", onClick: () => onSetPurchasePrice(Math.max(0, out.maoNovation as number)) }
              : undefined
          }
        />

        <label className="input-wrap" style={{ gap: 4 }}>
          <div className="label">Cash Offer % (of Projected Buyer Remaining Cash)</div>
          <select className="field" value={cashOfferPct} onChange={(e) => setCashOfferPct(Number(e.target.value))}>
            {ARV_OFFER_STEPS.map((p) => (
              <option key={p} value={p}>{Math.round(p * 100)}%</option>
            ))}
          </select>
        </label>

        <MetricRow
          label="Cash Offer (You → Original Homeowner)"
          helper="What you offer the homeowner for a cash/wholesale acquisition at the selected percentage."
          value={money(cashOfferToSeller)}
          valueColor={signColor(cashOfferToSeller)}
          strong
          action={
            onSetPurchasePrice && cashOfferToSeller !== null
              ? { label: "Use as Purchase Price", onClick: () => onSetPurchasePrice(Math.max(0, cashOfferToSeller)) }
              : undefined
          }
        />

        <label className="input-wrap" style={{ gap: 4 }}>
          <div className="label">Wholesale Split % (assignment fee share)</div>
          <select className="field" value={investorSplitPct} onChange={(e) => setInvestorSplitPct(Number(e.target.value))}>
            {WHOLESALE_PCT_STEPS.map((p) => (
              <option key={p} value={p}>{Math.round(p * 100)}%</option>
            ))}
          </select>
        </label>

        <MetricRow
          label="Your Wholesale Assignment Fee"
          helper="What you earn when assigning the homeowner contract to the end investor."
          value={money(investorRow?.wholesaleFee ?? null)}
        />
        <MetricRow
          label="Assignment Price (End Investor → You)"
          helper="Cash offer to the homeowner + your assignment fee. This is what the end investor pays to take over the deal."
          value={money(investorRow?.investorSellPrice ?? null)}
          strong
        />
        <MetricRow
          label="End Investor's Projected Profit"
          helper="What the end investor may net after acquisition, rehab, holding, and retail resale costs."
          value={money(investorRow?.profit ?? null)}
          valueColor={signColor(investorRow?.profit ?? null)}
        />
        <MetricRow
          label="End Investor's Annualized Return"
          helper="Cash-on-cash return, scaled to a 12-month basis (months until sold, floored at 1). Lets you compare deals with different hold periods."
          value={pct(investorRow ? investorRow.annualizedCashOnCash : null)}
          valueColor={signColor(investorRow?.annualizedCashOnCash ?? null)}
        />
      </div>

      <CollapsibleCard title="Financing and Acquisition Costs (Detail)">
        <MetricRow
          label="Loan Amount"
          helper="(Purchase price x Purchase LTV %) + (rehab final cost x Rehab LTV %)."
          value={money(out.loanAmount)}
        />
        <MetricRow
          label="Financing Points"
          helper="Loan amount x points %. A one-time cost paid at closing, not a monthly cost."
          value={money(out.financingPoints)}
        />
        <MetricRow
          label="Acquisition Closing Costs"
          helper="Purchase price x acquisition closing cost %. Title, attorney, recording, and similar entry-side costs."
          value={money(out.acquisitionClosingCosts)}
        />
        <MetricRow
          label="Total Acquisition Costs"
          helper="Financing points + acquisition closing costs. Included in the end investor's cash-invested totals below."
          value={money(out.totalAcquisitionCosts)}
          strong
        />
      </CollapsibleCard>

      <CollapsibleCard title="Holding and Fees (Detail)">
        <MetricRow
          label={out.mortgageAutoApplied ? "Monthly Mortgage (Auto)" : "Monthly Mortgage"}
          helper={
            out.mortgageAutoApplied
              ? "Auto estimate: loan amount x interest rate ÷ 12 (interest-only). Leave blank for this; enter 0 for a genuinely all-cash deal."
              : out.monthlyMortgageUsed === 0
                ? "All-cash mode: loan amount, financed percentages, interest, and loan points are treated as zero."
                : "Entered monthly mortgage amount."
          }
          value={money(out.monthlyMortgageUsed)}
        />
        <MetricRow label="Holding / Month" helper="HOA/12 + insurance/12 + taxes/12 + resolved monthly mortgage + monthly other." value={money(out.holdingMonthly)} />
        <MetricRow label="Holding Total" helper="Holding / Month x months until sold." value={money(out.holdingTotal)} />
        <MetricRow label="Fees to Retail" helper="Retail commission + closing costs + seller retail expense + mansion tax." value={money(out.feesToRetail)} />
        <MetricRow label="Mansion Tax %" helper="Tiered rate based on adjusted ARV." value={pct(out.mansionTaxPct)} />
      </CollapsibleCard>

      <div className="section-card card" style={{ gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Offer Planning</div>
          <Link href="/formulas#offers" className="context-help">
            <span aria-hidden="true">?</span> How are these offer amounts calculated?
          </Link>
        </div>
        <div
          className="metric-tile"
          style={{
            display: "grid",
            gap: 6,
            borderColor: deal.dealType === recommendedDealType ? "var(--success-line)" : "var(--warning-line)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div className="label">Selected Deal Type</div>
              <div style={{ fontWeight: 900 }}>{deal.dealType}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="label">Recommended Deal Type</div>
              <div style={{ fontWeight: 900, color: "var(--primary)" }}>{recommendedDealType ?? "Needs inputs"}</div>
            </div>
          </div>
          <div className="muted" style={{ fontSize: 11 }}>
            Compares the Novation offer with the currently selected {Math.round(cashOfferPct * 100)}% cash offer and recommends the
            higher modeled seller offer{isNum(recommendationDifference) ? ` by ${money(recommendationDifference)}` : ""}. Consider
            timeline, condition, title, and execution risk before choosing.
          </div>
        </div>

        <details>
          <summary style={{ cursor: "pointer", fontSize: 11, color: "var(--text-muted)" }}>Show end-investor cost breakdown</summary>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            <div className="muted" style={{ fontSize: 11 }}>
              <strong>End-Investor Retail Resale Allowance</strong> applies later, when the end investor becomes the seller and
              resells the finished property to a retail buyer. It does not describe a cost paid to the original homeowner.
            </div>
            <MetricRow
              label="End Investor Project Costs (Wholesale Basis)"
              helper="Costs modeled for the investor buying the deal from you: rehab + holding + acquisition costs (points, closing) + retail commission + closing costs + mansion tax."
              value={money(buyerCostsExclSellerRetailExpense)}
            />
            <MetricRow
              label="End Investor All-In Project Costs (Offer Basis)"
              helper="End investor project costs + the later retail-resale allowance. Used to determine how much room remains for your homeowner offer."
              value={money(out.totalWalkawayCosts)}
            />
            <MetricRow
              label="End Investor Cost Before Assignment Fee"
              helper="Homeowner purchase price + end investor project costs. The assignment fee is added separately."
              value={money(out.wholesaleRows[0]?.totalCost ?? null)}
            />
          </div>
        </details>

        <MetricRow
          label="Cash Available for Homeowner Offer"
          helper="Adjusted ARV - all modeled end-investor project costs, before the homeowner purchase price and your assignment fee."
          value={money(out.totalWalkawayCash)}
          valueColor={signColor(out.totalWalkawayCash)}
          strong
        />

        <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
          ARV-based offers for a rehab-and-resell exit (distinct from the As-Is Novation offer above). Check a row to preview its
          buffer below; select <strong>Use</strong> to copy that row&apos;s amount into the Purchase Price field.
        </div>
        <div className="table-wrap" style={{ marginTop: 2 }}>
          <table className="table" style={{ minWidth: 380 }}>
            <thead>
              <tr>
                <th>% of Remaining Cash</th>
                <th>Offer Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {out.offerRanges.map((r) => {
                const isChecked = selectedPct === r.pct;
                return (
                  <tr key={r.pct} style={isChecked ? { background: "color-mix(in srgb, var(--primary) 10%, var(--surface))" } : undefined}>
                    <td style={{ fontWeight: 800 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                        <input type="checkbox" checked={isChecked} onChange={() => setSelectedPct((prev) => (prev === r.pct ? null : r.pct))} />
                        {Math.round(r.pct * 100)}%
                      </label>
                    </td>
                    <td style={{ fontWeight: 700, color: signColor(r.offer) }}>{money(r.offer)}</td>
                    <td>
                      {onSetPurchasePrice ? (
                        <button type="button" className="btn" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => onSetPurchasePrice(Math.max(0, r.offer))}>
                          Use
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

function CollapsibleCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="card">
      <summary style={{ cursor: "pointer", padding: 14, fontWeight: 900, listStyle: "revert" }}>{title}</summary>
      <div style={{ padding: "0 14px 14px", display: "grid", gap: 8 }}>{children}</div>
    </details>
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
    <div
      style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", gap: 10, alignItems: "center", minHeight: 26 }}
      title={helper}
      aria-label={helper ? `${label}: ${helper}` : undefined}
    >
      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
        {helper ? <span aria-hidden="true" style={{ marginLeft: 5, color: "var(--text-muted)", fontSize: 11, cursor: "help" }}>ⓘ</span> : null}
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

function RoleTile({ title, text }: { title: string; text: string }) {
  return (
    <div className="metric-tile">
      <div style={{ fontWeight: 800, marginBottom: 4 }}>{title}</div>
      <div className="muted" style={{ fontSize: 11, lineHeight: 1.45 }}>{text}</div>
    </div>
  );
}

"use client";

import type { WholesaleRow } from "@/lib/dealCalc";

const MIN_INVESTOR_CASH_ON_CASH = 0.12;

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function pct(n: number) {
  return (n * 100).toFixed(0) + "%";
}
function pct2(n: number) {
  const rounded = Math.round(n * 100);
  return rounded.toFixed(0) + "%";
}
function signColor(n: number) {
  return n < 0 ? "var(--danger-text)" : undefined;
}

export function WholesaleTable({ rows }: { rows: WholesaleRow[] }) {
  if (!rows.length) {
    return (
      <div className="section-card card" style={{ opacity: 0.75 }}>
        Enter comps and assumptions to generate wholesale ranges.
      </div>
    );
  }

  const recommendedRow = rows
    .filter(
      (row) =>
        row.pct > 0 &&
        row.wholesaleFee >= 0 &&
        row.cashOnCash >= MIN_INVESTOR_CASH_ON_CASH
    )
    .reduce<WholesaleRow | null>(
      (best, row) => (!best || row.wholesaleFee > best.wholesaleFee ? row : best),
      null
    );

  return (
    <div className="section-card card">
      <div style={{ fontWeight: 900 }}>Wholesale Assignment Table</div>
      <div className="metric-tile" style={{ display: "grid", gap: 5 }}>
        <div style={{ fontWeight: 800 }}>What does Wholesale % mean?</div>
        <div className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
          It is your share of the available deal spread—not a percentage of ARV or the homeowner purchase price.
          Available spread = Adjusted ARV − homeowner purchase price − end investor project costs. Your wholesale fee equals
          that spread × Wholesale %. For example, 75% means you receive 75% of the available spread as your assignment fee,
          while the end investor retains the remaining 25% as projected profit. For you, the spread shows how much fee the deal
          can support; for the investor, it shows the profit left after modeled costs. The highlighted row balances both by maximizing
          your fee while preserving at least a 12% projected investor cash-on-cash return.
        </div>
      </div>
      {!recommendedRow ? (
        <div className="status-badge status-warn" style={{ width: "fit-content" }}>
          No assignment row maintains the 12% minimum investor cash-on-cash target.
        </div>
      ) : null}

      <div className="table-wrap">
        <table className="table" style={{ minWidth: 920 }}>
          <thead>
            <tr>
              {[
                "Wholesale %",
                "Wholesale Fee",
                "Investor Sell Price",
                "All In",
                "Profit (ARV - All In)",
                "Cash-on-Cash",
                "Annualized CoC",
                "Out of Pocket",
              ].map((h) => (
                <th key={h} style={{ whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              const isRecommended = recommendedRow?.pct === r.pct;
              return (
              <tr
                key={r.pct}
                style={isRecommended ? { background: "color-mix(in srgb, var(--success-bg) 78%, var(--surface))" } : undefined}
              >
                <td style={{ fontWeight: 800, whiteSpace: "nowrap" }}>
                  <div>{r.pct === 0 ? "0% (No Assignment)" : pct(r.pct)}</div>
                  {isRecommended ? (
                    <div className="status-badge status-ok" style={{ display: "inline-block", marginTop: 5 }}>
                      Recommended Balance
                    </div>
                  ) : null}
                </td>
                <td>{money(r.wholesaleFee)}</td>
                <td style={{ fontWeight: 800 }}>{money(r.investorSellPrice)}</td>
                <td style={{ fontWeight: 800 }}>{money(r.allIn)}</td>
                <td style={{ fontWeight: 800, color: signColor(r.profit) }}>{money(r.profit)}</td>
                <td style={{ color: isRecommended ? "var(--success-text)" : signColor(r.cashOnCash), fontWeight: isRecommended ? 900 : undefined }}>
                  {pct2(r.cashOnCash)}
                </td>
                <td style={{ color: signColor(r.annualizedCashOnCash) }}>{pct2(r.annualizedCashOnCash)}</td>
                <td>{money(r.outOfPocket)}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 12 }} className="muted">
        The original homeowner receives the Purchase Price. You receive the Wholesale Fee as the assignment fee. The end investor
        pays the Investor Sell Price to take over the deal. The 0% row has no assignment fee at all — it&apos;s the baseline for buying
        and flipping the deal yourself with no wholesaler in between. Wholesale Fee = (ARV - Projected Buyer Total Costs) x Wholesale %.
        All In = Projected Buyer Total Costs + Wholesale Fee. Out of Pocket = purchase price + rehab + holding total + acquisition
        costs (points, closing costs) + wholesale fee — holding and acquisition costs are included because they are cash the investor
        pays directly, unlike retail commission/closing costs which settle out of sale proceeds. Annualized CoC scales Cash-on-Cash
        to a 12-month basis so deals with different hold periods can be compared. Red values mean that row loses money for the end
        investor. <strong>Recommended Balance</strong> highlights the row with the highest wholesale fee that still preserves at
        least a 12% projected cash-on-cash return for the end investor. The 0% baseline and negative assignment fees are excluded.
      </div>
    </div>
  );
}

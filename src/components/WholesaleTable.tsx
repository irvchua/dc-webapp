"use client";

import type { WholesaleRow } from "@/lib/dealCalc";

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

  return (
    <div className="section-card card">
      <div style={{ fontWeight: 900 }}>Wholesale Assignment Table</div>

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
                "Out of Pocket",
              ].map((h) => (
                <th key={h} style={{ whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.pct}>
                <td style={{ fontWeight: 800 }}>{pct(r.pct)}</td>
                <td>{money(r.wholesaleFee)}</td>
                <td style={{ fontWeight: 800 }}>{money(r.investorSellPrice)}</td>
                <td style={{ fontWeight: 800 }}>{money(r.allIn)}</td>
                <td style={{ fontWeight: 800, color: signColor(r.profit) }}>{money(r.profit)}</td>
                <td style={{ color: signColor(r.cashOnCash) }}>{pct2(r.cashOnCash)}</td>
                <td>{money(r.outOfPocket)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 12 }} className="muted">
        Wholesale Fee = (ARV - Projected Buyer Total Costs) x Wholesale %. All In = Projected Buyer Total Costs + Wholesale Fee.
        Out of Pocket = purchase price + rehab + holding total + wholesale fee (holding is included because it is cash the buyer
        pays over the hold period, unlike retail commission/closing costs which settle out of sale proceeds). Red values mean
        that row loses money for the end buyer.
      </div>
    </div>
  );
}

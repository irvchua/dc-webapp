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

export function WholesaleTable({ rows }: { rows: WholesaleRow[] }) {
  if (!rows.length) {
    return (
      <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 14, opacity: 0.75 }}>
        Enter comps and assumptions to generate wholesale ranges.
      </div>
    );
  }

  return (
    <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>Wholesale Assignment Table</div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
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
                <th
                  key={h}
                  style={{
                    padding: "8px 10px",
                    borderBottom: "1px solid #eee",
                    fontSize: 12,
                    opacity: 0.7,
                    whiteSpace: "nowrap",
                    textAlign: "left",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.pct}>
                <td style={{ padding: "8px 10px", fontWeight: 800 }}>{pct(r.pct)}</td>
                <td style={{ padding: "8px 10px" }}>{money(r.wholesaleFee)}</td>
                <td style={{ padding: "8px 10px", fontWeight: 800 }}>{money(r.investorSellPrice)}</td>
                <td style={{ padding: "8px 10px", fontWeight: 800 }}>{money(r.allIn)}</td>
                <td style={{ padding: "8px 10px", fontWeight: 800 }}>{money(r.profit)}</td>
                <td style={{ padding: "8px 10px" }}>{pct2(r.cashOnCash)}</td>
                <td style={{ padding: "8px 10px" }}>{money(r.outOfPocket)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        Wholesale Fee = (ARV - Projected Buyer Total Costs) x Wholesale %. All In = Projected Buyer Total Costs + Wholesale Fee.
      </div>
    </div>
  );
}



"use client";

import type { Comp } from "@/lib/dealCalc";

type Props = {
  title: string;
  comps: Comp[];
  agedDays: Array<number | null>;
  onChange: (next: Comp[]) => void;
};

export function CompTable({ title, comps, agedDays, onChange }: Props) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14, overflowX: "auto" }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>

      <table
        style={{
          width: "100%",
          minWidth: 1120,
          tableLayout: "fixed",
          borderCollapse: "separate",
          borderSpacing: "12px 8px",
        }}
      >
        <colgroup>
          {["24%", "10%", "9%", "10%", "9%", "12%", "10%", "14%", "7%"].map((w) => (
            <col key={w} style={{ width: w }} />
          ))}
        </colgroup>

        <thead>
          <tr>
            {["Address", "Bed/Bath", "Year Built", "Lot Size", "Sqft", "Price", "$ / Sqft", "Date", "Days"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  fontSize: 12,
                  opacity: 0.75,
                  padding: "0 2px 6px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {comps.map((c, idx) => {
            const ppsf = c.price && c.sqft && c.sqft > 0 ? c.price / c.sqft : null;
            return (
              <tr key={idx}>
                <td style={{ padding: 0 }}>
                  <input
                    value={c.address}
                    onChange={(e) => {
                      const next = comps.slice();
                      next[idx] = { ...next[idx], address: e.target.value };
                      onChange(next);
                    }}
                    style={{ width: "100%", minWidth: 0, padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, boxSizing: "border-box" }}
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <input
                    value={c.bedBath ?? ""}
                    onChange={(e) => {
                      const next = comps.slice();
                      next[idx] = { ...next[idx], bedBath: e.target.value };
                      onChange(next);
                    }}
                    placeholder="3/2"
                    style={{ width: "100%", minWidth: 0, padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, boxSizing: "border-box" }}
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={c.yearBuilt ?? ""}
                    onChange={(e) => {
                      const next = comps.slice();
                      next[idx] = { ...next[idx], yearBuilt: e.target.value === "" ? null : Number(e.target.value) };
                      onChange(next);
                    }}
                    placeholder="1998"
                    style={{ width: "100%", minWidth: 0, padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, boxSizing: "border-box" }}
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={c.lotSize ?? ""}
                    onChange={(e) => {
                      const next = comps.slice();
                      next[idx] = { ...next[idx], lotSize: e.target.value === "" ? null : Number(e.target.value) };
                      onChange(next);
                    }}
                    placeholder="5000"
                    style={{ width: "100%", minWidth: 0, padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, boxSizing: "border-box" }}
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={c.sqft ?? ""}
                    onChange={(e) => {
                      const next = comps.slice();
                      next[idx] = { ...next[idx], sqft: e.target.value === "" ? null : Number(e.target.value) };
                      onChange(next);
                    }}
                    style={{ width: "100%", minWidth: 0, padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, boxSizing: "border-box" }}
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <input
                    type="number"
                    inputMode="decimal"
                    step={1000}
                    value={c.price ?? ""}
                    onChange={(e) => {
                      const next = comps.slice();
                      next[idx] = { ...next[idx], price: e.target.value === "" ? null : Number(e.target.value) };
                      onChange(next);
                    }}
                    style={{ width: "100%", minWidth: 0, padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, boxSizing: "border-box" }}
                  />
                </td>
                <td style={{ padding: "0 2px", fontWeight: 600 }}>
                  {ppsf ? ppsf.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"}
                </td>
                <td style={{ padding: 0 }}>
                  <input
                    type="date"
                    value={c.date ?? ""}
                    onChange={(e) => {
                      const next = comps.slice();
                      next[idx] = { ...next[idx], date: e.target.value || null };
                      onChange(next);
                    }}
                    style={{
                      width: "100%",
                      minWidth: 125,      // make date input wider
                      padding: "10px 12px", // bigger click area
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      boxSizing: "border-box",
                    }}
                  />
                </td>
                <td style={{ padding: "0 2px 0 10px", opacity: 0.8 }}>{agedDays[idx] ?? "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}



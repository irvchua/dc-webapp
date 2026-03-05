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
    <div className="section-card card">
      <div style={{ fontWeight: 800 }}>{title}</div>

      <div className="table-wrap">
        <table className="table" style={{ minWidth: 1120, tableLayout: "fixed" }}>
          <colgroup>
            {["24%", "10%", "9%", "10%", "9%", "12%", "10%", "14%", "8%"].map((w) => (
              <col key={w} style={{ width: w }} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {["Address", "Bed/Bath", "Year Built", "Lot Size", "Sqft", "Price", "$ / Sqft", "Date", "Days"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {comps.map((c, idx) => {
              const ppsf = c.price && c.sqft && c.sqft > 0 ? c.price / c.sqft : null;
              return (
                <tr key={idx}>
                  <td>
                    <input
                      className="field"
                      value={c.address}
                      onChange={(e) => {
                        const next = comps.slice();
                        next[idx] = { ...next[idx], address: e.target.value };
                        onChange(next);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="field"
                      value={c.bedBath ?? ""}
                      onChange={(e) => {
                        const next = comps.slice();
                        next[idx] = { ...next[idx], bedBath: e.target.value };
                        onChange(next);
                      }}
                      placeholder="3/2"
                    />
                  </td>
                  <td>
                    <input
                      className="field"
                      type="number"
                      inputMode="numeric"
                      value={c.yearBuilt ?? ""}
                      onChange={(e) => {
                        const next = comps.slice();
                        next[idx] = { ...next[idx], yearBuilt: e.target.value === "" ? null : Number(e.target.value) };
                        onChange(next);
                      }}
                      placeholder="1998"
                    />
                  </td>
                  <td>
                    <input
                      className="field"
                      type="number"
                      inputMode="decimal"
                      value={c.lotSize ?? ""}
                      onChange={(e) => {
                        const next = comps.slice();
                        next[idx] = { ...next[idx], lotSize: e.target.value === "" ? null : Number(e.target.value) };
                        onChange(next);
                      }}
                      placeholder="5000"
                    />
                  </td>
                  <td>
                    <input
                      className="field"
                      type="number"
                      inputMode="decimal"
                      value={c.sqft ?? ""}
                      onChange={(e) => {
                        const next = comps.slice();
                        next[idx] = { ...next[idx], sqft: e.target.value === "" ? null : Number(e.target.value) };
                        onChange(next);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="field"
                      type="number"
                      inputMode="decimal"
                      step={1000}
                      value={c.price ?? ""}
                      onChange={(e) => {
                        const next = comps.slice();
                        next[idx] = { ...next[idx], price: e.target.value === "" ? null : Number(e.target.value) };
                        onChange(next);
                      }}
                    />
                  </td>
                  <td style={{ fontWeight: 700, color: "#1e3a8a" }}>{ppsf ? ppsf.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"}</td>
                  <td>
                    <input
                      className="field"
                      type="date"
                      value={c.date ?? ""}
                      onChange={(e) => {
                        const next = comps.slice();
                        next[idx] = { ...next[idx], date: e.target.value || null };
                        onChange(next);
                      }}
                      style={{ minWidth: 125, padding: "10px 5px" }}
                    />
                  </td>
                  <td className="muted" style={{ fontWeight: 700 }}>{agedDays[idx] ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

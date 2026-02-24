"use client";

import type { Comp } from "@/lib/dealCalc";
import { NumberInput } from "./NumberInput";

type Props = {
  title: string;
  comps: Comp[];
  onChange: (next: Comp[]) => void;
};

export function CompTable({ title, comps, onChange }: Props) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>

      <div style={{ display: "grid", gap: 10 }}>
        {comps.map((c, idx) => (
          <div
            key={idx}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              alignItems: "end",
            }}
          >
            <NumberInput
              label={`Comp ${idx + 1} sqft`}
              value={c.sqft ?? null}
              onChange={(v) => {
                const next = comps.slice();
                next[idx] = { ...next[idx], sqft: v };
                onChange(next);
              }}
            />
            <NumberInput
              label={`Comp ${idx + 1} price`}
              value={c.price ?? null}
              onChange={(v) => {
                const next = comps.slice();
                next[idx] = { ...next[idx], price: v };
                onChange(next);
              }}
              step={1000}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

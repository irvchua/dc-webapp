"use client";

type Props = {
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  step?: number;
};

export function NumberInput({ label, value, onChange, step = 1 }: Props) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <input
        inputMode="decimal"
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(null);
          const n = Number(raw);
          onChange(Number.isFinite(n) ? n : null);
        }}
        style={{
          padding: "10px 12px",
          border: "1px solid #ddd",
          borderRadius: 10,
        }}
      />
    </label>
  );
}

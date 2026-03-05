"use client";

type Props = {
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  step?: number;
};

export function NumberInput({ label, value, onChange, step = 1 }: Props) {
  return (
    <label className="input-wrap">
      <div className="label">{label}</div>
      <input
        className="field"
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
      />
    </label>
  );
}

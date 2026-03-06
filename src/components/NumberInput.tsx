"use client";

type Props = {
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  step?: number;
  placeholder?: string;
  zeroAsEmpty?: boolean;
};

export function NumberInput({ label, value, onChange, step = 1, placeholder, zeroAsEmpty = false }: Props) {
  const displayValue = zeroAsEmpty && (value === 0 || value === null || value === undefined) ? "" : (value ?? "");

  return (
    <label className="input-wrap">
      <div className="label">{label}</div>
      <input
        className="field"
        inputMode="decimal"
        type="number"
        step={step}
        value={displayValue}
        placeholder={placeholder}
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

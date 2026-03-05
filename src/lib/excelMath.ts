export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function IF<T>(condition: boolean, whenTrue: T, whenFalse: T): T {
  return condition ? whenTrue : whenFalse;
}

export function IFERROR<T>(value: T, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number" && !Number.isFinite(value)) return fallback;
  return value;
}

export function safeDivide(numerator: number, denominator: number): number | null {
  if (!isFiniteNumber(numerator) || !isFiniteNumber(denominator) || denominator === 0) return null;
  return numerator / denominator;
}

export function averageIfNonZero(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => isFiniteNumber(v) && v !== 0);
  if (!nums.length) return null;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

export function vlookup<T extends string | number, R>(
  key: T,
  rows: Array<{ key: T; value: R }>,
  fallback: R
): R {
  const hit = rows.find((row) => row.key === key);
  return hit ? hit.value : fallback;
}

export function xlookup<T extends string | number, R>(
  key: T,
  keys: T[],
  values: R[],
  fallback: R
): R {
  const idx = keys.findIndex((k) => k === key);
  if (idx < 0 || idx >= values.length) return fallback;
  return values[idx];
}

export function daysSince(dateValue: string | null | undefined, now = new Date()): number | null {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (!Number.isFinite(d.getTime())) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / msPerDay));
}

import type { DealInput } from "./dealCalc";

function safeUUID() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

export function makeDefaultDeal(partial?: Partial<DealInput>): DealInput {
  return {
    id: safeUUID(),
    propertyLabel: partial?.propertyLabel ?? "New Deal",
    subjectSqft: 1500,

    floodZone: false,
    doubleYellow: false,

    asIsSold: Array.from({ length: 5 }, () => ({ sqft: null, price: null })),
    asIsActive: Array.from({ length: 5 }, () => ({ sqft: null, price: null })),

    marketAdjustmentPct: 0.1,
    closingFeePct: 0.1,
    desiredProfit: 30000,

    arvSold: Array.from({ length: 5 }, () => ({ sqft: null, price: null })),
    arvActive: Array.from({ length: 5 }, () => ({ sqft: null, price: null })),

    inputARV: null,

    rehabType: "Partial Loss",
    damageType: "Light",

    monthsUntilSold: 4,
    annualHOA: 0,
    annualInsurance: 0,
    annualTaxes: 0,

    retailCommissionPct: 0.06,
    retailClosingCostsPct: 0.035,
    sellerRetailExpensePct: 0.07,

    ...partial,
  };
}

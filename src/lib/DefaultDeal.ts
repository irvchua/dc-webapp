import type { Comp, DealInput } from "./dealCalc";

function safeUUID() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

function makeBlankComp(): Comp {
  return {
    address: "",
    bedBath: "",
    yearBuilt: null,
    lotSize: null,
    sqft: null,
    price: null,
    date: null,
    floodZone: false,
  };
}

export function makeDefaultDeal(partial?: Partial<DealInput>): DealInput {
  return {
    id: safeUUID(),
    propertyLabel: partial?.propertyLabel ?? "New Deal",
    propertyAddress: "",
    ownerName: "",
    subjectSqft: 1500,
    lotSize: null,
    bedBath: "",
    floodZone: false,
    doubleYellow: false,

    asIsSold: Array.from({ length: 5 }, () => makeBlankComp()),
    asIsActive: Array.from({ length: 5 }, () => makeBlankComp()),
    arvSold: Array.from({ length: 5 }, () => makeBlankComp()),
    arvActive: Array.from({ length: 5 }, () => makeBlankComp()),

    marketAdjustmentPct: 0.1,
    novationClosingFeePct: 0.1,
    desiredProfit: 30000,

    inputArvOverride: null,

    rehabType: "Partial Loss",
    damageType: "Light",
    rehabCustomAmount: 0,

    monthsUntilSold: 4,
    annualHoa: 0,
    annualInsurance: 0,
    annualTaxes: 0,
    monthlyMortgage: 0,
    monthlyOtherHolding: 0,

    retailCommissionPct: 0.06,
    retailClosingCostsPct: 0.035,
    sellerRetailExpensePct: 0.07,

    purchasePrice: 50000,

    ...partial,
  };
}



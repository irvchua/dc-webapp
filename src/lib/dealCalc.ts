export type Comp = {
  sqft?: number | null;
  price?: number | null;
};

export type RehabType = "Partial Loss" | "Total Loss" | "New Construction";
export type DamageType = "Light" | "Moderate" | "Heavy";

export type DealInput = {
  id: string;
  propertyLabel: string;

  subjectSqft: number;

  // NEW: manual purchase price input (Excel D79)
  purchasePrice?: number | null;

  floodZone?: boolean;
  doubleYellow?: boolean;

  asIsSold: Comp[];
  asIsActive: Comp[];

  marketAdjustmentPct?: number;
  closingFeePct?: number;
  desiredProfit?: number;

  arvSold: Comp[];
  arvActive: Comp[];
  inputARV?: number | null;

  rehabType: RehabType;
  damageType: DamageType;

  monthsUntilSold?: number;
  annualHOA?: number;
  annualInsurance?: number;
  annualTaxes?: number;

  retailCommissionPct?: number;
  retailClosingCostsPct?: number;
  sellerRetailExpensePct?: number;
};

export type DealOutput = {
  // echo input for convenience
  purchasePrice: number | null;

  soldAsIsPpsf: number | null;
  activeAsIsPpsf: number | null;
  soldAsIsValue: number | null;
  activeAsIsValue: number | null;
  combinedAsIsValue: number | null;
  adjustedAsIsValue: number | null;
  maoNovation: number | null;

  soldArvPpsf: number | null;
  activeArvPpsf: number | null;
  soldArvValue: number | null;
  activeArvValue: number | null;
  combinedArvValue: number | null;
  usedArv: number | null;

  rehabBase: number | null;
  rehabDamage: number | null;
  floodDiscount: number | null;
  doubleYellowDiscount: number | null;
  rehabTotal: number | null;

  netArv: number | null;
  holdingMonthly: number | null;
  holdingTotal: number | null;

  retailCommission: number | null;
  retailClosingCosts: number | null;
  sellerRetailExpense: number | null;
  mansionTax: number | null;
  feesToRetail: number | null;

  flipMao: number | null;
  offerRanges: { pct: number; offer: number }[];
};

function validNum(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function ppsf(comps: Comp[]): number | null {
  const vals: number[] = [];
  for (const c of comps) {
    if (validNum(c.price) && validNum(c.sqft) && c.sqft > 0) {
      vals.push(c.price / c.sqft);
    }
  }
  return avg(vals);
}

function rehabCostPerSqft(t: RehabType): number {
  if (t === "Partial Loss") return 30;
  if (t === "Total Loss") return 131;
  return 200;
}

function damageMultiplier(d: DamageType): number {
  if (d === "Light") return 0;
  if (d === "Moderate") return 0.1;
  return 0.25;
}

// Mansion tax tiers (formerly "luxury fee")
function mansionTaxPct(netArv: number): number {
  if (netArv <= 1_000_000) return 0;
  if (netArv <= 2_000_000) return 0.01;
  if (netArv <= 2_500_000) return 0.02;
  if (netArv <= 3_000_000) return 0.025;
  if (netArv <= 3_500_000) return 0.03;
  return 0.035;
}

function combinedValue(a: number | null, b: number | null): number | null {
  if (validNum(a) && validNum(b)) return (a + b) / 2;
  if (validNum(a)) return a;
  if (validNum(b)) return b;
  return null;
}

export function calcDeal(input: DealInput): DealOutput {
  const marketAdj = validNum(input.marketAdjustmentPct) ? input.marketAdjustmentPct : 0.1;
  const closingFeePct = validNum(input.closingFeePct) ? input.closingFeePct : 0.1;
  const desiredProfit = validNum(input.desiredProfit) ? input.desiredProfit : 30000;

  const months = validNum(input.monthsUntilSold) ? input.monthsUntilSold : 4;
  const annualHOA = validNum(input.annualHOA) ? input.annualHOA : 0;
  const annualIns = validNum(input.annualInsurance) ? input.annualInsurance : 0;
  const annualTaxes = validNum(input.annualTaxes) ? input.annualTaxes : 0;

  const retailCommPct = validNum(input.retailCommissionPct) ? input.retailCommissionPct : 0.06;
  const retailClosePct = validNum(input.retailClosingCostsPct) ? input.retailClosingCostsPct : 0.035;
  const sellerExpensePct = validNum(input.sellerRetailExpensePct) ? input.sellerRetailExpensePct : 0.07;

  const purchasePrice = validNum(input.purchasePrice) ? input.purchasePrice : null;

  // AS-IS
  const soldAsIsPpsf = ppsf(input.asIsSold);
  const activeAsIsPpsf = ppsf(input.asIsActive);

  const soldAsIsValue = validNum(soldAsIsPpsf) ? soldAsIsPpsf * input.subjectSqft : null;
  const activeAsIsValue = validNum(activeAsIsPpsf) ? activeAsIsPpsf * input.subjectSqft : null;

  const combinedAsIsValue = combinedValue(soldAsIsValue, activeAsIsValue);
  const adjustedAsIsValue = validNum(combinedAsIsValue) ? combinedAsIsValue * (1 - marketAdj) : null;

  const maoNovation =
    validNum(adjustedAsIsValue)
      ? adjustedAsIsValue - adjustedAsIsValue * closingFeePct - desiredProfit
      : null;

  // ARV
  const soldArvPpsf = ppsf(input.arvSold);
  const activeArvPpsf = ppsf(input.arvActive);

  const soldArvValue = validNum(soldArvPpsf) ? soldArvPpsf * input.subjectSqft : null;
  const activeArvValue = validNum(activeArvPpsf) ? activeArvPpsf * input.subjectSqft : null;

  const combinedArvValue = combinedValue(soldArvValue, activeArvValue);

  const usedArv =
    validNum(input.inputARV as number)
      ? (input.inputARV as number)
      : validNum(combinedArvValue)
      ? combinedArvValue
      : null;

  // Rehab + discounts
  const rehabBase = validNum(usedArv) ? input.subjectSqft * rehabCostPerSqft(input.rehabType) : null;
  const rehabDamage = validNum(rehabBase) ? rehabBase * damageMultiplier(input.damageType) : null;

  const floodDiscount = validNum(usedArv) && input.floodZone ? usedArv * 0.15 : 0;
  const doubleYellowDiscount = validNum(usedArv) && input.doubleYellow ? usedArv * 0.05 : 0;

  const rehabTotal =
    validNum(rehabBase) && validNum(rehabDamage)
      ? rehabBase + rehabDamage + floodDiscount + doubleYellowDiscount
      : null;

  const netArv = validNum(usedArv) && validNum(rehabTotal) ? usedArv - rehabTotal : null;

  // Holding
  const holdingMonthly = (annualHOA + annualIns + annualTaxes) / 12;
  const holdingTotal = holdingMonthly * months;

  // Retail fees
  const retailCommission = validNum(netArv) ? netArv * retailCommPct : null;
  const retailClosingCosts = validNum(netArv) ? netArv * retailClosePct : null;
  const sellerRetailExpense = validNum(netArv) ? netArv * sellerExpensePct : null;
  const mansionTax = validNum(netArv) ? netArv * mansionTaxPct(netArv) : null;

  const feesToRetail =
    validNum(retailCommission) &&
    validNum(retailClosingCosts) &&
    validNum(sellerRetailExpense) &&
    validNum(mansionTax) &&
    validNum(netArv)
      ? retailCommission + retailClosingCosts + sellerRetailExpense + mansionTax + holdingTotal
      : null;

  const flipMao = validNum(netArv) && validNum(feesToRetail) ? netArv - feesToRetail : null;

  const pctSteps = [0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];
  const offerRanges = validNum(flipMao)
    ? pctSteps.map((p) => ({ pct: p, offer: p * flipMao }))
    : [];

  return {
    purchasePrice,

    soldAsIsPpsf,
    activeAsIsPpsf,
    soldAsIsValue,
    activeAsIsValue,
    combinedAsIsValue,
    adjustedAsIsValue,
    maoNovation,

    soldArvPpsf,
    activeArvPpsf,
    soldArvValue,
    activeArvValue,
    combinedArvValue,
    usedArv,

    rehabBase,
    rehabDamage,
    floodDiscount,
    doubleYellowDiscount,
    rehabTotal,

    netArv,
    holdingMonthly,
    holdingTotal,

    retailCommission,
    retailClosingCosts,
    sellerRetailExpense,
    mansionTax,
    feesToRetail,

    flipMao,
    offerRanges,
  };
}

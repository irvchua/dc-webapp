import {
  IF,
  averageIfNonZero,
  daysSince,
  isFiniteNumber,
  safeDivide,
  vlookup,
  xlookup,
} from "./excelMath";

export type RehabType = "Partial Loss" | "Total Loss" | "New Construction";
export type DamageType = "Light" | "Moderate" | "Heavy";

export type Comp = {
  address: string;
  bedBath: string;
  yearBuilt: number | null;
  lotSize: number | null;
  sqft: number | null;
  price: number | null;
  date: string | null;
  floodZone: boolean;
};

export type WholesaleRow = {
  pct: number;
  wholesaleFee: number;
  investorSellPrice: number;
  hardCosts: number;
  totalCost: number;
  allIn: number;
  profit: number;
  cashOnCash: number;
  outOfPocket: number;
};

export type DealInput = {
  id: string;
  propertyLabel: string;
  propertyAddress: string;
  ownerName: string;
  subjectSqft: number;
  lotSize: number | null;
  bedBath: string;
  floodZone: boolean;
  doubleYellow: boolean;

  asIsSold: Comp[];
  asIsActive: Comp[];
  arvSold: Comp[];
  arvActive: Comp[];

  marketAdjustmentPct: number;
  novationClosingFeePct: number;
  desiredProfit: number;

  inputArvOverride: number | null;

  rehabType: RehabType;
  damageType: DamageType;
  rehabCustomAmount: number;

  monthsUntilSold: number;
  annualHoa: number;
  annualInsurance: number;
  annualTaxes: number;
  monthlyMortgage: number | null;
  monthlyOtherHolding: number;

  retailCommissionPct: number;
  retailClosingCostsPct: number;
  sellerRetailExpensePct: number;

  purchasePrice: number;
  lastSavedAt?: string | null;
};

export type DealOutput = {
  isComplete: boolean;

  soldAsIsPpsf: number | null;
  activeAsIsPpsf: number | null;
  soldAsIsValue: number | null;
  activeAsIsValue: number | null;
  combinedAsIsValue: number | null;
  asIsFloodDiscount: number;
  asIsDoubleYellowDiscount: number;
  totalAsIsAdjustments: number;
  adjustedAsIsValue: number | null;
  maoNovation: number | null;

  soldArvPpsf: number | null;
  activeArvPpsf: number | null;
  soldArvValue: number | null;
  activeArvValue: number | null;
  combinedArvValue: number | null;
  arvBeforeAdjustments: number | null;

  rehabCostPerSqft: number;
  damageMultiplier: number;
  rehabBaseCost: number;
  rehabDamageCost: number;
  rehabCalculatedCost: number;
  rehabFinalCost: number;

  floodDiscount: number;
  doubleYellowDiscount: number;
  totalArvAdjustments: number;
  adjustedArv: number | null;

  hoaMonthly: number;
  insuranceMonthly: number;
  monthlyMortgageUsed: number;
  mortgageAutoApplied: boolean;
  holdingMonthly: number;
  holdingTotal: number;

  retailCommission: number | null;
  retailClosingCosts: number | null;
  sellerRetailExpense: number | null;
  mansionTaxPct: number;
  mansionTax: number | null;
  feesToRetail: number | null;

  totalWalkawayCosts: number | null;
  totalWalkawayCash: number | null;
  offerRanges: { pct: number; offer: number }[];

  wholesaleRows: WholesaleRow[];

  agedCompDays: {
    asIsSold: Array<number | null>;
    asIsActive: Array<number | null>;
    arvSold: Array<number | null>;
    arvActive: Array<number | null>;
  };
};

function avgCompPpsf(comps: Comp[], subjectFloodZone: boolean): number | null {
  const matchingFloodStatus = comps.filter((c) => c.floodZone === subjectFloodZone);
  const pool = matchingFloodStatus.length ? matchingFloodStatus : comps;

  const values = pool.map((c) => {
    if (!isFiniteNumber(c.price) || !isFiniteNumber(c.sqft) || c.sqft <= 0) return null;
    return safeDivide(c.price, c.sqft);
  });
  return averageIfNonZero(values);
}

const SOLD_WEIGHT = 0.7;
const ACTIVE_WEIGHT = 0.3;

function avgValue(sold: number | null, active: number | null): number | null {
  const soldValid = isFiniteNumber(sold) && sold > 0;
  const activeValid = isFiniteNumber(active) && active > 0;
  if (soldValid && activeValid) return sold * SOLD_WEIGHT + active * ACTIVE_WEIGHT;
  if (soldValid) return sold;
  if (activeValid) return active;
  return null;
}

function rehabTypeCostPerSqft(type: RehabType): number {
  return xlookup(type, ["Partial Loss", "Total Loss", "New Construction"], [30, 131, 200], 30);
}

function damageTypeMultiplier(type: DamageType): number {
  return vlookup(
    type,
    [
      { key: "Light", value: 0 },
      { key: "Moderate", value: 0.1 },
      { key: "Heavy", value: 0.25 },
    ],
    0
  );
}

function mansionTaxPct(arv: number): number {
  if (arv <= 1_000_000) return 0;
  if (arv <= 2_000_000) return 0.01;
  if (arv <= 2_500_000) return 0.02;
  if (arv <= 3_000_000) return 0.025;
  if (arv <= 3_500_000) return 0.03;
  return 0.035;
}

function makeWholesaleRows(params: {
  arv: number;
  purchasePrice: number;
  lastSavedAt?: string | null;
  rehabCost: number;
  holdingTotal: number;
  hardCosts: number;
}): WholesaleRow[] {
  const pctSteps = [0.1, 0.2, 0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75];

  const totalCost = params.purchasePrice + params.hardCosts;
  const feeBase = params.arv - totalCost;

  return pctSteps.map((pct) => {
    const wholesaleFee = feeBase * pct;
    const investorSellPrice = params.purchasePrice + wholesaleFee;
    const allIn = totalCost + wholesaleFee;
    const profit = params.arv - allIn;
    // Holding costs are cash the buyer pays out over the hold period (not settled from sale
    // proceeds like retail commission/closing costs are), so they belong in the cash-invested base.
    const outOfPocket = params.purchasePrice + params.rehabCost + params.holdingTotal + wholesaleFee;
    const cashOnCash = outOfPocket > 0 ? profit / outOfPocket : 0;

    return {
      pct,
      wholesaleFee,
      investorSellPrice,
      hardCosts: params.hardCosts,
      totalCost,
      allIn,
      profit,
      cashOnCash,
      outOfPocket,
    };
  });
}
function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function autoMonthlyMortgage(purchasePrice: number): number {
  return Math.max(0, toNumber(purchasePrice)) * 0.1 / 12;
}

export function calcDeal(input: DealInput, now = new Date()): DealOutput {
  const soldAsIsPpsf = avgCompPpsf(input.asIsSold, input.floodZone);
  const activeAsIsPpsf = avgCompPpsf(input.asIsActive, input.floodZone);

  const soldAsIsValue = isFiniteNumber(soldAsIsPpsf) ? soldAsIsPpsf * input.subjectSqft : null;
  const activeAsIsValue = isFiniteNumber(activeAsIsPpsf) ? activeAsIsPpsf * input.subjectSqft : null;

  const combinedAsIsValue = avgValue(soldAsIsValue, activeAsIsValue);

  const asIsFloodDiscount = isFiniteNumber(combinedAsIsValue) && input.floodZone
    ? combinedAsIsValue * 0.15
    : 0;
  const asIsDoubleYellowDiscount = isFiniteNumber(combinedAsIsValue) && input.doubleYellow
    ? combinedAsIsValue * 0.05
    : 0;
  const totalAsIsAdjustments = asIsFloodDiscount + asIsDoubleYellowDiscount;
  const adjustedCombinedAsIsValue = isFiniteNumber(combinedAsIsValue)
    ? combinedAsIsValue - totalAsIsAdjustments
    : null;

  const adjustedAsIsValue = isFiniteNumber(adjustedCombinedAsIsValue)
    ? adjustedCombinedAsIsValue * (1 - toNumber(input.marketAdjustmentPct, 0.1))
    : null;

  const maoNovation = isFiniteNumber(adjustedAsIsValue)
    ? adjustedAsIsValue - adjustedAsIsValue * toNumber(input.novationClosingFeePct, 0.1) - toNumber(input.desiredProfit, 30000)
    : null;

  const soldArvPpsf = avgCompPpsf(input.arvSold, input.floodZone);
  const activeArvPpsf = avgCompPpsf(input.arvActive, input.floodZone);

  const soldArvValue = isFiniteNumber(soldArvPpsf) ? soldArvPpsf * input.subjectSqft : null;
  const activeArvValue = isFiniteNumber(activeArvPpsf) ? activeArvPpsf * input.subjectSqft : null;
  const combinedArvValue = avgValue(soldArvValue, activeArvValue);

  const arvBeforeAdjustments = isFiniteNumber(input.inputArvOverride) && input.inputArvOverride > 0
    ? input.inputArvOverride
    : combinedArvValue;

  const rehabCostPerSqft = rehabTypeCostPerSqft(input.rehabType);
  const damageMultiplier = damageTypeMultiplier(input.damageType);
  const rehabBaseCost = Math.max(0, toNumber(input.subjectSqft)) * rehabCostPerSqft;
  const rehabDamageCost = rehabBaseCost * damageMultiplier;
  const rehabCalculatedCost = rehabBaseCost + rehabDamageCost;
  const rehabFinalCost = IF(toNumber(input.rehabCustomAmount) > 0, toNumber(input.rehabCustomAmount), rehabCalculatedCost);

  const floodDiscount = isFiniteNumber(arvBeforeAdjustments) && input.floodZone
    ? arvBeforeAdjustments * 0.15
    : 0;
  const doubleYellowDiscount = isFiniteNumber(arvBeforeAdjustments) && input.doubleYellow
    ? arvBeforeAdjustments * 0.05
    : 0;

  const totalArvAdjustments = floodDiscount + doubleYellowDiscount;
  const adjustedArv = isFiniteNumber(arvBeforeAdjustments) ? arvBeforeAdjustments - totalArvAdjustments : null;

  const hoaMonthly = toNumber(input.annualHoa) / 12;
  const insuranceMonthly = toNumber(input.annualInsurance) / 12;
  const taxesMonthly = toNumber(input.annualTaxes) / 12;
  const mortgageAutoApplied = input.monthlyMortgage === null;
  const monthlyMortgageUsed = mortgageAutoApplied
    ? autoMonthlyMortgage(input.purchasePrice)
    : Math.max(0, toNumber(input.monthlyMortgage));
  const holdingMonthly = hoaMonthly + insuranceMonthly + taxesMonthly + monthlyMortgageUsed + toNumber(input.monthlyOtherHolding);
  const holdingTotal = holdingMonthly * Math.max(0, toNumber(input.monthsUntilSold, 4));

  const retailCommission = isFiniteNumber(adjustedArv) ? adjustedArv * toNumber(input.retailCommissionPct, 0.06) : null;
  const retailClosingCosts = isFiniteNumber(adjustedArv) ? adjustedArv * toNumber(input.retailClosingCostsPct, 0.035) : null;
  const sellerRetailExpense = isFiniteNumber(adjustedArv) ? adjustedArv * toNumber(input.sellerRetailExpensePct, 0.07) : null;
  const mansionTaxPctValue = isFiniteNumber(adjustedArv) ? mansionTaxPct(adjustedArv) : 0;
  const mansionTax = isFiniteNumber(adjustedArv) ? adjustedArv * mansionTaxPctValue : null;

  const feesToRetail =
    isFiniteNumber(retailCommission) &&
    isFiniteNumber(retailClosingCosts) &&
    isFiniteNumber(sellerRetailExpense) &&
    isFiniteNumber(mansionTax)
      ? retailCommission + retailClosingCosts + sellerRetailExpense + mansionTax
      : null;

  const totalWalkawayCosts =
    isFiniteNumber(feesToRetail) ? feesToRetail + holdingTotal + rehabFinalCost : null;

  const totalWalkawayCash =
    isFiniteNumber(adjustedArv) && isFiniteNumber(totalWalkawayCosts)
      ? adjustedArv - totalWalkawayCosts
      : null;

  const offerSteps = [0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];
  const offerRanges = isFiniteNumber(totalWalkawayCash)
    ? offerSteps.map((pct) => ({ pct, offer: totalWalkawayCash * pct }))
    : [];

  const wholesaleRows =
    isFiniteNumber(adjustedArv)
      ? makeWholesaleRows({
          arv: adjustedArv,
          purchasePrice: toNumber(input.purchasePrice),
          rehabCost: rehabFinalCost,
          holdingTotal,
          hardCosts: rehabFinalCost + holdingTotal + (isFiniteNumber(feesToRetail) ? feesToRetail - (isFiniteNumber(sellerRetailExpense) ? sellerRetailExpense : 0) : 0),
        })
      : [];

  const agedCompDays = {
    asIsSold: input.asIsSold.map((c) => daysSince(c.date, now)),
    asIsActive: input.asIsActive.map((c) => daysSince(c.date, now)),
    arvSold: input.arvSold.map((c) => daysSince(c.date, now)),
    arvActive: input.arvActive.map((c) => daysSince(c.date, now)),
  };

  const isComplete =
    input.subjectSqft > 0 &&
    (isFiniteNumber(arvBeforeAdjustments) || input.arvSold.some((c) => isFiniteNumber(c.price)) || input.arvActive.some((c) => isFiniteNumber(c.price))) &&
    (isFiniteNumber(combinedAsIsValue) || input.asIsSold.some((c) => isFiniteNumber(c.price)) || input.asIsActive.some((c) => isFiniteNumber(c.price)));

  return {
    isComplete,

    soldAsIsPpsf,
    activeAsIsPpsf,
    soldAsIsValue,
    activeAsIsValue,
    combinedAsIsValue,
    asIsFloodDiscount,
    asIsDoubleYellowDiscount,
    totalAsIsAdjustments,
    adjustedAsIsValue,
    maoNovation,

    soldArvPpsf,
    activeArvPpsf,
    soldArvValue,
    activeArvValue,
    combinedArvValue,
    arvBeforeAdjustments,

    rehabCostPerSqft,
    damageMultiplier,
    rehabBaseCost,
    rehabDamageCost,
    rehabCalculatedCost,
    rehabFinalCost,

    floodDiscount,
    doubleYellowDiscount,
    totalArvAdjustments,
    adjustedArv,

    hoaMonthly,
    insuranceMonthly,
    monthlyMortgageUsed,
    mortgageAutoApplied,
    holdingMonthly,
    holdingTotal,

    retailCommission,
    retailClosingCosts,
    sellerRetailExpense,
    mansionTaxPct: mansionTaxPctValue,
    mansionTax,
    feesToRetail,

    totalWalkawayCosts,
    totalWalkawayCash,
    offerRanges,

    wholesaleRows,

    agedCompDays,
  };
}















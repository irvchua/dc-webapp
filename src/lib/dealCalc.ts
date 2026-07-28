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
export type DealType = "Novation" | "Cash";

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

export type CompConfidence = {
  validCount: number;
  totalCount: number;
  avgAgeDays: number | null;
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
  annualizedCashOnCash: number;
  outOfPocket: number;
};

export type DealInput = {
  id: string;
  propertyLabel: string;
  propertyAddress: string;
  ownerName: string;
  dealType: DealType;
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
  rehabContingencyPct: number;

  monthsUntilSold: number;
  annualHoa: number;
  annualInsurance: number;
  annualTaxes: number;
  monthlyMortgage: number | null;
  monthlyOtherHolding: number;

  financePurchaseLtvPct: number;
  financeRehabLtvPct: number;
  interestRatePct: number;
  pointsPct: number;
  acquisitionClosingCostPct: number;

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
  rehabBeforeContingency: number;
  rehabContingency: number;
  rehabFinalCost: number;

  floodDiscount: number;
  doubleYellowDiscount: number;
  totalArvAdjustments: number;
  adjustedArv: number | null;

  financePurchaseLtvPct: number;
  financeRehabLtvPct: number;
  loanAmount: number;
  financingPoints: number;
  acquisitionClosingCosts: number;
  totalAcquisitionCosts: number;

  hoaMonthly: number;
  insuranceMonthly: number;
  monthlyMortgageUsed: number;
  mortgageAutoApplied: boolean;
  holdingMonthly: number;
  holdingTotal: number;
  monthsUntilSold: number;

  retailCommission: number | null;
  retailClosingCosts: number | null;
  sellerRetailExpense: number | null;
  mansionTaxPct: number;
  mansionTax: number | null;
  feesToRetail: number | null;

  totalWalkawayCosts: number | null;
  totalWalkawayCash: number | null;
  offerRanges: { pct: number; offer: number }[];
  cashOffer70: number | null;
  recommendedDealType: DealType | null;
  recommendationDifference: number | null;

  wholesaleRows: WholesaleRow[];

  compConfidence: {
    asIsSold: CompConfidence;
    asIsActive: CompConfidence;
    arvSold: CompConfidence;
    arvActive: CompConfidence;
  };

  agedCompDays: {
    asIsSold: Array<number | null>;
    asIsActive: Array<number | null>;
    arvSold: Array<number | null>;
    arvActive: Array<number | null>;
  };
};

function matchFloodPool(comps: Comp[], subjectFloodZone: boolean): Comp[] {
  const matching = comps.filter((c) => c.floodZone === subjectFloodZone);
  return matching.length ? matching : comps;
}

function avgCompPpsf(comps: Comp[], subjectFloodZone: boolean): number | null {
  const pool = matchFloodPool(comps, subjectFloodZone);
  const values = pool.map((c) => {
    if (!isFiniteNumber(c.price) || !isFiniteNumber(c.sqft) || c.sqft <= 0) return null;
    return safeDivide(c.price, c.sqft);
  });
  return averageIfNonZero(values);
}

function compConfidenceFor(comps: Comp[], subjectFloodZone: boolean, now: Date): CompConfidence {
  const pool = matchFloodPool(comps, subjectFloodZone);
  const valid = pool.filter((c) => isFiniteNumber(c.price) && isFiniteNumber(c.sqft) && (c.sqft as number) > 0);
  const ages = valid.map((c) => daysSince(c.date, now)).filter((n): n is number => n !== null);
  const avgAgeDays = ages.length ? Math.round(ages.reduce((sum, n) => sum + n, 0) / ages.length) : null;
  return { validCount: valid.length, totalCount: comps.length, avgAgeDays };
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

// 0 represents a principal flip with no wholesale assignment fee at all.
export const WHOLESALE_PCT_STEPS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75];
export const ARV_OFFER_STEPS = [0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];

type WholesaleRowParams = {
  arv: number;
  purchasePrice: number;
  rehabCost: number;
  financePurchaseLtvPct: number;
  financeRehabLtvPct: number;
  holdingTotal: number;
  acquisitionCosts: number;
  hardCosts: number;
  monthsUntilSold: number;
};

function wholesaleRowForPct(params: WholesaleRowParams, pct: number): WholesaleRow {
  const totalCost = params.purchasePrice + params.hardCosts;
  const feeBase = params.arv - totalCost;
  const wholesaleFee = feeBase * pct;
  const investorSellPrice = params.purchasePrice + wholesaleFee;
  const allIn = totalCost + wholesaleFee;
  const profit = params.arv - allIn;
  const purchaseEquity =
    Math.max(0, params.purchasePrice) *
    (1 - Math.min(1, Math.max(0, params.financePurchaseLtvPct)));
  const rehabEquity =
    Math.max(0, params.rehabCost) *
    (1 - Math.min(1, Math.max(0, params.financeRehabLtvPct)));
  const outOfPocket =
    purchaseEquity +
    rehabEquity +
    params.holdingTotal +
    params.acquisitionCosts +
    wholesaleFee;
  const cashOnCash = outOfPocket > 0 ? profit / outOfPocket : 0;
  // Floored at 1 month so very short holds don't produce meaningless four-digit annualized figures.
  const annualizedCashOnCash = cashOnCash * (12 / Math.max(1, params.monthsUntilSold));

  return {
    pct,
    wholesaleFee,
    investorSellPrice,
    hardCosts: params.hardCosts,
    totalCost,
    allIn,
    profit,
    cashOnCash,
    annualizedCashOnCash,
    outOfPocket,
  };
}

export function makeWholesaleRows(params: WholesaleRowParams): WholesaleRow[] {
  return WHOLESALE_PCT_STEPS.map((pct) => wholesaleRowForPct(params, pct));
}

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function loanAmountFor(params: {
  purchasePrice: number;
  rehabCost: number;
  financePurchaseLtvPct: number;
  financeRehabLtvPct: number;
}): number {
  return (
    Math.max(0, toNumber(params.purchasePrice)) * Math.max(0, toNumber(params.financePurchaseLtvPct, 0.9)) +
    Math.max(0, toNumber(params.rehabCost)) * Math.max(0, toNumber(params.financeRehabLtvPct, 1))
  );
}

export function autoMonthlyMortgage(params: {
  purchasePrice: number;
  rehabCost: number;
  financePurchaseLtvPct: number;
  financeRehabLtvPct: number;
  interestRatePct: number;
}): number {
  const loanAmount = loanAmountFor(params);
  return (loanAmount * Math.max(0, toNumber(params.interestRatePct, 0.1))) / 12;
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
  const rehabBeforeContingency = IF(toNumber(input.rehabCustomAmount) > 0, toNumber(input.rehabCustomAmount), rehabCalculatedCost);
  const rehabContingency = rehabBeforeContingency * Math.max(0, toNumber(input.rehabContingencyPct, 0.1));
  const rehabFinalCost = rehabBeforeContingency + rehabContingency;

  const floodDiscount = isFiniteNumber(arvBeforeAdjustments) && input.floodZone
    ? arvBeforeAdjustments * 0.15
    : 0;
  const doubleYellowDiscount = isFiniteNumber(arvBeforeAdjustments) && input.doubleYellow
    ? arvBeforeAdjustments * 0.05
    : 0;

  const totalArvAdjustments = floodDiscount + doubleYellowDiscount;
  const adjustedArv = isFiniteNumber(arvBeforeAdjustments) ? arvBeforeAdjustments - totalArvAdjustments : null;

  const isExplicitAllCash = input.monthlyMortgage === 0;
  const effectivePurchaseLtvPct = isExplicitAllCash ? 0 : input.financePurchaseLtvPct;
  const effectiveRehabLtvPct = isExplicitAllCash ? 0 : input.financeRehabLtvPct;
  const loanAmount = loanAmountFor({
    purchasePrice: input.purchasePrice,
    rehabCost: rehabFinalCost,
    financePurchaseLtvPct: effectivePurchaseLtvPct,
    financeRehabLtvPct: effectiveRehabLtvPct,
  });
  const financingPoints = loanAmount * Math.max(0, toNumber(input.pointsPct, 0.02));

  const hoaMonthly = toNumber(input.annualHoa) / 12;
  const insuranceMonthly = toNumber(input.annualInsurance) / 12;
  const taxesMonthly = toNumber(input.annualTaxes) / 12;
  const mortgageAutoApplied = input.monthlyMortgage === null;
  const monthlyMortgageUsed = mortgageAutoApplied
    ? (loanAmount * Math.max(0, toNumber(input.interestRatePct, 0.1))) / 12
    : Math.max(0, toNumber(input.monthlyMortgage));
  const holdingMonthly = hoaMonthly + insuranceMonthly + taxesMonthly + monthlyMortgageUsed + toNumber(input.monthlyOtherHolding);
  const monthsUntilSold = Math.max(0, toNumber(input.monthsUntilSold, 4));
  const holdingTotal = holdingMonthly * monthsUntilSold;

  const acquisitionClosingCosts = Math.max(0, toNumber(input.purchasePrice)) * Math.max(0, toNumber(input.acquisitionClosingCostPct, 0.02));
  const totalAcquisitionCosts = acquisitionClosingCosts + financingPoints;

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
    isFiniteNumber(feesToRetail) ? feesToRetail + holdingTotal + rehabFinalCost + totalAcquisitionCosts : null;

  const totalWalkawayCash =
    isFiniteNumber(adjustedArv) && isFiniteNumber(totalWalkawayCosts)
      ? adjustedArv - totalWalkawayCosts
      : null;

  const offerRanges = isFiniteNumber(totalWalkawayCash)
    ? ARV_OFFER_STEPS.map((pct) => ({ pct, offer: totalWalkawayCash * pct }))
    : [];
  const cashOffer70 = offerRanges.find((range) => range.pct === 0.7)?.offer ?? null;
  const recommendedDealType: DealType | null =
    isFiniteNumber(maoNovation) && isFiniteNumber(cashOffer70)
      ? maoNovation >= cashOffer70 ? "Novation" : "Cash"
      : isFiniteNumber(maoNovation)
        ? "Novation"
        : isFiniteNumber(cashOffer70)
          ? "Cash"
          : null;
  const recommendationDifference =
    isFiniteNumber(maoNovation) && isFiniteNumber(cashOffer70)
      ? Math.abs(maoNovation - cashOffer70)
      : null;

  const wholesaleRows =
    isFiniteNumber(adjustedArv)
      ? makeWholesaleRows({
          arv: adjustedArv,
          purchasePrice: toNumber(input.purchasePrice),
          rehabCost: rehabFinalCost,
          financePurchaseLtvPct: effectivePurchaseLtvPct,
          financeRehabLtvPct: effectiveRehabLtvPct,
          holdingTotal,
          acquisitionCosts: totalAcquisitionCosts,
          hardCosts: rehabFinalCost + holdingTotal + totalAcquisitionCosts + (isFiniteNumber(feesToRetail) ? feesToRetail - (isFiniteNumber(sellerRetailExpense) ? sellerRetailExpense : 0) : 0),
          monthsUntilSold,
        })
      : [];

  const compConfidence = {
    asIsSold: compConfidenceFor(input.asIsSold, input.floodZone, now),
    asIsActive: compConfidenceFor(input.asIsActive, input.floodZone, now),
    arvSold: compConfidenceFor(input.arvSold, input.floodZone, now),
    arvActive: compConfidenceFor(input.arvActive, input.floodZone, now),
  };

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
    rehabBeforeContingency,
    rehabContingency,
    rehabFinalCost,

    floodDiscount,
    doubleYellowDiscount,
    totalArvAdjustments,
    adjustedArv,

    financePurchaseLtvPct: effectivePurchaseLtvPct,
    financeRehabLtvPct: effectiveRehabLtvPct,
    loanAmount,
    financingPoints,
    acquisitionClosingCosts,
    totalAcquisitionCosts,

    hoaMonthly,
    insuranceMonthly,
    monthlyMortgageUsed,
    mortgageAutoApplied,
    holdingMonthly,
    holdingTotal,
    monthsUntilSold,

    retailCommission,
    retailClosingCosts,
    sellerRetailExpense,
    mansionTaxPct: mansionTaxPctValue,
    mansionTax,
    feesToRetail,

    totalWalkawayCosts,
    totalWalkawayCash,
    offerRanges,
    cashOffer70,
    recommendedDealType,
    recommendationDifference,

    wholesaleRows,

    compConfidence,

    agedCompDays,
  };
}

export function calcCashOfferScenario(
  input: DealInput,
  offerPct: number,
  now = new Date()
): { offer: number | null; output: DealOutput } {
  const pct = Math.min(1, Math.max(0, toNumber(offerPct)));
  let candidatePrice = 0;
  let output = calcDeal({ ...input, purchasePrice: candidatePrice }, now);

  for (let iteration = 0; iteration < 100; iteration += 1) {
    if (!isFiniteNumber(output.totalWalkawayCash)) return { offer: null, output };

    const offer = output.totalWalkawayCash * pct;
    const nextPrice = Math.max(0, offer);

    if (Math.abs(nextPrice - candidatePrice) < 0.01) {
      const finalOutput = calcDeal({ ...input, purchasePrice: nextPrice }, now);
      return {
        offer: isFiniteNumber(finalOutput.totalWalkawayCash)
          ? finalOutput.totalWalkawayCash * pct
          : null,
        output: finalOutput,
      };
    }

    candidatePrice = nextPrice;
    output = calcDeal({ ...input, purchasePrice: candidatePrice }, now);
  }

  return {
    offer: isFiniteNumber(output.totalWalkawayCash)
      ? output.totalWalkawayCash * pct
      : null,
    output,
  };
}

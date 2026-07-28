import assert from "node:assert/strict";
import test from "node:test";
import { calcCashOfferScenario, calcDeal, makeWholesaleRows } from "../src/lib/dealCalc";
import { makeDefaultDeal } from "../src/lib/DefaultDeal";

test("an explicit zero mortgage remains an all-cash deal", () => {
  const deal = makeDefaultDeal({
    purchasePrice: 400_000,
    inputArvOverride: 1_000_000,
    monthlyMortgage: 0,
    monthsUntilSold: 4,
  });

  const output = calcDeal(deal);

  assert.equal(output.mortgageAutoApplied, false);
  assert.equal(output.monthlyMortgageUsed, 0);
  assert.equal(output.financePurchaseLtvPct, 0);
  assert.equal(output.financeRehabLtvPct, 0);
  assert.equal(output.loanAmount, 0);
  assert.equal(output.financingPoints, 0);
  assert.equal(output.holdingTotal, 0);
  assert.equal(
    output.wholesaleRows[0]?.outOfPocket,
    deal.purchasePrice + output.rehabFinalCost + output.acquisitionClosingCosts
  );
});

test("a null mortgage uses the disclosed automatic estimate", () => {
  const deal = makeDefaultDeal({
    purchasePrice: 400_000,
    monthlyMortgage: null,
    monthsUntilSold: 4,
  });

  const output = calcDeal(deal);
  const expectedMonthlyMortgage = (
    deal.purchasePrice * deal.financePurchaseLtvPct +
    output.rehabFinalCost * deal.financeRehabLtvPct
  ) * deal.interestRatePct / 12;

  assert.equal(output.mortgageAutoApplied, true);
  assert.equal(output.monthlyMortgageUsed, expectedMonthlyMortgage);
  assert.equal(output.holdingTotal, expectedMonthlyMortgage * 4);
});

test("a negative mortgage is clamped to zero instead of triggering auto", () => {
  const output = calcDeal(makeDefaultDeal({
    purchasePrice: 400_000,
    monthlyMortgage: -500,
  }));

  assert.equal(output.mortgageAutoApplied, false);
  assert.equal(output.monthlyMortgageUsed, 0);
});

test("wholesale cash-on-cash uses only unfinanced purchase and rehab equity", () => {
  const [baseline] = makeWholesaleRows({
    arv: 300_000,
    purchasePrice: 100_000,
    rehabCost: 50_000,
    financePurchaseLtvPct: 0.9,
    financeRehabLtvPct: 1,
    holdingTotal: 10_000,
    acquisitionCosts: 5_000,
    hardCosts: 65_000,
    monthsUntilSold: 6,
  });

  assert.equal(baseline.outOfPocket, 25_000);
  assert.equal(baseline.profit, 135_000);
  assert.equal(baseline.cashOnCash, 135_000 / 25_000);
});

test("candidate cash offer is independent of the existing purchase price and stabilizes", () => {
  const comp = {
    address: "",
    bedBath: "",
    yearBuilt: null,
    lotSize: null,
    sqft: 1_500,
    price: 300_000,
    date: null,
    floodZone: false,
  };
  const deal = makeDefaultDeal({
    subjectSqft: 1_500,
    asIsSold: [comp],
    arvSold: [comp],
    monthlyMortgage: null,
  });

  const lowExistingPrice = calcCashOfferScenario(
    { ...deal, purchasePrice: 50_000 },
    0.7
  );
  const highExistingPrice = calcCashOfferScenario(
    { ...deal, purchasePrice: 200_000 },
    0.7
  );

  assert.ok(lowExistingPrice.offer !== null);
  assert.ok(highExistingPrice.offer !== null);
  assert.ok(Math.abs(lowExistingPrice.offer - highExistingPrice.offer) < 0.01);

  const recalculated = calcDeal({
    ...deal,
    purchasePrice: lowExistingPrice.offer,
  });
  assert.ok(recalculated.totalWalkawayCash !== null);
  assert.ok(
    Math.abs(lowExistingPrice.offer - recalculated.totalWalkawayCash * 0.7) < 0.01
  );
});

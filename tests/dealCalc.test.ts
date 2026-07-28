import assert from "node:assert/strict";
import test from "node:test";
import { calcDeal } from "../src/lib/dealCalc";
import { makeDefaultDeal } from "../src/lib/DefaultDeal";

test("an explicit zero mortgage remains an all-cash deal", () => {
  const deal = makeDefaultDeal({
    purchasePrice: 400_000,
    monthlyMortgage: 0,
    monthsUntilSold: 4,
  });

  const output = calcDeal(deal);

  assert.equal(output.mortgageAutoApplied, false);
  assert.equal(output.monthlyMortgageUsed, 0);
  assert.equal(output.holdingTotal, 0);
});

test("a null mortgage uses the disclosed automatic estimate", () => {
  const deal = makeDefaultDeal({
    purchasePrice: 400_000,
    monthlyMortgage: null,
    monthsUntilSold: 4,
  });

  const output = calcDeal(deal);

  assert.equal(output.mortgageAutoApplied, true);
  assert.equal(output.monthlyMortgageUsed, 400_000 * 0.1 / 12);
  assert.equal(output.holdingTotal, 400_000 * 0.1 / 12 * 4);
});

test("a negative mortgage is clamped to zero instead of triggering auto", () => {
  const output = calcDeal(makeDefaultDeal({
    purchasePrice: 400_000,
    monthlyMortgage: -500,
  }));

  assert.equal(output.mortgageAutoApplied, false);
  assert.equal(output.monthlyMortgageUsed, 0);
});

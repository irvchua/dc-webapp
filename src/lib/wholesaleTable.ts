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

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

export function buildWholesaleTable(params: {
  flipMao: number | null; // purchase price
  arv: number | null;
  hardCosts: number;
  pctSteps?: number[];
}): WholesaleRow[] {
  const { flipMao, arv, hardCosts } = params;
  const pctSteps =
    params.pctSteps ??
    [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7];

  if (!isFiniteNumber(flipMao) || flipMao <= 0) return [];
  if (!isFiniteNumber(arv) || arv <= 0) return [];

  const investorSellPrice = flipMao; // You stated purchase price = flipMao
  const totalCost = investorSellPrice + hardCosts;

  // Base gap used for fee multipliers
  const wholesaleFeeBase = totalCost - arv;

  return pctSteps.map((p) => {
    const wholesaleFee = wholesaleFeeBase * p;

    const allIn = totalCost + wholesaleFee;

    const profit = arv - allIn;
    const outOfPocket = allIn;
    const cashOnCash = outOfPocket > 0 ? profit / outOfPocket : 0;

    return {
      pct: p,
      wholesaleFee,
      investorSellPrice,
      hardCosts,
      totalCost,
      allIn,
      profit,
      cashOnCash,
      outOfPocket,
    };
  });
}

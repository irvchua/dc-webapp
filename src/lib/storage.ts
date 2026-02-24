import type { DealInput } from "./dealCalc";

const KEY = "dc_webapp_deals_v1";

export function loadDeals(): DealInput[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DealInput[];
  } catch {
    return [];
  }
}

export function saveDeals(deals: DealInput[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(deals));
}

export function upsertDeal(deal: DealInput) {
  const deals = loadDeals();
  const idx = deals.findIndex((d) => d.id === deal.id);
  if (idx >= 0) deals[idx] = deal;
  else deals.unshift(deal);
  saveDeals(deals);
}

export function deleteDeal(id: string) {
  const deals = loadDeals().filter((d) => d.id !== id);
  saveDeals(deals);
}

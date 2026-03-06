import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { makeDefaultDeal } from "./DefaultDeal";
import type { Comp, DealInput } from "./dealCalc";
import { getFirestoreOrNull } from "./firebase";
import { getCurrentUserId } from "./firebaseAuth";

type StoredV2 = {
  version: 2;
  deals: DealInput[];
};

const KEY = "dc_webapp_deals_v2";
const LEGACY_KEYS = ["dc_webapp_deals_v1"];

function safeUUID() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function mapLegacyComp(rawValue: unknown): Comp {
  const raw = asRecord(rawValue);
  return {
    address: typeof raw.address === "string" ? raw.address : "",
    bedBath: typeof raw.bedBath === "string" ? raw.bedBath : "",
    yearBuilt: Number.isFinite(raw.yearBuilt) ? Number(raw.yearBuilt) : null,
    lotSize: Number.isFinite(raw.lotSize) ? Number(raw.lotSize) : null,
    sqft: Number.isFinite(raw.sqft) ? Number(raw.sqft) : null,
    price: Number.isFinite(raw.price) ? Number(raw.price) : null,
    date: typeof raw.date === "string" ? raw.date : null,
    floodZone: !!raw.floodZone,
  };
}

function mapCompArray(rawValue: unknown): Comp[] {
  const arr = Array.isArray(rawValue) ? rawValue : [];
  const mapped = arr.map(mapLegacyComp).slice(0, 5);
  while (mapped.length < 5) mapped.push(mapLegacyComp({}));
  return mapped;
}

function migrateLegacyDeal(rawValue: unknown): DealInput {
  const raw = asRecord(rawValue);
  const base = makeDefaultDeal();

  return {
    ...base,
    id: typeof raw.id === "string" ? raw.id : safeUUID(),
    propertyLabel: typeof raw.propertyLabel === "string" ? raw.propertyLabel : base.propertyLabel,
    propertyAddress:
      typeof raw.propertyAddress === "string"
        ? raw.propertyAddress
        : typeof raw.propertyLabel === "string"
        ? raw.propertyLabel
        : "",
    ownerName: typeof raw.ownerName === "string" ? raw.ownerName : "",
    subjectSqft: toNumber(raw.subjectSqft, base.subjectSqft),
    lotSize: Number.isFinite(raw.lotSize) ? Number(raw.lotSize) : null,
    bedBath: typeof raw.bedBath === "string" ? raw.bedBath : "",
    floodZone: !!raw.floodZone,
    doubleYellow: !!raw.doubleYellow,

    asIsSold: mapCompArray(raw.asIsSold),
    asIsActive: mapCompArray(raw.asIsActive),
    arvSold: mapCompArray(raw.arvSold),
    arvActive: mapCompArray(raw.arvActive),

    marketAdjustmentPct: toNumber(raw.marketAdjustmentPct, base.marketAdjustmentPct),
    novationClosingFeePct: toNumber(raw.novationClosingFeePct ?? raw.closingFeePct, base.novationClosingFeePct),
    desiredProfit: toNumber(raw.desiredProfit, base.desiredProfit),

    inputArvOverride: Number.isFinite(raw.inputArvOverride)
      ? Number(raw.inputArvOverride)
      : Number.isFinite(raw.inputARV)
      ? Number(raw.inputARV)
      : null,

    rehabType:
      raw.rehabType === "Partial Loss" || raw.rehabType === "Total Loss" || raw.rehabType === "New Construction"
        ? raw.rehabType
        : base.rehabType,
    damageType: raw.damageType === "Light" || raw.damageType === "Moderate" || raw.damageType === "Heavy" ? raw.damageType : base.damageType,
    rehabCustomAmount: toNumber(raw.rehabCustomAmount, 0),

    monthsUntilSold: toNumber(raw.monthsUntilSold, base.monthsUntilSold),
    annualHoa: toNumber(raw.annualHoa ?? raw.annualHOA, base.annualHoa),
    annualInsurance: toNumber(raw.annualInsurance, base.annualInsurance),
    annualTaxes: toNumber(raw.annualTaxes, base.annualTaxes),
    monthlyMortgage: toNumber(raw.monthlyMortgage, 0),
    monthlyOtherHolding: toNumber(raw.monthlyOtherHolding, 0),

    retailCommissionPct: toNumber(raw.retailCommissionPct, base.retailCommissionPct),
    retailClosingCostsPct: toNumber(raw.retailClosingCostsPct, base.retailClosingCostsPct),
    sellerRetailExpensePct: toNumber(raw.sellerRetailExpensePct, base.sellerRetailExpensePct),

    purchasePrice: toNumber(raw.purchasePrice, base.purchasePrice),
    lastSavedAt: typeof raw.lastSavedAt === "string" ? raw.lastSavedAt : null,
  };
}

function persistLocal(deals: DealInput[]) {
  const payload: StoredV2 = { version: 2, deals };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

function loadLocalDeals(): DealInput[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredV2;
      if (parsed?.version === 2 && Array.isArray(parsed.deals)) return parsed.deals.map(migrateLegacyDeal);
    }

    for (const legacyKey of LEGACY_KEYS) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (!legacyRaw) continue;

      const legacyParsed = JSON.parse(legacyRaw) as unknown;
      const legacyObject = asRecord(legacyParsed);
      const legacyDeals = Array.isArray(legacyParsed)
        ? legacyParsed
        : Array.isArray(legacyObject.deals)
        ? legacyObject.deals
        : null;

      if (!legacyDeals) continue;

      const migrated = legacyDeals.map(migrateLegacyDeal);
      persistLocal(migrated);
      return migrated;
    }

    return [];
  } catch {
    return [];
  }
}

function upsertLocalDeal(deal: DealInput) {
  const localDeals = loadLocalDeals();
  const idx = localDeals.findIndex((d) => d.id === deal.id);
  if (idx >= 0) localDeals[idx] = deal;
  else localDeals.unshift(deal);
  persistLocal(localDeals);
}

function userDealsCollection(uid: string) {
  const db = getFirestoreOrNull();
  if (!db) return null;
  return collection(db, "users", uid, "deals");
}

export async function loadDeals(): Promise<DealInput[]> {
  if (typeof window === "undefined") return [];

  const uid = await getCurrentUserId();
  if (!uid) return loadLocalDeals();

  const dealsRef = userDealsCollection(uid);
  if (!dealsRef) return loadLocalDeals();

  try {
    const snapshot = await getDocs(query(dealsRef, orderBy("lastSavedAt", "desc")));
    return snapshot.docs.map((d) => migrateLegacyDeal({ ...d.data(), id: d.id }));
  } catch {
    return loadLocalDeals();
  }
}

export async function loadDeal(id: string): Promise<DealInput | null> {
  if (typeof window === "undefined") return null;

  const uid = await getCurrentUserId();
  if (!uid) {
    const local = loadLocalDeals();
    return local.find((d) => d.id === id) ?? null;
  }

  const dealsRef = userDealsCollection(uid);
  if (!dealsRef) {
    const local = loadLocalDeals();
    return local.find((d) => d.id === id) ?? null;
  }

  try {
    const snap = await getDoc(doc(dealsRef, id));
    if (!snap.exists()) return null;
    return migrateLegacyDeal({ ...snap.data(), id: snap.id });
  } catch {
    const local = loadLocalDeals();
    return local.find((d) => d.id === id) ?? null;
  }
}

export async function saveDeals(deals: DealInput[]) {
  if (typeof window === "undefined") return;
  persistLocal(deals);

  const uid = await getCurrentUserId();
  if (!uid) return;

  const dealsRef = userDealsCollection(uid);
  if (!dealsRef) return;

  await Promise.all(deals.map((deal) => setDoc(doc(dealsRef, deal.id), deal, { merge: true })));
}

export async function upsertDeal(deal: DealInput): Promise<DealInput> {
  if (typeof window === "undefined") return deal;

  const savedDeal = { ...deal, lastSavedAt: new Date().toISOString() };
  upsertLocalDeal(savedDeal);

  const uid = await getCurrentUserId();
  if (!uid) return savedDeal;

  const dealsRef = userDealsCollection(uid);
  if (!dealsRef) return savedDeal;

  try {
    await setDoc(doc(dealsRef, savedDeal.id), savedDeal, { merge: true });
    return savedDeal;
  } catch {
    return savedDeal;
  }
}

export async function deleteDeal(id: string) {
  if (typeof window === "undefined") return;

  const localDeals = loadLocalDeals().filter((d) => d.id !== id);
  persistLocal(localDeals);

  const uid = await getCurrentUserId();
  if (!uid) return;

  const dealsRef = userDealsCollection(uid);
  if (!dealsRef) return;

  try {
    await deleteDoc(doc(dealsRef, id));
  } catch {
    return;
  }
}

# Deal Calculator Web App

Excel-inspired real estate deal calculator built with Next.js.

This app helps you:
- enter As-Is and ARV comp data
- model rehab, holding, and retail fees
- generate offer planning ranges
- review wholesale assignment scenarios

## Tech Stack
- Next.js (App Router)
- React + TypeScript
- Local storage persistence

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open:

- http://localhost:3000

Build for production:

```bash
npm run build
npm run start
```

## Current App Structure
- `/` summary dashboard of saved deals
- `/deals/[id]` deal editor + outputs

Main files:
- `app/page.tsx` + `src/components/HomePageClient.tsx`
- `app/deals/[id]/page.tsx`
- `src/lib/dealCalc.ts`
- `src/components/DealForm.tsx`
- `src/components/DealOutputs.tsx`
- `src/components/WholesaleTable.tsx`

## Data + Storage
- Deals are stored in browser `localStorage`.
- Current storage key/version: `dc_webapp_deals_v2`.
- Legacy data from `dc_webapp_deals_v1` is migrated best-effort on load.

## Key Calculations (Current)

### Offer Planning
- **Buyer Costs (Excl. Seller Retail Expense)**:
  - `rehabFinalCost + holdingTotal + (feesToRetail - sellerRetailExpense)`
- **Buyer Costs (Incl. Seller Retail Expense)**:
  - `feesToRetail + holdingTotal + rehabFinalCost`
- **Projected Buyer Total Costs**:
  - from wholesale baseline `totalCost`
- **Projected Buyer Remaining Cash**:
  - `adjustedArv - buyerCostsInclSellerRetailExpense`

### Wholesale Assignment Table
- **Wholesale Fee**:
  - `(ARV - Projected Buyer Total Costs) * Wholesale %`
- **All In**:
  - `Projected Buyer Total Costs + Wholesale Fee`

### Holding Cost
- Monthly holding includes:
  - `annualHoa / 12`
  - `annualInsurance / 12`
  - `annualTaxes / 12`
  - `monthlyMortgage`
  - `monthlyOtherHolding`
- Holding total:
  - `holdingMonthly * monthsUntilSold`

## UI Notes
- Purchase Price input is shown in the right column above Outputs.
- Comp tables include tracking fields: Address, Bed/Bath, Year Built, Lot Size, Sqft, Price, Date, Days.
- Offer Planning includes selectable percentage rows and a selected MAO buffer output.

## Scripts
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint project

## Known Environment Notes
- In some environments Turbopack can produce client-manifest issues; dev script currently uses webpack mode.

"use client";

import type { DealInput, DealOutput, DamageType, RehabType } from "@/lib/dealCalc";
import { NumberInput } from "./NumberInput";
import { CompTable } from "./CompTable";

type Props = {
  deal: DealInput;
  out: DealOutput | null;
  onChange: (d: DealInput) => void;
};

export function DealForm({ deal, out, onChange }: Props) {
  const set = (patch: Partial<DealInput>) => onChange({ ...deal, ...patch });

  const emptyAges = [null, null, null, null, null] as Array<number | null>;
  const pctForInput = (decimal: number) => Number((decimal * 100).toFixed(4));

  return (
    <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
      <div className="section-card card">
        <div style={{ fontWeight: 900 }}>Subject Property</div>

        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            <label className="input-wrap">
              <div className="label">Deal Label</div>
              <input className="field" value={deal.propertyLabel} onChange={(e) => set({ propertyLabel: e.target.value })} />
            </label>

            <label className="input-wrap">
              <div className="label">Property Address</div>
              <input className="field" value={deal.propertyAddress} onChange={(e) => set({ propertyAddress: e.target.value })} />
            </label>

            <label className="input-wrap">
              <div className="label">Owner Name</div>
              <input className="field" value={deal.ownerName} onChange={(e) => set({ ownerName: e.target.value })} />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <NumberInput label="SQFT" value={deal.subjectSqft} onChange={(v) => set({ subjectSqft: v ?? 0 })} />
            <NumberInput label="Lot Size" value={deal.lotSize} onChange={(v) => set({ lotSize: v })} />

            <label className="input-wrap">
              <div className="label">Bed / Bath</div>
              <input className="field" value={deal.bedBath} onChange={(e) => set({ bedBath: e.target.value })} />
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={deal.floodZone} onChange={(e) => set({ floodZone: e.target.checked })} />
            Flood Zone
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={deal.doubleYellow} onChange={(e) => set({ doubleYellow: e.target.checked })} />
            Double Yellow
          </label>
        </div>
      </div>

      <CompTable
        title="As-Is Sold Comps"
        comps={deal.asIsSold}
        agedDays={out?.agedCompDays.asIsSold ?? emptyAges}
        onChange={(v) => set({ asIsSold: v })}
      />
      <CompTable
        title="As-Is Active Comps"
        comps={deal.asIsActive}
        agedDays={out?.agedCompDays.asIsActive ?? emptyAges}
        onChange={(v) => set({ asIsActive: v })}
      />

      <div className="section-card card" style={{ gap: 12 }}>
        <div style={{ fontWeight: 900 }}>Novation Assumptions</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <NumberInput
            label="Market Adjustment %"
            value={deal.marketAdjustmentPct}
            onChange={(v) => set({ marketAdjustmentPct: v ?? 0.1 })}
            step={0.01}
          />
          <NumberInput
            label="Novation Closing Fee %"
            value={deal.novationClosingFeePct}
            onChange={(v) => set({ novationClosingFeePct: v ?? 0.1 })}
            step={0.01}
          />
          <NumberInput
            label="Desired Profit"
            value={deal.desiredProfit}
            onChange={(v) => set({ desiredProfit: v ?? 30000 })}
            step={1000}
          />
        </div>
      </div>

      <CompTable
        title="ARV Sold Comps"
        comps={deal.arvSold}
        agedDays={out?.agedCompDays.arvSold ?? emptyAges}
        onChange={(v) => set({ arvSold: v })}
      />
      <CompTable
        title="ARV Active Comps"
        comps={deal.arvActive}
        agedDays={out?.agedCompDays.arvActive ?? emptyAges}
        onChange={(v) => set({ arvActive: v })}
      />

      <div className="section-card card" style={{ gap: 12 }}>
        <div style={{ fontWeight: 900 }}>Property and Core Assumptions</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <NumberInput
            label="ARV Override"
            value={deal.inputArvOverride}
            onChange={(v) => set({ inputArvOverride: v })}
            step={5000}
          />

          <label className="input-wrap">
            <div className="label">Rehab Type</div>
            <select className="field" value={deal.rehabType} onChange={(e) => set({ rehabType: e.target.value as RehabType })}>
              <option>Partial Loss</option>
              <option>Total Loss</option>
              <option>New Construction</option>
            </select>
          </label>

          <label className="input-wrap">
            <div className="label">Damage Type</div>
            <select className="field" value={deal.damageType} onChange={(e) => set({ damageType: e.target.value as DamageType })}>
              <option>Light</option>
              <option>Moderate</option>
              <option>Heavy</option>
            </select>
          </label>

          <NumberInput
            label="Custom Rehab Amount"
            value={deal.rehabCustomAmount}
            onChange={(v) => set({ rehabCustomAmount: v ?? 0 })}
            step={1000}
          />
        </div>
      </div>

      <div className="section-card card" style={{ gap: 12 }}>
        <div style={{ fontWeight: 900 }}>Holding Costs and Fees</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          <NumberInput
            label="Months Until Sold"
            value={deal.monthsUntilSold}
            onChange={(v) => set({ monthsUntilSold: v ?? 4 })}
            step={1}
          />
          <NumberInput
            label="Annual HOA"
            value={deal.annualHoa}
            onChange={(v) => set({ annualHoa: v ?? 0 })}
            step={100}
          />
          <NumberInput
            label="Annual Insurance"
            value={deal.annualInsurance}
            onChange={(v) => set({ annualInsurance: v ?? 0 })}
            step={100}
          />
          <NumberInput
            label="Annual Taxes"
            value={deal.annualTaxes}
            onChange={(v) => set({ annualTaxes: v ?? 0 })}
            step={100}
          />
          <NumberInput
            label="Monthly Mortgage"
            value={deal.monthlyMortgage}
            onChange={(v) => set({ monthlyMortgage: v ?? 0 })}
            step={50}
          />
          <NumberInput
            label="Monthly Other Holding"
            value={deal.monthlyOtherHolding}
            onChange={(v) => set({ monthlyOtherHolding: v ?? 0 })}
            step={50}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          <NumberInput
            label="Retail Commission (%)"
            value={pctForInput(deal.retailCommissionPct)}
            onChange={(v) => set({ retailCommissionPct: (v ?? 6) / 100 })}
            step={0.1}
          />
          <NumberInput
            label="Closing Costs (%)"
            value={pctForInput(deal.retailClosingCostsPct)}
            onChange={(v) => set({ retailClosingCostsPct: (v ?? 3.5) / 100 })}
            step={0.1}
          />
          <NumberInput
            label="Seller Retail Expense (%)"
            value={pctForInput(deal.sellerRetailExpensePct)}
            onChange={(v) => set({ sellerRetailExpensePct: (v ?? 7) / 100 })}
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
}

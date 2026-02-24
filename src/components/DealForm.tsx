"use client";

import type { DealInput, DamageType, RehabType } from "@/lib/dealCalc";
import { NumberInput } from "./NumberInput";
import { CompTable } from "./CompTable";

export function DealForm({ deal, onChange }: { deal: DealInput; onChange: (d: DealInput) => void }) {
  const set = (patch: Partial<DealInput>) => onChange({ ...deal, ...patch });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 14, display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Deal / Property label</div>
          <input
            value={deal.propertyLabel}
            onChange={(e) => set({ propertyLabel: e.target.value })}
            style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10 }}
          />
        </label>

        <NumberInput label="Subject sqft" value={deal.subjectSqft} onChange={(v) => set({ subjectSqft: v ?? 0 })} />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={!!deal.floodZone} onChange={(e) => set({ floodZone: e.target.checked })} />
            Flood zone (ARV discount)
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={!!deal.doubleYellow}
              onChange={(e) => set({ doubleYellow: e.target.checked })}
            />
            Double yellow (ARV discount)
          </label>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <CompTable title="As-Is Sold Comps" comps={deal.asIsSold} onChange={(v) => set({ asIsSold: v })} />
        <CompTable title="As-Is Active Comps" comps={deal.asIsActive} onChange={(v) => set({ asIsActive: v })} />
      </div>

      <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 14, display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 900 }}>Novation Assumptions</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <NumberInput
            label="Novation Market Adjustment %"
            value={deal.marketAdjustmentPct ?? 0.1}
            onChange={(v) => set({ marketAdjustmentPct: v ?? 0.1 })}
            step={0.01}
          />
          <NumberInput
            label="Novation Closing Fee %"
            value={deal.closingFeePct ?? 0.1}
            onChange={(v) => set({ closingFeePct: v ?? 0.1 })}
            step={0.01}
          />
          <NumberInput
            label="Desired Novation Profit"
            value={deal.desiredProfit ?? 30000}
            onChange={(v) => set({ desiredProfit: v ?? 30000 })}
            step={1000}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <CompTable title="ARV Sold Comps" comps={deal.arvSold} onChange={(v) => set({ arvSold: v })} />
        <CompTable title="ARV Active Comps" comps={deal.arvActive} onChange={(v) => set({ arvActive: v })} />
      </div>

      <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 14, display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 900 }}>Repairs & Holding</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Repair level</div>
            <select
              value={deal.rehabType}
              onChange={(e) => set({ rehabType: e.target.value as RehabType })}
              style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10 }}
            >
              <option>Partial Loss</option>
              <option>Total Loss</option>
              <option>New Construction</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Damage / condition</div>
            <select
              value={deal.damageType}
              onChange={(e) => set({ damageType: e.target.value as DamageType })}
              style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10 }}
            >
              <option>Light</option>
              <option>Moderate</option>
              <option>Heavy</option>
            </select>
          </label>

          <NumberInput
            label="ARV Override (optional)"
            value={deal.inputARV ?? null}
            onChange={(v) => set({ inputARV: v })}
            step={5000}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          <NumberInput
            label="Hold time (months)"
            value={deal.monthsUntilSold ?? 4}
            onChange={(v) => set({ monthsUntilSold: v ?? 4 })}
            step={1}
          />
          <NumberInput label="Annual HOA" value={deal.annualHOA ?? 0} onChange={(v) => set({ annualHOA: v ?? 0 })} step={100} />
          <NumberInput
            label="Annual insurance"
            value={deal.annualInsurance ?? 0}
            onChange={(v) => set({ annualInsurance: v ?? 0 })}
            step={100}
          />
          <NumberInput
            label="Annual taxes"
            value={deal.annualTaxes ?? 0}
            onChange={(v) => set({ annualTaxes: v ?? 0 })}
            step={100}
          />
        </div>
      </div>

      <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 14, display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 900 }}>Investor Selling Costs (for MAO)</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <NumberInput
            label="Agent commission %"
            value={deal.retailCommissionPct ?? 0.06}
            onChange={(v) => set({ retailCommissionPct: v ?? 0.06 })}
            step={0.01}
          />
          <NumberInput
            label="Closing costs %"
            value={deal.retailClosingCostsPct ?? 0.035}
            onChange={(v) => set({ retailClosingCostsPct: v ?? 0.035 })}
            step={0.001}
          />
          <NumberInput
            label="Seller concessions / prep %"
            value={deal.sellerRetailExpensePct ?? 0.07}
            onChange={(v) => set({ sellerRetailExpensePct: v ?? 0.07 })}
            step={0.01}
          />
        </div>
      </div>
    </div>
  );
}

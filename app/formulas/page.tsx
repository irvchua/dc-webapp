import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Formula Guide | Deal Calculator",
  description: "A plain-language guide to every formula used by the Deal Calculator.",
};

type Formula = {
  name: string;
  expression: string;
  note: string;
};

const sections: Array<{ id: string; title: string; intro: string; formulas: Formula[] }> = [
  {
    id: "comps",
    title: "Comparable properties",
    intro: "Sold and active comps are calculated separately. Empty, zero, or invalid comp values are ignored.",
    formulas: [
      {
        name: "Individual comp $/sqft",
        expression: "Comp sale price ÷ comp square feet",
        note: "A comp must have both a valid price and square footage greater than zero.",
      },
      {
        name: "Average comp $/sqft",
        expression: "Sum of valid comp $/sqft values ÷ number of valid comps",
        note: "The calculator creates separate averages for sold and active comps.",
      },
      {
        name: "Subject value from comps",
        expression: "Average comp $/sqft × subject property square feet",
        note: "Calculated separately for sold and active groups.",
      },
      {
        name: "Combined value",
        expression: "(Sold value + active value) ÷ 2",
        note: "If only one group has a valid value, that value is used instead of an average.",
      },
      {
        name: "Comp age",
        expression: "Whole days between the comp date and today",
        note: "Future dates display as 0 days old.",
      },
    ],
  },
  {
    id: "novation",
    title: "As-is value and novation",
    intro: "The as-is comp result is reduced by the selected market adjustment before the novation offer is calculated.",
    formulas: [
      {
        name: "Adjusted as-is value",
        expression: "Combined as-is value × (1 − market adjustment %)",
        note: "For example, a 10% market adjustment keeps 90% of the combined as-is value.",
      },
      {
        name: "Novation closing fee",
        expression: "Adjusted as-is value × novation closing fee %",
        note: "This amount is embedded in the MAO formula below.",
      },
      {
        name: "MAO (novation)",
        expression: "Adjusted as-is value − novation closing fee − desired profit",
        note: "MAO means maximum allowable offer.",
      },
    ],
  },
  {
    id: "arv",
    title: "ARV and property adjustments",
    intro: "ARV uses the same comp method above, unless a manual ARV override greater than zero is entered.",
    formulas: [
      {
        name: "ARV before adjustments",
        expression: "Manual ARV override, or combined ARV comp value",
        note: "The override takes priority when it is greater than zero.",
      },
      {
        name: "Flood-zone discount",
        expression: "ARV before adjustments × 15%",
        note: "Applied only when Flood Zone is checked.",
      },
      {
        name: "Double-yellow discount",
        expression: "ARV before adjustments × 5%",
        note: "Applied only when Double Yellow is checked.",
      },
      {
        name: "Adjusted ARV",
        expression: "ARV before adjustments − flood discount − double-yellow discount",
        note: "Both discounts can apply at the same time.",
      },
    ],
  },
  {
    id: "rehab",
    title: "Rehab cost",
    intro: "Rehab type sets the base cost per square foot, then damage severity adds a percentage.",
    formulas: [
      {
        name: "Rehab cost per sqft",
        expression: "Partial Loss: $30 · Total Loss: $131 · New Construction: $200",
        note: "The selected rehab type controls the rate.",
      },
      {
        name: "Damage multiplier",
        expression: "Light: 0% · Moderate: 10% · Heavy: 25%",
        note: "The percentage is applied to the base rehab cost.",
      },
      {
        name: "Base rehab cost",
        expression: "Subject square feet × rehab cost per sqft",
        note: "Negative square footage is treated as zero.",
      },
      {
        name: "Calculated rehab cost",
        expression: "Base rehab cost + (base rehab cost × damage multiplier)",
        note: "This is used when no custom rehab amount is entered.",
      },
      {
        name: "Final rehab cost",
        expression: "Custom rehab amount, if greater than zero; otherwise calculated rehab cost",
        note: "A positive custom amount replaces the calculated result.",
      },
    ],
  },
  {
    id: "holding",
    title: "Holding costs and retail fees",
    intro: "Annual expenses are converted to monthly values before they are added to the holding total.",
    formulas: [
      {
        name: "Monthly mortgage default",
        expression: "Purchase price × 10% ÷ 12",
        note: "Used only when the monthly mortgage is blank (Auto). An entered 0 means an all-cash deal.",
      },
      {
        name: "Monthly holding cost",
        expression: "HOA ÷ 12 + insurance ÷ 12 + taxes ÷ 12 + monthly mortgage + monthly other",
        note: "HOA, insurance, and taxes are entered as annual amounts.",
      },
      {
        name: "Total holding cost",
        expression: "Monthly holding cost × months until sold",
        note: "Negative months are treated as zero.",
      },
      {
        name: "Retail commission",
        expression: "Adjusted ARV × retail commission %",
        note: "Uses the percentage entered in the deal assumptions.",
      },
      {
        name: "Retail closing costs",
        expression: "Adjusted ARV × retail closing costs %",
        note: "Uses the percentage entered in the deal assumptions.",
      },
      {
        name: "Seller retail expense",
        expression: "Adjusted ARV × seller retail expense %",
        note: "Included in walkaway costs, but excluded from projected buyer hard costs.",
      },
      {
        name: "Fees to retail",
        expression: "Retail commission + closing costs + seller retail expense + mansion tax",
        note: "All four components must be available to produce this total.",
      },
    ],
  },
  {
    id: "offers",
    title: "Walkaway cash and offer planning",
    intro: "These figures estimate the cash remaining after the modeled project costs.",
    formulas: [
      {
        name: "Buyer costs (including seller retail expense)",
        expression: "Fees to retail + total holding cost + final rehab cost",
        note: "Shown as total walkaway costs.",
      },
      {
        name: "Projected buyer remaining cash",
        expression: "Adjusted ARV − buyer costs including seller retail expense",
        note: "Also labeled Walkaway Cash on the dashboard.",
      },
      {
        name: "MAO range amount",
        expression: "Projected buyer remaining cash × selected MAO %",
        note: "The page shows 60%, 65%, 70%, 75%, 80%, 85%, 90%, 95%, and 100%.",
      },
      {
        name: "Selected MAO buffer",
        expression: "Projected buyer remaining cash − selected MAO range amount",
        note: "The amount left between the maximum modeled cash and the selected offer percentage.",
      },
    ],
  },
  {
    id: "wholesale",
    title: "Wholesale assignment table",
    intro: "Each row tests a wholesale percentage from 10% through 75% against the same deal assumptions.",
    formulas: [
      {
        name: "Buyer hard costs",
        expression: "Final rehab + holding total + retail commission + closing costs + mansion tax",
        note: "Seller retail expense is intentionally excluded.",
      },
      {
        name: "Projected buyer total costs",
        expression: "Purchase price + buyer hard costs",
        note: "This is the cost base used to calculate the wholesale fee.",
      },
      {
        name: "Wholesale fee",
        expression: "(Adjusted ARV − projected buyer total costs) × wholesale %",
        note: "Rows use 10%, 20%, 30%, 40%, 50%, 55%, 60%, 65%, 70%, and 75%.",
      },
      {
        name: "Investor sell price",
        expression: "Purchase price + wholesale fee",
        note: "The price paid by the investor before the remaining project costs.",
      },
      {
        name: "All in",
        expression: "Projected buyer total costs + wholesale fee",
        note: "The modeled total investment after the assignment fee.",
      },
      {
        name: "Profit",
        expression: "Adjusted ARV − all in",
        note: "Projected gross spread using the adjusted ARV.",
      },
      {
        name: "Out of pocket",
        expression: "Purchase price + final rehab cost + wholesale fee",
        note: "Holding and retail costs are not included in this particular column.",
      },
      {
        name: "Cash-on-cash",
        expression: "Profit ÷ out of pocket",
        note: "Returns 0% when out of pocket is not greater than zero.",
      },
    ],
  },
];

export default function FormulasPage() {
  return (
    <main className="shell formula-shell">
      <header className="card formula-hero">
        <div>
          <div className="formula-eyebrow">Calculation reference</div>
          <h1 className="title formula-title">How every number is calculated</h1>
          <p className="muted formula-lead">
            A plain-language guide to the formulas, assumptions, fallbacks, and percentage tiers used throughout the Deal Calculator.
          </p>
        </div>
        <Link href="/" className="btn">
          <span className="btn-content"><span aria-hidden="true">←</span><span>Back to deals</span></span>
        </Link>
      </header>

      <nav className="card formula-nav" aria-label="Formula sections">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>{section.title}</a>
        ))}
        <a href="#mansion-tax">Mansion tax</a>
      </nav>

      <div className="formula-layout">
        <div className="formula-content">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="card formula-section">
              <div className="formula-section-heading">
                <div className="formula-step" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <h2>{section.title}</h2>
                  <p className="muted">{section.intro}</p>
                </div>
              </div>
              <div className="formula-list">
                {section.formulas.map((formula) => (
                  <article key={formula.name} className="formula-row">
                    <div className="formula-name">{formula.name}</div>
                    <code>{formula.expression}</code>
                    <p className="muted">{formula.note}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}

          <section id="mansion-tax" className="card formula-section">
            <div className="formula-section-heading">
              <div className="formula-step" aria-hidden="true">{String(sections.length + 1).padStart(2, "0")}</div>
              <div>
                <h2>Mansion tax tiers</h2>
                <p className="muted">The rate is selected from adjusted ARV, then mansion tax equals adjusted ARV × that rate.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table formula-tier-table">
                <thead><tr><th>Adjusted ARV</th><th>Rate</th></tr></thead>
                <tbody>
                  <tr><td>$1,000,000 or less</td><td>0%</td></tr>
                  <tr><td>Over $1,000,000 through $2,000,000</td><td>1%</td></tr>
                  <tr><td>Over $2,000,000 through $2,500,000</td><td>2%</td></tr>
                  <tr><td>Over $2,500,000 through $3,000,000</td><td>2.5%</td></tr>
                  <tr><td>Over $3,000,000 through $3,500,000</td><td>3%</td></tr>
                  <tr><td>Over $3,500,000</td><td>3.5%</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="card formula-note">
          <div className="formula-eyebrow">Reading the guide</div>
          <h2>Quick conventions</h2>
          <ul>
            <li>Percentages are shown as human-readable percentages.</li>
            <li>“Adjusted ARV” means after flood and double-yellow discounts.</li>
            <li>Invalid comp rows do not count toward averages.</li>
            <li>Displayed currency may be rounded, while calculations use full precision.</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}

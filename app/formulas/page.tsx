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
  why?: string;
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
        name: "Flood-zone comp matching",
        expression: "Only comps whose Flood checkbox matches the subject property's Flood Zone checkbox are averaged; if none match, all comps are used instead",
        note: "Applies before the $/sqft average, to both As-Is and ARV comp groups.",
        why: "A flood-zone comp and a non-flood comp aren't apples-to-apples — flood risk moves price. Mixing them into one average silently drags the estimate toward whichever group happens to dominate. Filtering to matching comps first keeps the comparison honest. The fallback to all comps only kicks in if nobody has tagged any comp yet, so untagged deals behave exactly as before.",
      },
      {
        name: "Average comp $/sqft",
        expression: "Sum of valid, flood-matched comp $/sqft values ÷ number of those comps",
        note: "The calculator creates separate averages for sold and active comps.",
      },
      {
        name: "Subject value from comps",
        expression: "Average comp $/sqft × subject property square feet",
        note: "Calculated separately for sold and active groups.",
      },
      {
        name: "Combined value",
        expression: "Sold value × 70% + active value × 30%",
        note: "If only one group has a valid value, that value is used on its own instead of a blend.",
        why: "Sold comps are closed transactions — real money that actually changed hands. Active comps are asking prices, which routinely sit above what a property eventually sells for. Weighting sold comps higher keeps the estimate from drifting optimistic just because a few overpriced active listings are sitting on the market.",
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
    intro: "Novation deals resell the property as-is, with no rehab — the exit price is today's as-is value, not tomorrow's fixed-up ARV.",
    formulas: [
      {
        name: "As-is flood / double-yellow discount",
        expression: "Combined As-Is value × 15% (flood) and/or × 5% (double yellow), applied before the market adjustment",
        note: "Uses the same subject-level Flood Zone and Double Yellow checkboxes as the ARV side.",
        why: "These are physical defects in the property, not a market-timing buffer — they should reduce the raw comp-based value the same way they reduce the ARV comp-based value. Applying them here keeps a flood-zone property's novation offer and its wholesale/flip offer consistent with each other, instead of only discounting one exit strategy and not the other.",
      },
      {
        name: "Adjusted as-is value",
        expression: "(Combined As-Is value − flood discount − double-yellow discount) × (1 − market adjustment %)",
        note: "For example, a 10% market adjustment keeps 90% of the defect-adjusted combined As-Is value.",
        why: "Market adjustment is a separate, negotiable buffer (uncertainty, negotiating room, holding risk) layered on top of the defect-adjusted comp value — the two discounts model different things and are kept as separate steps rather than folded into one number.",
      },
      {
        name: "Novation closing fee",
        expression: "Adjusted as-is value × novation closing fee %",
        note: "This amount is embedded in the MAO formula below.",
      },
      {
        name: "MAO — Novation (As-Is Exit)",
        expression: "Adjusted as-is value − novation closing fee − desired profit",
        note: "MAO means maximum allowable offer. This number is specific to an as-is, no-rehab resale — do not use it to size a rehab/wholesale offer.",
        why: "There are two different MAO numbers in this app because there are two different deal types: this one assumes you resell the property as-is to another buyer, so it's sized off As-Is comps. The ARV-based offer further down assumes a rehab-and-resell exit, so it's sized off ARV instead. They will normally differ — that's expected, not a bug — but grabbing the wrong one for the wrong strategy will misstate what you can safely offer a seller.",
      },
    ],
  },
  {
    id: "arv",
    title: "ARV and property adjustments",
    intro: "ARV uses the same comp method above, unless a manual ARV override greater than zero is entered. This is the value used for rehab-and-resell (wholesale/flip) exits, not as-is novation exits.",
    formulas: [
      {
        name: "ARV before adjustments",
        expression: "Manual ARV override, or combined ARV comp value (70% sold / 30% active)",
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
        note: "Both discounts can apply at the same time. Feeds the rehab-exit offer range and the wholesale table below, not the Novation MAO above.",
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
        note: "Used only when the Monthly Mortgage field is left blank. Entering 0 explicitly means an intentional all-cash deal and is used as-is, not replaced.",
        why: "Blank and zero mean different things to a real buyer — blank means \"I haven't figured out financing yet, estimate it for me,\" while zero means \"I'm paying cash, there is no mortgage payment.\" Treating both the same would silently inflate holding costs on every genuinely all-cash deal.",
      },
      {
        name: "Monthly holding cost",
        expression: "HOA ÷ 12 + insurance ÷ 12 + taxes ÷ 12 + resolved monthly mortgage + monthly other",
        note: "HOA, insurance, and taxes are entered as annual amounts. \"Resolved\" mortgage is the auto estimate or the entered value, per the rule above.",
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
    intro: "These figures estimate the cash remaining after the modeled project costs, for a rehab-and-resell exit. A negative value means the deal loses money before any purchase price is even applied — it is shown in red.",
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
        name: "ARV-based offer amount",
        expression: "Projected buyer remaining cash × selected %",
        note: "The page shows 60%, 65%, 70%, 75%, 80%, 85%, 90%, 95%, and 100%. This is a different number from the Novation MAO above — use it for rehab/wholesale exits, not as-is resales.",
        why: "Paying 100% of walkaway cash leaves zero profit margin — the purchase price would exactly equal what's left after every modeled cost. Offering a lower percentage is how you build in profit and a safety cushion; 60% leaves roughly 40% of walkaway cash as buffer. Each row has a \"Use\" button to drop that amount straight into the Purchase Price field.",
      },
      {
        name: "Selected rehab-exit offer buffer",
        expression: "Projected buyer remaining cash − selected ARV-based offer amount",
        note: "The amount left between the maximum modeled cash and the selected offer percentage.",
      },
    ],
  },
  {
    id: "wholesale",
    title: "Wholesale assignment table",
    intro: "Each row tests a wholesale percentage from 10% through 75% against the same deal assumptions. Purchase Price here is whatever value is currently in the Purchase Price field — it is not automatically synced to either MAO number above, so double-check it against them.",
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
        note: "Rows use 10%, 20%, 30%, 40%, 50%, 55%, 60%, 65%, 70%, and 75%. This is the wholesaler's assignment fee.",
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
        note: "This is the end buyer's (the person purchasing from the wholesaler) projected gross profit after rehab, holding, and retail exit costs — not the wholesaler's own fee, which is the Wholesale Fee column. Shown in red when negative.",
      },
      {
        name: "Out of pocket",
        expression: "Purchase price + final rehab cost + holding total + wholesale fee",
        note: "Retail exit costs (commission, closing costs, mansion tax) are not included in this column.",
        why: "This column is meant to represent cash the buyer actually has to put in. Retail exit costs are reasonable to leave out because they're typically settled out of the sale proceeds at the closing table, not paid from the buyer's account beforehand. Holding costs are different — they're paid monthly out of pocket (or drawn from a loan the buyer still has to service) over the life of the deal, so they belong here. An earlier version of this table left holding costs out of Out of Pocket while still subtracting them from Profit, which overstated Cash-on-Cash — that mismatch is now fixed.",
      },
      {
        name: "Cash-on-cash",
        expression: "Profit ÷ out of pocket",
        note: "Returns 0% when out of pocket is not greater than zero. Shown in red when negative.",
        why: "For this percentage to mean anything, the numerator (money made) and denominator (money put in) need to cover the same costs. Since Profit is already net of holding costs, Out of Pocket has to include them too, or the return looks better than it actually is.",
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
            A plain-language guide to the formulas, assumptions, fallbacks, and percentage tiers used throughout the Deal Calculator —
            including why each one is built the way it is.
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
                    {formula.why ? (
                      <p className="muted formula-why">
                        <strong>Why: </strong>
                        {formula.why}
                      </p>
                    ) : null}
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
            <li>&ldquo;Adjusted ARV&rdquo; means after flood and double-yellow discounts, for a rehab-and-resell exit.</li>
            <li>&ldquo;Adjusted As-Is Value&rdquo; means after the same discounts plus market adjustment, for an as-is novation exit.</li>
            <li>There are two distinct MAO numbers — Novation (as-is) and ARV-based (rehab exit). They are expected to differ; use the one matching your exit strategy.</li>
            <li>Invalid comp rows, and comps whose flood-zone tag doesn&apos;t match the subject, do not count toward averages.</li>
            <li>Red values in the outputs and wholesale table mean that figure is negative.</li>
            <li>Displayed currency may be rounded, while calculations use full precision.</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}

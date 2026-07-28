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
      {
        name: "Comp confidence",
        expression: "Count of valid, flood-matched comps used ÷ 5 slots, plus their average age in days",
        note: "Shown under each $/sqft figure. Highlighted when only 0-1 comps are used, or the average age exceeds 180 days.",
        why: "A value built on one six-month-old comp and a value built on five recent ones can produce the exact same number, but they don't deserve the same trust. Surfacing the count and age is a reminder to sanity-check thin or stale comp sets before relying on the resulting offer.",
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
        name: "Rehab before contingency",
        expression: "Custom rehab amount, if greater than zero; otherwise calculated rehab cost",
        note: "A positive custom amount replaces the calculated result.",
      },
      {
        name: "Rehab contingency",
        expression: "Rehab before contingency × Rehab Contingency %",
        note: "Defaults to 10%.",
        why: "Rehab budgets running over estimate is one of the most common ways a flip actually loses money, whether the estimate came from the calculator's $/sqft formula or a number you typed in yourself. A contingency buffer on top of either one accounts for that instead of assuming the first estimate is exact.",
      },
      {
        name: "Final rehab cost",
        expression: "Rehab before contingency + Rehab contingency",
        note: "This is the number used everywhere else in the calculator — holding costs, wholesale hard costs, and offer planning.",
      },
    ],
  },
  {
    id: "holding",
    title: "Holding costs and retail fees",
    intro: "Annual expenses are converted to monthly values before they are added to the holding total.",
    formulas: [
      {
        name: "LTV and financing coverage",
        expression: "LTV = loan amount ÷ property value",
        note: "Investors and lenders use LTV before acquisition to size the loan, estimate required equity, and evaluate leverage risk.",
        why: "The calculator's Purchase Price Financed percentage is a simplified acquisition-financing assumption. Rehab Budget Financed is technically closer to loan-to-cost because it measures the financed share of a budget rather than property value.",
      },
      {
        name: "Loan amount",
        expression: "(Purchase price × Purchase Price Financed %) + (Rehab final cost × Rehab Budget Financed %)",
        note: "Purchase financing defaults to 90% and rehab financing defaults to 100%. Set either to 0% to model that portion as unfinanced.",
        why: "Hard-money and private financing on a flip usually covers both the purchase and the rehab, drawn as work completes — not just the purchase price. Modeling both pieces separately lets the loan amount reflect what's actually financed instead of a single flat guess.",
      },
      {
        name: "Financing points",
        expression: "Loan amount × Points %",
        note: "A one-time cost paid at closing (defaults to 2 points), included in Total Acquisition Costs below — not a monthly holding cost.",
      },
      {
        name: "Monthly mortgage default",
        expression: "Loan amount × Interest Rate % ÷ 12 (interest-only)",
        note: "Used only when Monthly Mortgage is blank. Entering 0 activates all-cash mode: purchase/rehab financing, loan amount, interest, and points all become zero.",
        why: "Blank means \"estimate financing for me,\" while zero means \"there is no loan.\" All-cash mode must suppress the entire financing model—not just the monthly payment—or fictitious points would reduce the deal's projected returns.",
      },
      {
        name: "Acquisition closing costs",
        expression: "Purchase price × Acquisition Closing Cost %",
        note: "Defaults to 2%. Title, attorney, recording, transfer tax, and similar entry-side costs — separate from the retail exit costs below, which apply when the finished property is resold.",
      },
      {
        name: "Total acquisition costs",
        expression: "Financing points + Acquisition closing costs",
        note: "One-time cash paid at purchase. Included in Total Walkaway Costs, the wholesale table's hard costs, and Out of Pocket.",
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
        name: "End-investor retail resale allowance",
        expression: "Adjusted ARV × end-investor retail resale allowance %",
        note: "Applies later, when the end investor becomes the seller and resells the finished property to a retail buyer. It is not a payment to the original homeowner.",
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
        name: "End investor project costs (wholesale basis)",
        expression: "Final rehab + holding + total acquisition costs + retail commission + closing costs + mansion tax",
        note: "Costs belonging to the end investor who buys the assigned deal from you. Excludes the separate retail-resale allowance.",
      },
      {
        name: "End investor all-in project costs (offer basis)",
        expression: "End investor project costs + end-investor retail resale allowance",
        note: "The conservative total used to determine how much room remains for your offer to the original homeowner.",
      },
      {
        name: "Projected buyer remaining cash",
        expression: "Adjusted ARV − all modeled project costs (offer basis)",
        note: "The same figure appears under three names depending on where you're looking: \"Projected Buyer Remaining Cash\" here and in the Cash Offer % selector, \"Cash Available for Homeowner Offer\" in the Offer Planning card, and \"Walkaway Cash\" on the dashboard.",
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
      {
        name: "Recommended deal type",
        expression: "Higher of Novation offer or the currently selected cash-offer percentage",
        note: "The selected Deal Type remains your choice. The recommendation only compares modeled seller-offer amounts.",
        why: "This gives you a consistent starting point without hiding the tradeoff. A higher modeled offer can improve seller acceptance, but transaction complexity, timeline, condition, title, and market risk still require human review.",
      },
    ],
  },
  {
    id: "comparison",
    title: "Novation offer vs. cash offer",
    intro: "A dedicated side-by-side card (\"Novation Offer vs. Cash Offer\") answers \"what's the novation offer vs. the cash offer, and what would I resell it for?\" in one place, independent of whatever is currently typed into the Purchase Price field.",
    formulas: [
      {
        name: "Novation Offer (to Seller)",
        expression: "Same as MAO — Novation (As-Is Exit)",
        note: "As-is, no-rehab exit price offered to the seller.",
      },
      {
        name: "Cash Offer (to Seller)",
        expression: "Projected buyer remaining cash × selected Cash Offer %",
        note: "Defaults to 70%, the classic rehab-exit MAO starting point. Selectable from the same 60–100% steps as the ARV-based offer range.",
        why: "This is the rehab-and-resell counterpart to the Novation offer — same underlying number as the ARV-based offer above, just surfaced next to the Novation figure so the two exit strategies can be compared directly instead of hunting through separate cards.",
      },
      {
        name: "Cash Price to Investor",
        expression: "Cash Offer (to Seller) + wholesale fee, where wholesale fee = (Adjusted ARV − Cash Offer − buyer hard costs) × selected Wholesale Split %",
        note: "Defaults to a 50% split. Recomputed live from the Cash Offer above — it does not require clicking \"Use as Purchase Price\" first.",
        why: "This is the price the wholesaler would need to charge an end investor to assign the contract at the chosen split, given whichever Cash Offer is currently selected. Computing it directly (rather than only through the Wholesale Assignment Table, which reads the Purchase Price field) means the comparison stays correct even if Purchase Price hasn't been updated yet.",
      },
      {
        name: "Investor's Projected Profit",
        expression: "Adjusted ARV − (Cash Offer + buyer hard costs + wholesale fee)",
        note: "What the end buyer nets after rehab, holding, and retail exit costs, at the selected Wholesale Split %. Same formula as the wholesale table's Profit column.",
      },
      {
        name: "Investor's Annualized Return",
        expression: "Cash-on-cash × (12 ÷ months until sold, floored at 1 month)",
        note: "Scales the total-hold-period return to a 12-month basis.",
        why: "A 4-month deal and a 14-month deal with the same total cash-on-cash percentage are not equally good — the 4-month deal ties up capital for roughly a third as long. Without annualizing, deals with different hold periods can't be fairly compared side by side.",
      },
    ],
  },
  {
    id: "wholesale",
    title: "Wholesale assignment table",
    intro: "Each row tests a wholesale percentage from 0% through 75% against the same deal assumptions. Purchase Price here is whatever value is currently in the Purchase Price field — it is not automatically synced to either MAO number above, so double-check it against them.",
    formulas: [
      {
        name: "Buyer hard costs",
        expression: "Final rehab + holding total + total acquisition costs + retail commission + closing costs + mansion tax",
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
        note: "Rows use 0%, 10%, 20%, 30%, 40%, 50%, 55%, 60%, 65%, 70%, and 75%. This is the wholesaler's assignment fee — the 0% row has none at all.",
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
        expression: "Unfinanced purchase equity + unfinanced rehab equity + holding + acquisition costs + wholesale fee",
        note: "Retail exit costs (commission, closing costs, mansion tax) are not included in this column.",
        why: "Cash-on-cash must use actual investor equity, not financed principal. Purchase equity equals purchase price × (1 − Purchase Price Financed %), and rehab equity uses the same calculation with Rehab Budget Financed %. Holding costs, points, closing costs, and the assignment fee are directly paid cash, so they remain in the denominator.",
      },
      {
        name: "Cash-on-cash",
        expression: "Profit ÷ out of pocket",
        note: "Returns 0% when out of pocket is not greater than zero. Shown in red when negative.",
        why: "For this percentage to mean anything, the numerator (money made) and denominator (money put in) need to cover the same costs. Since Profit is already net of holding and acquisition costs, Out of Pocket has to include them too, or the return looks better than it actually is.",
      },
      {
        name: "Recommended wholesale balance",
        expression: "Highest wholesale fee among rows maintaining at least 12% investor cash-on-cash",
        note: "The 0% no-assignment baseline and negative assignment fees are excluded. If no row meets 12%, the table shows a warning instead of a recommendation.",
        why: "The 12% minimum protects the modeled end-investor return while the selection of the highest qualifying wholesale fee maximizes your assignment opportunity.",
      },
      {
        name: "Annualized cash-on-cash",
        expression: "Cash-on-cash × (12 ÷ months until sold, floored at 1 month)",
        note: "A separate column next to Cash-on-Cash. Shown in red when negative.",
        why: "Total-hold-period return alone rewards long holds and short holds identically as long as the percentage matches, which isn't how tying up capital actually works. Annualizing puts every row on the same 12-month footing regardless of how many months the deal actually takes.",
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
            <li>Comp confidence notes flag when a value rests on 0-1 comps or an average age over 180 days.</li>
            <li>Rehab, holding, and acquisition costs (financing points, closing costs) all flow into Out of Pocket; retail exit costs do not, since those settle from sale proceeds.</li>
            <li>The wholesale table&apos;s 0% row has no assignment fee — it&apos;s the baseline for buying and flipping the deal yourself.</li>
            <li>Annualized Cash-on-Cash lets you compare deals with different hold periods on equal footing.</li>
            <li>Red values in the outputs and wholesale table mean that figure is negative.</li>
            <li>Displayed currency may be rounded, while calculations use full precision.</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}

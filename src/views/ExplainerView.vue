<template>
  <div class="explainer">
    <div class="explainer__inner">
      <RouterLink
        to="/"
        class="back-link"
      >
        &larr; Back to calculator
      </RouterLink>

      <h1 class="explainer__title">
        How it works
      </h1>
      <p class="explainer__intro">
        This calculator helps you find your <strong>Coast FIRE number</strong> — the amount
        you need invested today so that, without any further contributions, your portfolio
        will grow to fund your retirement on its own.
      </p>

      <div class="disclaimer">
        <strong>Not financial advice.</strong> This tool is for educational and planning
        purposes only. Investment returns are not guaranteed. Past performance does not
        predict future results. Consult a qualified financial adviser before making
        investment decisions.
      </div>

      <!-- ── 1. The FIRE number ──────────────────────────────────────── -->
      <section class="section">
        <h2 class="section__title">
          1. The FIRE number
        </h2>
        <p>
          Your <strong>FIRE number</strong> is the total investment pot that, once reached,
          can fund your retirement indefinitely — without you ever needing to earn again.
          It is calculated using the <strong>Safe Withdrawal Rate (SWR)</strong>:
        </p>
        <div class="formula">
          <div class="formula__eq">
            FIRE number = Annual expenses ÷ SWR
          </div>
          <div class="formula__eg">
            e.g. £40,000 ÷ 4% = <strong>£1,000,000</strong>
          </div>
        </div>
        <p>
          At a 4% withdrawal rate, you withdraw 4% of the pot each year. Because a
          diversified portfolio historically earns more than 4% in real terms over the long
          run, the portfolio keeps growing even while you draw it down — in theory,
          indefinitely.
        </p>
      </section>

      <!-- ── 2. Safe withdrawal rate ─────────────────────────────────── -->
      <section class="section">
        <h2 class="section__title">
          2. Safe Withdrawal Rate (SWR)
        </h2>
        <p>
          The 4% rule originates from the <strong>Trinity Study</strong> (1998), which
          analysed historical US market data and found that a portfolio invested in a mix
          of stocks and bonds survived 30-year retirement periods 95%+ of the time at a 4%
          withdrawal rate.
        </p>
        <table class="table">
          <thead>
            <tr><th>SWR</th><th>FIRE multiple</th><th>Example pot (£40k/yr)</th></tr>
          </thead>
          <tbody>
            <tr><td>3%</td><td>33×</td><td>£1,333,333</td></tr>
            <tr><td>3.5%</td><td>28.6×</td><td>£1,142,857</td></tr>
            <tr><td>4%</td><td>25×</td><td>£1,000,000</td></tr>
            <tr><td>5%</td><td>20×</td><td>£800,000</td></tr>
          </tbody>
        </table>
        <p class="note">
          A lower SWR requires a larger pot but provides more resilience. For retirements
          longer than 30 years — which is likely if you retire early — many planners use
          3–3.5% to be safe.
        </p>
      </section>

      <!-- ── 3. State pension adjustment ────────────────────────────── -->
      <section class="section">
        <h2 class="section__title">
          3. UK State Pension adjustment
        </h2>
        <p>
          If you plan to receive the UK State Pension, it reduces the amount your
          investment portfolio needs to fund. Because the State Pension only starts at State
          Pension Age (currently <strong>67</strong>), we split the calculation into two
          tranches when you retire before that age.
        </p>
        <div class="two-col">
          <div class="two-col__item">
            <div class="two-col__label">
              Tranche 1 — the bridge
            </div>
            <p>
              During the gap between your retirement and State Pension Age, you fund
              <em>full</em> expenses from investments alone. We calculate the present value
              of this annuity stream:
            </p>
            <div class="formula formula--sm">
              <div class="formula__eq">
                Bridge = Expenses × (1 − 1/(1+r)<sup>gap</sup>) / r
              </div>
            </div>
          </div>
          <div class="two-col__item">
            <div class="two-col__label">
              Tranche 2 — long-term pot
            </div>
            <p>
              From State Pension Age onwards, you only need to fund expenses
              <em>minus</em> the State Pension. We calculate the pot needed at SPA and
              discount it back to your retirement date:
            </p>
            <div class="formula formula--sm">
              <div class="formula__eq">
                Pot at retirement = (Expenses − SP) / SWR / (1+r)<sup>gap</sup>
              </div>
            </div>
          </div>
        </div>
        <p>
          The total adjusted FIRE number is Bridge + Discounted long-term pot. This is
          typically <strong>20–30% lower</strong> than the naive figure, and grows as your
          retirement age moves further from State Pension Age.
        </p>
        <p class="note">
          The full new State Pension for 2025/26 is <strong>£221.20/week</strong>
          (£11,502.40/year). You can check your personal forecast at
          <a
            href="https://www.gov.uk/check-state-pension"
            target="_blank"
            rel="noopener"
          >
            gov.uk/check-state-pension
          </a>.
        </p>
      </section>

      <!-- ── 4. Coast FIRE number ────────────────────────────────────── -->
      <section class="section">
        <h2 class="section__title">
          4. The Coast FIRE number
        </h2>
        <p>
          Your <strong>Coast FIRE number</strong> is the amount you need invested
          <em>right now</em> such that — even with zero further contributions — compound
          growth alone will carry your portfolio to your FIRE number by retirement age.
          It is simply your FIRE number discounted back to today:
        </p>
        <div class="formula">
          <div class="formula__eq">
            Coast number = FIRE number ÷ (1 + r)<sup>years to retirement</sup>
          </div>
          <div class="formula__eg">
            e.g. £1,000,000 ÷ 1.05<sup>25</sup> = <strong>£295,303</strong> at 5% real,
            25 years out
          </div>
        </div>
        <p>
          Once you hit your Coast number, you can stop contributing entirely and let the
          market do the rest. You can still contribute if you like — you'll just reach your
          FIRE number ahead of schedule.
        </p>
      </section>

      <!-- ── 5. Real vs nominal returns ─────────────────────────────── -->
      <section class="section">
        <h2 class="section__title">
          5. Real vs nominal returns
        </h2>
        <p>
          All monetary values in this calculator are in <strong>today's money</strong>
          (real terms). This means:
        </p>
        <ul>
          <li>
            You enter your expected retirement expenses as what they'd cost <em>today</em>
            — you don't need to guess future inflation.
          </li>
          <li>
            The return rate you enter should be your <strong>real return</strong>: the
            nominal (headline) return minus inflation.
          </li>
          <li>
            If a global equity fund returns 7.5% per year and inflation is 2.5%, the real
            return is approximately <strong>5%</strong> — the default in this calculator.
          </li>
        </ul>
        <div class="formula">
          <div class="formula__eq">
            Real return ≈ Nominal return − Inflation
          </div>
          <div class="formula__eg">
            e.g. 7.5% − 2.5% = <strong>5% real</strong>
          </div>
        </div>
        <p class="note">
          Using real returns in a real-terms model is equivalent to using nominal returns
          with nominal future values — you just avoid having to think about inflation at
          all.
        </p>
      </section>

      <!-- ── 6. SIPP vs other investments ───────────────────────────── -->
      <section class="section">
        <h2 class="section__title">
          6. SIPP vs other investments
        </h2>
        <p>
          This calculator tracks two investment buckets separately, because they have
          different accessibility rules:
        </p>
        <table class="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Examples</th>
              <th>Accessible from</th>
              <th>Tax treatment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>SIPP / pension</strong></td>
              <td>SIPP, workplace pension</td>
              <td>Age 57 (from April 2028)</td>
              <td>Contributions tax-relieved; withdrawals taxed (25% tax-free, 75% at marginal rate)</td>
            </tr>
            <tr>
              <td><strong>Other investments</strong></td>
              <td>ISA, GIA, savings</td>
              <td>Any age</td>
              <td>ISA: tax-free growth &amp; withdrawal; GIA: CGT may apply</td>
            </tr>
          </tbody>
        </table>
        <p class="note">
          For the Coast FIRE number calculation, both buckets are counted together —
          what matters is the combined total. If you plan to retire before 57, make sure
          your "other investments" bucket alone is large enough to bridge you to SIPP
          access age.
        </p>
      </section>

      <!-- ── 7. SIPP pension tax ──────────────────────────────────────── -->
      <section class="section">
        <h2 class="section__title">
          7. SIPP pension tax
        </h2>
        <p>
          When you draw from a SIPP in flexi-access drawdown, each withdrawal is treated
          as follows under current UK rules:
        </p>
        <ul>
          <li><strong>25% is tax-free</strong> — the Pension Commencement Lump Sum (PCLS) element, applied per withdrawal.</li>
          <li><strong>75% is taxed</strong> as income at your marginal rate.</li>
        </ul>
        <p>
          This means you need to withdraw <em>more</em> than you actually want to spend,
          to cover the tax on the taxable portion. To receive a net amount <strong>X</strong>
          at a marginal rate <strong>t</strong>:
        </p>
        <div class="formula">
          <div class="formula__eq">
            Gross withdrawal W = X ÷ (1 − 0.75 × t)
          </div>
          <div class="formula__eg">
            e.g. to net £30,000 at 20% tax: £30,000 ÷ (1 − 0.15) = <strong>£35,294</strong>
          </div>
        </div>
        <p>
          If only part of your retirement pot is in a SIPP, the calculator blends the
          gross-up proportionally. Where <strong>f</strong> is the SIPP fraction at
          retirement:
        </p>
        <div class="formula">
          <div class="formula__eq">
            Gross expenses = Net expenses × [ f ÷ (1 − 0.75t) + (1 − f) ]
          </div>
        </div>
        <p>
          The SIPP fraction is computed analytically from your current values and
          contributions, projected forward to retirement at your chosen real return rate.
          The grossed-up figure is then used in place of net expenses throughout the FIRE
          number calculation — so both the bridge and the long-term pot reflect what you
          actually need to withdraw.
        </p>
        <p class="note">
          <strong>When does 0% make sense?</strong> The personal allowance is £12,570
          (2025/26). The full State Pension is ~£11,973/year — which already consumes
          nearly all of it, leaving only ~£600 of headroom for SIPP withdrawals. So once
          State Pension starts, almost any meaningful SIPP drawdown will be taxed at 20%.
          The main scenario where 0% is realistic is during the <em>bridge phase before
          State Pension Age</em>: with no State Pension income yet, you can draw up to
          ~£12,570/year from your SIPP tax-free and fund the rest from your ISA. If your
          SIPP is large, <strong>20% is the more realistic rate to set</strong> for
          post-SPA income.
          <br><br>
          <strong>Simplification:</strong> the calculator applies the same SIPP fraction
          to both phases of a two-tranche calculation. Before age 57 the SIPP isn't
          accessible, so the true bridge pot is funded entirely from other investments —
          meaning this approach slightly overstates the required total in that scenario.
        </p>
      </section>

      <!-- ── 8. Default assumptions ──────────────────────────────────── -->
      <section class="section">
        <h2 class="section__title">
          8. Default assumptions
        </h2>
        <table class="table">
          <thead>
            <tr><th>Assumption</th><th>Default</th><th>Editable?</th><th>Source</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Real annual return</td>
              <td>5%</td>
              <td>Yes</td>
              <td>Long-run global equity real return (after 2.5% inflation)</td>
            </tr>
            <tr>
              <td>Safe withdrawal rate</td>
              <td>4%</td>
              <td>Yes</td>
              <td>Trinity Study; common FIRE planning benchmark</td>
            </tr>
            <tr>
              <td>Inflation</td>
              <td>2.5%</td>
              <td>No (baked into real return)</td>
              <td>Bank of England long-run target</td>
            </tr>
            <tr>
              <td>State Pension age</td>
              <td>67</td>
              <td>Yes</td>
              <td>Current UK SPA for those born after 5 April 1960</td>
            </tr>
            <tr>
              <td>Full new State Pension</td>
              <td>£221.20/week</td>
              <td>Yes</td>
              <td>2025/26 rate</td>
            </tr>
            <tr>
              <td>Pension tax rate</td>
              <td>0%</td>
              <td>Yes</td>
              <td>Marginal income tax rate on SIPP withdrawals; set to 0 to ignore</td>
            </tr>
            <tr>
              <td>Compounding</td>
              <td>Annual, end-of-year</td>
              <td>No</td>
              <td>Conservative simplifying assumption</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="disclaimer disclaimer--footer">
        <strong>Not financial advice.</strong> Coast FIRE Calculator is an educational tool.
        Investment returns are uncertain and past performance is not a reliable indicator
        of future results. The pension tax model is a simplification — it does not account
        for the annual personal allowance, tax bands changing over time, or other income
        sources in retirement. The calculator does not account for product charges or all
        individual circumstances. Always seek independent financial advice.
      </div>

      <RouterLink
        to="/"
        class="back-link back-link--bottom"
      >
        &larr; Back to calculator
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.explainer {
  max-width: 820px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.explainer__inner {
  /* Intentionally unstyled wrapper — sections carry their own spacing */
}

.back-link {
  display: inline-block;
  font-size: 0.875rem;
  color: #6b7280;
  text-decoration: none;
  margin-bottom: 1.5rem;
}

.back-link:hover { color: #4f46e5; }

.back-link--bottom { margin-top: 2.5rem; margin-bottom: 0; }

.explainer__title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
}

.explainer__intro {
  font-size: 1.05rem;
  color: #374151;
  line-height: 1.7;
  margin: 0 0 1.5rem;
}

/* ── Disclaimer ──────────────────────────────────────────────────────── */

.disclaimer {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 0.85rem 1rem;
  border-radius: 0 6px 6px 0;
  font-size: 0.875rem;
  color: #78350f;
  margin-bottom: 2.5rem;
  line-height: 1.5;
}

.disclaimer--footer {
  margin-top: 2.5rem;
  margin-bottom: 0;
}

/* ── Sections ─────────────────────────────────────────────────────────── */

.section {
  margin-bottom: 3rem;
}

.section__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.section p {
  color: #374151;
  line-height: 1.7;
  margin: 0.75rem 0;
}

.section ul {
  color: #374151;
  line-height: 1.7;
  padding-left: 1.4rem;
  margin: 0.75rem 0;
}

.section ul li { margin-bottom: 0.35rem; }

/* ── Formula blocks ───────────────────────────────────────────────────── */

.formula {
  background: #f5f3ff;
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin: 1rem 0;
}

.formula--sm {
  background: #f8fafc;
  border-color: #e5e7eb;
  padding: 0.65rem 1rem;
}

.formula__eq {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
  color: #4f46e5;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.formula--sm .formula__eq {
  font-size: 0.82rem;
  color: #374151;
}

.formula__eg {
  font-size: 0.85rem;
  color: #6b7280;
}

/* ── Two-column layout ────────────────────────────────────────────────── */

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin: 1rem 0;
}

@media (max-width: 600px) {
  .two-col { grid-template-columns: 1fr; }
}

.two-col__item {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.two-col__label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #4f46e5;
  margin-bottom: 0.5rem;
}

.two-col__item p {
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
}

/* ── Table ────────────────────────────────────────────────────────────── */

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin: 1rem 0;
}

.table th {
  background: #f3f4f6;
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  vertical-align: top;
}

.table tr:last-child td { border-bottom: none; }

/* ── Note ─────────────────────────────────────────────────────────────── */

.note {
  font-size: 0.85rem !important;
  color: #6b7280!important;
  background: #f9fafb;
  border-left: 3px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  border-radius: 0 4px 4px 0;
}

.note a { color: #4f46e5; }
.note a:hover { text-decoration: underline; }
</style>

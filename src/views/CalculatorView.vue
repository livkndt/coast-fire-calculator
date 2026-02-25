<template>
  <div class="calculator">
    <div class="calculator__layout">

      <!-- ── Form ──────────────────────────────────────────────────── -->
      <form class="calculator__form" @submit.prevent>

        <section class="form-section">
          <h2 class="form-section__title">About you</h2>
          <div class="form-row">
            <label class="form-label" for="currentAge">Current age</label>
            <input
              id="currentAge"
              v-model.number="inputs.currentAge"
              type="number" min="16" max="100" step="1"
              class="form-input form-input--short"
            />
          </div>
          <div class="form-row">
            <label class="form-label" for="retirementAge">Target retirement age</label>
            <input
              id="retirementAge"
              v-model.number="inputs.retirementAge"
              type="number" min="16" max="100" step="1"
              class="form-input form-input--short"
            />
          </div>
        </section>

        <section class="form-section">
          <h2 class="form-section__title">Current investments</h2>
          <div class="form-row">
            <label class="form-label" for="currentSipp">
              Private pension / SIPP
              <span class="form-label__hint">Locked until age 57</span>
            </label>
            <div class="form-input-prefix">
              <span class="form-input-prefix__symbol">£</span>
              <input
                id="currentSipp"
                v-model.number="inputs.currentSippValue"
                type="number" min="0" step="1000"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-row">
            <label class="form-label" for="currentOther">
              Other investments
              <span class="form-label__hint">ISA, GIA, savings</span>
            </label>
            <div class="form-input-prefix">
              <span class="form-input-prefix__symbol">£</span>
              <input
                id="currentOther"
                v-model.number="inputs.currentOtherInvestments"
                type="number" min="0" step="1000"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h2 class="form-section__title">Monthly contributions</h2>
          <div class="form-row">
            <label class="form-label" for="monthlySipp">Private pension / SIPP</label>
            <div class="form-input-prefix">
              <span class="form-input-prefix__symbol">£</span>
              <input
                id="monthlySipp"
                v-model.number="inputs.monthlyContributionSipp"
                type="number" min="0" step="50"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-row">
            <label class="form-label" for="monthlyOther">Other investments</label>
            <div class="form-input-prefix">
              <span class="form-input-prefix__symbol">£</span>
              <input
                id="monthlyOther"
                v-model.number="inputs.monthlyContributionOther"
                type="number" min="0" step="50"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h2 class="form-section__title">Retirement spending</h2>
          <div class="form-row">
            <label class="form-label" for="expenses">
              Annual expenses in retirement
              <span class="form-label__hint">Today's money</span>
            </label>
            <div class="form-input-prefix">
              <span class="form-input-prefix__symbol">£</span>
              <input
                id="expenses"
                v-model.number="inputs.annualRetirementExpenses"
                type="number" min="0" step="1000"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h2 class="form-section__title">State pension</h2>
          <div class="form-row form-row--toggle">
            <label class="form-label" for="includeSP">Include State Pension?</label>
            <label class="toggle">
              <input
                id="includeSP"
                v-model="inputs.includeStatePension"
                type="checkbox"
                class="toggle__input"
              />
              <span class="toggle__track"></span>
            </label>
          </div>
          <template v-if="inputs.includeStatePension">
            <div class="form-row">
              <label class="form-label" for="spAge">State Pension age</label>
              <input
                id="spAge"
                v-model.number="inputs.statePensionAge"
                type="number" min="55" max="75" step="1"
                class="form-input form-input--short"
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="spWeekly">
                Weekly State Pension amount
                <span class="form-label__hint">Full new SP 2025/26: £221.20</span>
              </label>
              <div class="form-input-prefix">
                <span class="form-input-prefix__symbol">£</span>
                <input
                  id="spWeekly"
                  v-model.number="inputs.statePensionWeeklyAmount"
                  type="number" min="0" step="0.01"
                  class="form-input"
                />
              </div>
            </div>
          </template>
        </section>

        <section class="form-section form-section--advanced">
          <details>
            <summary class="form-section__title form-section__title--summary">
              Advanced assumptions
            </summary>
            <div class="form-row" style="margin-top:1rem">
              <label class="form-label" for="returnRate">
                Real annual return rate
                <span class="form-label__hint">After inflation, default 5%</span>
              </label>
              <div class="form-input-suffix">
                <input
                  id="returnRate"
                  v-model.number="inputs.realAnnualReturnRate"
                  type="number" min="0" max="20" step="0.1"
                  class="form-input form-input--short"
                />
                <span class="form-input-suffix__symbol">%</span>
              </div>
            </div>
            <div class="form-row">
              <label class="form-label" for="swr">
                Safe withdrawal rate
                <span class="form-label__hint">Default 4%</span>
              </label>
              <div class="form-input-suffix">
                <input
                  id="swr"
                  v-model.number="inputs.safeWithdrawalRate"
                  type="number" min="0.1" max="20" step="0.1"
                  class="form-input form-input--short"
                />
                <span class="form-input-suffix__symbol">%</span>
              </div>
            </div>
          </details>
        </section>

      </form>

      <!-- ── Results ────────────────────────────────────────────────── -->
      <aside class="calculator__results">
        <div class="results-card" :class="{ 'results-card--coasted': results.hasCoasted }">

          <div v-if="results.hasCoasted" class="results-coasted-banner">
            🎉 You've already coasted!
          </div>

          <dl class="results-list">
            <div class="results-item">
              <dt class="results-item__label">FIRE number</dt>
              <dd class="results-item__value">{{ fmt(results.fireNumber) }}</dd>
              <dd class="results-item__sub">Total pot needed at retirement</dd>
            </div>

            <div class="results-item">
              <dt class="results-item__label">Coast FIRE number</dt>
              <dd class="results-item__value results-item__value--highlight">
                {{ fmt(results.coastFireNumber) }}
              </dd>
              <dd class="results-item__sub">What you need invested today to coast</dd>
            </div>

            <div class="results-item">
              <dt class="results-item__label">Current total</dt>
              <dd class="results-item__value">{{ fmt(results.currentTotal) }}</dd>
              <dd class="results-item__sub">SIPP + other investments</dd>
            </div>

            <div class="results-item" :class="{ 'results-item--positive': results.hasCoasted }">
              <dt class="results-item__label">
                {{ results.hasCoasted ? 'Surplus' : 'Gap to coast' }}
              </dt>
              <dd class="results-item__value">
                {{ results.hasCoasted ? fmt(results.currentTotal - results.coastFireNumber) : fmt(results.amountToCoast) }}
              </dd>
              <dd class="results-item__sub">
                {{ results.hasCoasted
                  ? 'You\'re past the Coast FIRE number'
                  : 'Additional investment needed to reach coast' }}
              </dd>
            </div>

            <template v-if="!results.hasCoasted">
              <div class="results-item" v-if="results.projectedCoastAge !== null">
                <dt class="results-item__label">Projected coast age</dt>
                <dd class="results-item__value results-item__value--accent">
                  Age {{ results.projectedCoastAge }}
                  <span class="results-item__year">({{ results.projectedCoastYear }})</span>
                </dd>
                <dd class="results-item__sub">
                  {{ results.projectedCoastAge! - inputs.currentAge }} year{{
                    results.projectedCoastAge! - inputs.currentAge === 1 ? '' : 's'
                  }} from now
                </dd>
              </div>
              <div class="results-item results-item--muted" v-else>
                <dt class="results-item__label">Projected coast</dt>
                <dd class="results-item__value">Not reached</dd>
                <dd class="results-item__sub">
                  Coast number not reached before retirement at current contribution rate
                </dd>
              </div>
            </template>
          </dl>

          <p class="results-disclaimer">
            All values in today's money (real terms).
            <RouterLink to="/explainer">How this works →</RouterLink>
          </p>
        </div>
      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCalculatorStore } from '@/stores/calculator'

const store = useCalculatorStore()
const { inputs, results } = storeToRefs(store)

function fmt(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<style scoped>
.calculator {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.calculator__layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 768px) {
  .calculator__layout {
    grid-template-columns: 1fr;
  }
}

/* ── Form ──────────────────────────────────────────────────────────── */

.form-section {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.form-section--advanced {
  padding: 0;
}

.form-section--advanced details {
  padding: 1.25rem 1.5rem;
}

.form-section__title {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin: 0 0 1rem;
}

.form-section__title--summary {
  cursor: pointer;
  user-select: none;
  margin: 0;
  list-style: none;
}

.form-section__title--summary::-webkit-details-marker { display: none; }

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.form-row:last-child { border-bottom: none; }

.form-row--toggle { align-items: center; }

.form-label {
  font-size: 0.95rem;
  color: #374151;
  flex: 1;
}

.form-label__hint {
  display: block;
  font-size: 0.78rem;
  color: #9ca3af;
  margin-top: 2px;
}

.form-input {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.95rem;
  color: #1a1a2e;
  background: #fafafa;
  transition: border-color 0.15s;
  width: 140px;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  background: #fff;
}

.form-input--short { width: 80px; }

.form-input-prefix,
.form-input-suffix {
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-input-prefix__symbol,
.form-input-suffix__symbol {
  font-size: 0.9rem;
  color: #9ca3af;
  user-select: none;
}

/* Toggle switch */
.toggle { display: flex; align-items: center; cursor: pointer; }
.toggle__input { position: absolute; opacity: 0; width: 0; height: 0; }
.toggle__track {
  width: 44px; height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;
}
.toggle__track::after {
  content: '';
  position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle__input:checked + .toggle__track { background: #4f46e5; }
.toggle__input:checked + .toggle__track::after { transform: translateX(20px); }

/* ── Results ───────────────────────────────────────────────────────── */

.calculator__results {
  position: sticky;
  top: 1.5rem;
}

.results-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.results-card--coasted {
  border-color: #10b981;
}

.results-coasted-banner {
  background: #ecfdf5;
  color: #065f46;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  margin-bottom: 1.25rem;
  text-align: center;
}

.results-list {
  margin: 0;
  padding: 0;
}

.results-item {
  padding: 0.85rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.results-item:last-child { border-bottom: none; }

.results-item__label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9ca3af;
  margin-bottom: 0.15rem;
}

.results-item__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
  margin: 0;
}

.results-item__value--highlight { color: #4f46e5; }
.results-item__value--accent    { color: #0891b2; }

.results-item--positive .results-item__value { color: #10b981; }

.results-item__year {
  font-size: 0.95rem;
  font-weight: 400;
  color: #6b7280;
}

.results-item__sub {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0.15rem 0 0;
}

.results-item--muted .results-item__value {
  font-size: 1.1rem;
  color: #9ca3af;
}

.results-disclaimer {
  font-size: 0.75rem;
  color: #d1d5db;
  margin: 1rem 0 0;
  text-align: center;
}

.results-disclaimer a { color: #9ca3af; }
.results-disclaimer a:hover { color: #4f46e5; }
</style>

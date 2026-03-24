# Coast FIRE Calculator — project context

## Stack

- **Vue 3** Composition API + `<script setup lang="ts">`
- **TypeScript** strict mode
- **Pinia** setup-store style (`defineStore` with `() => { ... }`)
- **Vitest** + `@vue/test-utils` + jsdom
- **Webpack 5** + webpack-dev-server v5
- **Chart.js** + vue-chartjs
- Path alias: `@/` → `src/`

## Workflow

- **TDD always**: write failing tests first (RED), then implement (GREEN). Never write implementation before tests exist.
- Run tests after every implementation step. Do not move on if tests are red.

## Build & performance

- Vendor chunks: `vendor-chart` (Chart.js + vue-chartjs + @kurkle) and `vendor-framework` (Vue + Pinia + Router) — split so app-only deploys don't bust vendor cache
- `sideEffects` in `package.json` is `["**/*.css", "**/*.vue"]`, **not** `false` — setting it to `false` silently drops all CSS from the dist (MiniCssExtractPlugin treats CSS as a side effect)
- Performance budgets: `maxAssetSize 200KB`, `maxEntrypointSize 300KB` — sized for current vendor chunks; a breach fails `npm run build` and therefore CI
- Lighthouse CI (`npm run lhci`) asserts only on category scores (`categories:performance >= 0.9`, etc.), not individual audits — individual audits are environment-sensitive on lhci's local static server
- `npm run analyse` opens an interactive bundle treemap (webpack-bundle-analyzer)

## Project conventions

- All monetary values in **real terms** (today's money) — never nominal
- Rates as plain numbers: `5` means 5%, not `0.05`
- Pure functions extracted from components and composables, exported separately so they can be unit-tested without mounting anything
- No over-engineering: minimum complexity for the current task
- No docstrings or comments on code that wasn't changed
- Scoped CSS in Vue SFCs — no external CSS framework

## File layout

```
src/
  core/          # Pure TS calculation functions
  components/    # Vue SFCs (InfoTooltip, ProjectionChart)
  views/         # CalculatorView, ExplainerView
  stores/        # calculator.ts (Pinia)
  composables/   # useChartData.ts, useExport.ts
  router/        # Vue Router (history mode)
  types/         # CoastFireInputs, CoastFireResult
tests/
  core/          # Unit tests mirroring src/core/
  stores/        # Store tests
  composables/   # Composable tests
  components/    # Component tests
  integration/   # End-to-end scenario tests
```

## Test conventions

- Test files mirror source layout under `tests/`
- Shared fixture objects with per-test spread overrides
- `toBeCloseTo(value, precision)` for floating-point financial values
- Integration tests in `tests/integration/` exercise the full calculation pipeline with real user values
- Don't test Vue/Pinia internals — only application logic
- Prefer testing pure functions directly; only mount Vue components when testing DOM behaviour or user interaction

## UK financial domain

- SIPP locked until age 57 (rising from 55, April 2028)
- Other investments (ISA, GIA, savings): accessible any age
- State Pension Age default: 67
- Full new State Pension 2025/26: £230.25/week (£11,973.00/year)
- Two-tranche FIRE number when retiring before SPA: bridge (PV of annuity for gap years) + discounted long-term pot
- Coast FIRE formula: `coastNumber = fireNumber / (1 + r)^yearsToRetirement`
- Annual compounding; end-of-year contributions

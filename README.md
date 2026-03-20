# Coast FIRE Calculator

A UK-focused Coast FIRE calculator that works in real terms (today's money). Enter your current savings, planned contributions, and target retirement expenses — the calculator tells you your FIRE number, your Coast FIRE number, and projects the year you can stop contributing and let compound growth do the rest.

## What is Coast FIRE?

Coast FIRE is the point at which your invested assets are large enough that — without any further contributions — they will grow to your full FIRE number by your target retirement age. Once you've "coasted", you only need to cover living expenses, not save for retirement.

## Features

- **Two-tranche FIRE number** — separately accounts for the pre-State Pension gap years and the long-term pot, giving an accurate target for UK early retirees
- **SIPP + other investments** — tracks pension (locked until 57) and accessible investments (ISA, GIA, savings) separately
- **State Pension integration** — optional State Pension income reduces your required pot
- **Year-by-year projection chart** — shows portfolio growth and the point your savings cross the Coast FIRE line
- **CSV export and copy-to-clipboard** — share or save your projection data
- **All values in real terms** — no inflation distortion; every number is in today's money

## UK defaults

| Setting | Default |
|---|---|
| State Pension Age | 67 |
| Full new State Pension (2025/26) | £230.25/week |
| Real annual return | 5% |
| Inflation | 2.5% |
| Safe withdrawal rate | 4% |
| SIPP access age | 57 |

## Development

```bash
npm install

# Dev server (hot reload)
npm run dev

# Production build
npm run build

# Unit tests
npm test

# Unit tests (watch mode)
npm run test:watch

# E2E tests (requires production build)
npm run build && npm run test:e2e

# Lint
npm run lint

# Type check
npm run typecheck
```

## Stack

- Vue 3 (Composition API + `<script setup>`)
- TypeScript (strict)
- Pinia
- Chart.js + vue-chartjs
- Webpack 5
- Vitest + @vue/test-utils (unit tests)
- Playwright (E2E tests)
- Deployed on Vercel

## Project structure

```
src/
  core/          # Pure TS calculation functions (FIRE number, coast number, projection)
  components/    # Vue SFCs (InfoTooltip, ProjectionChart)
  views/         # CalculatorView, ExplainerView
  stores/        # Pinia store (calculator.ts)
  composables/   # useChartData, useExport
  router/        # Vue Router (history mode)
  types/         # CoastFireInputs, CoastFireResult
tests/
  core/          # Unit tests mirroring src/core/
  stores/        # Store tests
  composables/   # Composable tests
  components/    # Component tests
  integration/   # Full pipeline scenario tests
  e2e/           # Playwright browser tests
```

# SKH Nimbus

Parts check-out station for the Sengkang General Hospital Biomedical Engineering store room. Every part drawn becomes a loan against a work order and stays on a live ledger until the job closes.

One React app, two switchable experiences from the Figma file ([SKH Nimbus – Check-out Station UI](https://www.figma.com/design/aOVNtU9b0uaK4qXiPVYoiX/SKH-Nimbus---Check-out-Station-UI?node-id=0-1)):

| Experience | Theme | Figma frames |
| --- | --- | --- |
| **Parts Quest** (Alt A) | Dark game HUD: XP, combos, ranks, missions | A1–A12 |
| **Nimbus Weather** (Alt B) | Light sky: suns, rain clouds, Partdex stickers | B1–B12 |

The switch on the home screen flips between them, like a night/day toggle. The choice is saved in `localStorage`. Add `?exp=quest` or `?exp=nimbus` to any URL to override it for one visit.

## Getting started

```bash
npm install
npm run dev
```

There is no backend yet. A mock API ([MSW](https://mswjs.io)) runs in the browser in every build and holds the stock ledger in memory, so a reload resets the data. Set `VITE_MOCK_API=off` to turn it off once a real API exists.

Demo switches for error states: `?fail=face`, `?fail=card`, `?fail=led` (combine with commas). A barcode scanner works as a keyboard: type a barcode such as `880012` and press Enter while drawing parts.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 5173 |
| `npm run build` | Typecheck and production build |
| `npm run lint` | oxlint |
| `npm test` | Vitest unit and component tests |
| `npm run test:e2e` | Playwright end-to-end tests (builds and serves the app) |

## How it fits together

```
src/
  core/            Framework-light domain logic, shared by both experiences
    domain/        Types, seed data, Local Stock Ledger rules (overdue, room health, reorder flags)
    workflow/      Check-out state machine (pure reducer) and its Zustand store
    gamification/  Event bus, reward rules (XP and suns), private per-user progress
    services/      Station hardware interfaces with mocks: Face ID, card reader, barcode scanner, LED strip, feedback
    api/           Typed API client
  mocks/           MSW handlers over an in-memory ledger
  app/             Router, experience store, theme tokens, workflow actions and view models
  ui/              Shared components: HoldButton, ShelfMap, ExperienceToggle, QtyStepper, notices, confetti
  experiences/
    quest/         Parts Quest screens A1–A12
    nimbus/        Nimbus Weather screens B1–B12
```

**Routes are experience-neutral.** [`src/app/routes.ts`](src/app/routes.ts) lists 14 screen ids (idle, sign-in, loans, work orders, draw, locate, scan, confirm, success, close job, stats, team, parts out). Each route is guarded by workflow state. Each experience supplies a component per screen id, or an alias where it folds two steps into one screen (Quest shows overdue loans on its quest board; Nimbus suggests, searches and scans on one Grab parts screen).

**The workflow drives navigation.** Screens call actions in [`src/app/actions.ts`](src/app/actions.ts), which talk to the hardware and the API and send events to the [state machine](src/core/workflow/machine.ts). When the state changes, the app moves to that state's screen.

**Gamification is an event bus.** Actions emit `part.scanned`, `loan.confirmed`, `loan.closed` and `session.ended`. The same events give XP in Quest and suns in Nimbus. Stats are private to the signed-in user; team views show only totals.

**Theming is CSS variables.** Tailwind utilities like `bg-surface` and `text-accent` read variables set under `[data-experience="quest"]` and `[data-experience="nimbus"]` in [`src/app/theme.css`](src/app/theme.css). The current values are placeholders until they are synced from the Figma variables.

**Motion.** Motion for UI animation, SVG and CSS for the shelf map and hold ring, canvas-confetti for celebrations. Everything respects `prefers-reduced-motion`.

## Sessions

A signed-in user stays signed in after confirming a loan or closing a job, and can start another job straight away. The session ends only when they press **Sign out**. If they go idle with unconfirmed parts in their list, the station shows a warning but does not sign them out. This replaces the plan's automatic logout after confirm or timeout.

## Open points from the plan

These are still undecided and are configurable in code: overdue threshold (`OVERDUE_AFTER_HOURS`, 48 h), the idle time before the unconfirmed-parts warning (`IDLE_TIMEOUT_MS`), reward values and rank thresholds (`src/core/gamification/rules.ts`), and whether the overdue reminder must be resolved before drawing (currently dismissible).

# Frontend take-home: Market Pulse

Build confidence in a small, live-updating market screen used in both a web app
and an Electron renderer.

## Timebox

Please spend **no more than 90 minutes**. We expect a strong submission to take
about 60–75 minutes. We value sensible prioritisation, so document anything you
would do next rather than running over time.

## Getting started

Requirements: Node.js 20.19+ (or 22.12+) and Yarn 1.x.

```bash
yarn
yarn dev
```

Useful commands:

```bash
yarn test
yarn build
```

The app uses local deterministic mocks. It requires no backend, credentials, or
running Electron process.

## Scenario and test harness

Market Pulse displays live bid/ask indications for two trading desks. The page
mostly works, but a recent refactor introduced correctness and rendering
problems. The same renderer is hosted on the web and in an Electron companion
app. In Electron, a narrow preload bridge can ask the renderer to focus a
market.

All data is local. The mock market feed sends one quote update roughly every
1.2 seconds. The `External Data API` panel can also send a two-market update
burst, while the `Electron` panel simulates events from the desktop host. The
small `rN` badge on each market row is that row's render count.

## Part 1 — Make the live screen correct and efficient

### Description

The market list is driven by a mock live feed for the selected trading desk.
The header also contains a one-second clock so unrelated parent renders are easy
to observe. Use `Send update burst` to emit two market updates synchronously and
use each row's `rN` badge to see when that row renders.

### Your task

Diagnose and fix these three problem areas.

#### 1A. Desk subscriptions and live updates

- Switching between Atlantic and Pacific immediately shows that desk's markets.
  The five rows should be replaced; rows from the previous desk must not remain.
- Only the selected desk should have an active feed subscription. Switching desks
  must dispose the previous subscription and attach the new one.
- It is acceptable to reload a desk's deterministic starting snapshot when the
  user returns to it. You do not need to retain updates while a desk is hidden.

Use `Send update burst` to exercise rapid updates. One click synchronously sends
updates for two different markets in the selected desk. Both changes must be
present after the burst; applying the second update must not undo the first.
Burst values are deterministic absolute values, not increments, so clicking the
button repeatedly will produce the same prices.

#### 1B. Delayed sort change presentation

Changing the sort mode must reorder the rows immediately. The UI must not wait
for the next quote, clock tick, or unrelated interaction before reflecting the
selected sort.

#### 1C. Render isolation

Use each row's `rN` badge to observe renders. After initialisation:

- the one-second header clock must not increment any unchanged row's badge;
- when the feed changes one quote, only that quote's row may increment;
- selecting a row may legitimately rerender rows whose selected state changes.

Do not remove or bypass the render diagnostic.

Optimise the measured path, not the entire application. We are interested in
how you reason about state snapshots, effect lifetimes, dependencies, and prop
identity.

## Part 2 — Add one small product improvement

### Description

This part gives you a small amount of product and design freedom. We want to see
how you improve a live market screen when the implementation is not fully
specified.

### Your task

#### 2A. Product improvement

Make one focused improvement that helps a user scan or operate the rapidly
moving market list. Keep this to roughly 15 minutes. Examples include, but are
not limited to:

- a useful way to pin or focus markets;
- an accessible indication of price movement;
- a compact/density control;
- keyboard navigation;
- a particularly thoughtful empty or no-results state.

There is a placeholder in `CandidateEnhancement.tsx`, but you may work anywhere
that makes sense. We care about judgement and finish more than scope. Implement
one idea well rather than several partially.

## Part 3 — Fix the simulated Electron integration

### Description

Electron desktop applications normally have two different security contexts:

- the **main process** is trusted and can use Electron and Node APIs;
- the **renderer** runs React and should behave like a normal browser page.

A small **preload bridge** sits between them. It exposes an intentionally narrow,
typed API to the renderer instead of giving React direct access to Electron's
`ipcRenderer` or Node:

```text
Electron main process -- IPC --> preload bridge --> window.marketDesktop --> React
```

This repository contains only the React renderer. You do **not** need to install
Electron or write main/preload code. In the browser, `desktopBridgeMock.ts`
installs a mock with the same `window.marketDesktop` contract that a production
preload script would expose.

The two panels below the workspace simulate integrations that would normally
live outside React. The environment selector above the app chooses whether the
Electron preload bridge is available:

| Area | Control or diagnostic | What it represents |
| --- | --- | --- |
| `Electron` | `Focus last market` | The Electron main process sends the ID of the last currently visible market to the renderer over IPC. |
| `Electron` | `Active listeners` | The number of renderer callbacks currently attached to the host event. |
| `Electron` | `Registrations` | The total number of callbacks registered during this page session. This count is cumulative. |
| `Electron` | `Unmount renderer` | The React owner of the subscription is removed, as if the desktop view were closed. |
| `External Data API` | `Send update burst` | An external market-data service delivers two quote updates synchronously. |
| `Environment selection` | `Web` / `Desktop` | Reloads the app with or without `window.marketDesktop`. The selector remains available even if the React renderer fails. |

### Your task

Fix the renderer-side subscription to the desktop market-focus event. The bridge
mock and its counters are test fixtures; do not change them or the integration
panels to hide listener behaviour.

Useful starting points are `useDesktopMarketFocus.ts`, which attaches the host
listener; `App.tsx`, which decides whether an incoming market ID can be selected;
and `desktop.d.ts`, which defines the preload contract consumed by React.

You are fixing how React consumes this contract. You are not being asked to
implement Electron IPC, a preload script, or the mock itself.

#### 3A. Listener lifecycle

The counters in the `Electron` panel must follow this sequence:

| Action | Active listeners | Registrations |
| --- | ---: | ---: |
| First mount | 1 | 1 |
| Clock ticks, quote updates, or other UI interactions | 1 | 1 |
| Unmount renderer | 0 | 1 |
| Mount renderer again | 1 | 2 |
| Unmount renderer again | 0 | 2 |

Desk changes, filtering, sorting, and row selection must not register replacement
listeners. Repeating the mount/unmount cycle may increase the cumulative
registration count once per mount, but it must never accumulate active listeners.

#### 3B. Current renderer state

After fixing Part 1, switch to Pacific and click `Focus last market`. The market
named beside `Selected` must match the last currently visible Pacific row. The
host event must not use state captured during the initial Atlantic render.

#### 3C. Renderer boundary

We sometimes run the same frontend directly in a web browser and inside an
Electron wrapper. The wrapper supplies `window.marketDesktop` through its preload
bridge; the web version does not have that API. Core application functionality
must work in both environments, so renderer code must handle the desktop API not
being present.

- Select `Web` under `Environment selection` to reload without
  `window.marketDesktop`. The starter displays a visible renderer error in this
  mode. Fix the underlying failure so the market screen remains usable and the
  `Electron` panel shows `0` active listeners and `0` registrations. The
  `External Data API` controls must continue to work.
- Select `Desktop` to return to the simulated Electron environment. After the
  reload, the listener lifecycle in 3A must work again.
- `Desktop` is selected by default. You can complete 3A and 3B before working on
  the web fallback, and the environment selector remains available if the
  renderer fails.
- Renderer code must continue to use the typed preload API. Do not import Electron,
  `ipcRenderer`, or Node APIs into React components.

You can also open `/?environment=web` directly to start in the web environment.

## Tests and notes

Add at least one focused test for behaviour you fixed. You do not need exhaustive
coverage.

Complete [SUBMISSION.md](./SUBMISSION.md) with brief notes about your changes,
your product improvement, and the Electron boundary. Concise answers are fine.

You may reorganise the starter code. Avoid adding production dependencies unless
they materially improve your solution and you explain why.

## Submission

1. Fork this repository into your own GitHub or GitLab namespace.
2. Commit and push your solution to the fork.
3. Send us the repository URL and identify the branch to review.
4. If the fork is private, grant the reviewer access.

Please make sure `yarn test` and `yarn build` run from a fresh clone.

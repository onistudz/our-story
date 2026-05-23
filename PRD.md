# PRD — Couple Date Counter PWA

## Problem Statement

Couples want a personal, always-accessible reminder of how long they have been together. Generic calendar apps and anniversary reminders are impersonal and buried inside notification feeds. There is no simple, beautiful, dedicated surface that celebrates the relationship milestone continuously and can be installed on a phone like a native app — for free, without an app store.

## Solution

A Progressive Web App (PWA) hosted on a free static platform (GitHub Pages or Vercel) that displays a live, elegantly designed counter counting every day, hour, minute, and second since the couple's start date. The app works offline, is installable to Android and iOS home screens, and requires zero backend infrastructure. The design is warm, pink, and playful — built to feel like a gift rather than a utility.

## User Stories

1. As a partner, I want to see the total number of days we have been together, so that I feel the weight and beauty of our time shared.
2. As a partner, I want to see a breakdown of years, months, and days, so that I can quickly grasp the human-readable duration of our relationship.
3. As a partner, I want to see a live ticking clock (HH:MM:SS), so that the counter feels alive and real-time rather than static.
4. As a partner, I want the start date displayed on screen, so that the milestone date is always visible and meaningful.
5. As a partner, I want the page to have a warm, pink, elegant aesthetic, so that it feels like a personal love token rather than a dashboard.
6. As a partner, I want subtle animated hearts and sparkles floating in the background, so that the page has life and charm.
7. As a partner, I want to install the app to my Android home screen, so that I can open it with one tap like a native app.
8. As a partner, I want the app to work offline after the first load, so that the counter is always accessible even without internet.
9. As a partner, I want the counter to update every second without a page reload, so that the experience is seamless and continuous.
10. As a partner sharing the URL, I want the page to be publicly accessible on the internet, so that both of us can open it on any device.
11. As a partner on a small phone, I want the layout to be fully responsive, so that nothing is clipped or overflowing on small screens.
12. As a developer deploying this, I want the entire app to be zero-dependency static files, so that hosting is permanently free with no runtime costs.
13. As a developer, I want a service worker to cache all assets on first load, so that subsequent loads are instant and work offline.
14. As a developer, I want the PWA manifest to include the app name, theme color, and icon references, so that "Add to Home Screen" produces a polished icon and splash screen.

## Implementation Decisions

### Modules

**Counter Engine**
- Pure function that takes a fixed start date and the current `Date` and returns: total days elapsed, and a calendar breakdown (years, months, days remaining).
- The breakdown uses calendar-correct subtraction: adjust for day underflow by borrowing from the previous month, then adjust for month underflow by borrowing from the previous year.
- No external libraries — native `Date` arithmetic only.

**Tick Loop**
- A `setInterval` at 1 000 ms drives the counter and the live clock.
- On each tick, the counter engine is called and the DOM is updated in-place (no re-render of the full page).

**Animation Layer**
- CSS: animated gradient background using `background-position` keyframes.
- JS: a spawner function creates floating emoji elements (`🩷 💕 ✨ 🌸 💗 💝`) with randomised horizontal position, duration, size, and delay; each element removes itself from the DOM after its animation completes.
- Initial burst of 12 hearts on load, then one new heart every 1 800 ms.

**PWA Shell**
- `manifest.json`: name, short name, theme color (`#f4a7b9`), background color, display mode (`standalone`), orientation (`portrait`), icon references (192 × 192 and 512 × 512 PNG).
- `sw.js`: install event pre-caches `[/, /index.html, /manifest.json]`; activate event purges old caches; fetch event serves from cache with network fallback.
- Registration guarded by `'serviceWorker' in navigator` feature detection.

### Architectural Decisions

- **Single-file HTML**: all CSS and JS are inlined in `index.html` to minimise the asset graph and simplify deployment.
- **No build step**: the project is plain HTML/CSS/JS — no bundler, no transpiler, no package manager. Deployable by dragging a folder.
- **Start date is hardcoded**: the date `2024-01-02` is embedded at the top of the script block. Changing it requires editing one constant.
- **Static hosting**: GitHub Pages or Vercel free tier. No server-side code, no database, no API.
- **Fonts from Google Fonts**: Playfair Display (serif, romantic) for numbers and headings; Lato (sans-serif, clean) for labels and the clock.
- **Glassmorphism card**: semi-transparent white card with `backdrop-filter: blur` over the gradient background.

## Testing Decisions

**What makes a good test here**: test the counter engine as a pure function — given a fixed start date and a mocked current date, assert the returned years/months/days/totalDays values. Do not test DOM manipulation or CSS animations; those are presentation details.

**Modules to test:**
- **Counter Engine** (the `calcDiff` function): unit tests covering —
  - Same day as start (0 days)
  - Exactly 1 year later
  - Month boundary rollover (e.g. start Jan 31, now Feb 28)
  - Leap year February edge case
  - A known real date (e.g. start 2024-01-02, now 2026-05-23 → 2 years 4 months 21 days, 872 total days)

**Not tested:**
- DOM updates, animation spawner, service worker registration — these require a browser environment and are better validated by visual inspection.

## Out of Scope

- User accounts or authentication
- Editable start date via UI (requires a settings screen and persistence)
- Push notifications or daily reminder alerts
- Multiple couples or multiple counters
- Photo of the couple as background (can be added later as a CSS `background-image`)
- Native Android widget (KWGT or Jetpack Glance) — possible future enhancement
- iOS shortcut / Siri integration
- Sharing / social card generation (Open Graph meta)
- Dark mode

## Further Notes

- Icons (`icon-192.png`, `icon-512.png`) must be added manually before the PWA manifest is fully valid. Recommended: generate from a 🩷 emoji at favicon.io.
- The counter is computed entirely client-side from a hardcoded date — no privacy concerns, no data leaves the device.
- The gradient animation and floating hearts are CSS/JS-only, no canvas or WebGL — performant on low-end phones.
- Deployment to GitHub Pages: push repo → Settings → Pages → Deploy from `main` branch root.
- Deployment to Vercel: drag the project folder to vercel.com or run `vercel --prod` from the directory.

# Copilot Instructions

## Current repository state

This repository is still at the planning stage. `README.md` gives the short project summary, and `live-tweeting-maker-plan.md` is the detailed product and implementation plan. No application scaffold is checked in yet: there is no `package.json`, Vite config, TypeScript config, test runner config, or linter config.

## Build, test, and lint

No build, test, or lint commands are defined in the checked-in repository yet. There is also no single-test command available until the planned frontend scaffold exists.

## High-level architecture

- The target product is a browser-only web app for creating timestamped live-tweet style commentary while watching archived video after missing the real-time broadcast.
- The implementation plan calls for React + Vite + TypeScript, Tailwind CSS, and Lucide React.
- Data storage is intentionally local and browser-native: persist posts in `localStorage`, and use browser file APIs (`Blob`, `FileReader`) for export/import.
- The timer is the core domain feature:
  1. start after a visible countdown,
  2. display elapsed time as `HH:MM:SS`,
  3. support offset corrections such as `+1s`, `-1s`, `+10s`, `-10s`,
  4. stamp each submitted post with the current adjusted timer value.
- The plan explicitly expects timer logic to be isolated in a dedicated custom hook (`useTimer`) instead of being spread across UI components.
- The main UI shape is: header with import/export actions, a prominent timer and timer controls, a scrollable timeline of posts, and a fixed composer at the bottom so posting is always available.
- Deployment is intended for static hosting such as GitHub Pages. Keep the app serverless and browser-complete.

## Key conventions

- Do not introduce backend services, remote storage, or server-required features unless the user explicitly changes the project scope.
- Treat the timer as the source of truth for timestamps. Offset adjustments must affect future recorded timestamps consistently.
- Persist timeline changes automatically to `localStorage`. The plan assumes a page reload restores saved data, while the timer itself is restored in a stopped state.
- Keep the posting UI always accessible as a fixed input area rather than a form that scrolls out of view.
- Character counting should follow the X/Twitter-oriented guideline in the plan: roughly 140 full-width or 280 half-width characters.
- Import/export is a primary workflow, not an afterthought. Prefer data structures that round-trip cleanly through browser file import/export.
- The existing project language is Japanese. Preserve domain terms from the docs such as `実況`, `リアタイ`, and `タイムスタンプ` unless the user asks for different wording.

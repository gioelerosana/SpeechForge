# SpeechForge Milestones

Track important project goals here. Mark items as completed only when fully verified.

## UI Renewal & App Update (target: v0.7.0)

**Direction:** Material You evolution — keep the M3 token system (`--md-sys-color-*`),
refine palette, typography, elevation, motion, and restructure navigation/UX.
**Dependency policy:** minor/patch only (no lucide-react 1.x, ESLint 10, TypeScript 7).
**Process:** one branch per milestone, atomic Conventional Commits, `bun test && bun run build`
must pass before each squash-merge to `main` (local squashes; push only after user confirmation).

### M1 — Dependency update (minor/patch)

- [ ] Bump `react`/`react-dom` 19.2.4 → 19.2.7, `@types/react` → 19.2.17
- [ ] Bump `tailwindcss` + `@tailwindcss/cli` 4.1.18 → 4.3.3 and verify `build.ts`/`dev.ts`
  still resolve `node_modules/.bin/tailwindcss` (AGENTS.md §6.2)
- [ ] Bump `@capacitor/*` → 8.4.2 (`app` → 8.1.1), `@tauri-apps/api` → 2.11.1,
  `@tauri-apps/cli` → 2.11.4
- [ ] Bump `tailwind-merge` → 3.6.0, `typescript-eslint` → 8.64.0,
  `eslint-plugin-react-hooks` → 7.1.1
- [ ] Verify: `bun test && bun run build` green; smoke `bun run dev`

### M2 — App decomposition (refactor, zero visual changes)

- [ ] Extract shared `cn()` into `src/utils/cn.ts` (currently duplicated in
  `App.tsx`, `ChatSection.tsx`, `TranslationCard.tsx`)
- [ ] Extract from `App.tsx` (~1500 lines): `AppHeader`, `SettingsPanel`,
  `TranscribeSection`, `ErrorBanner` into `src/components/`
- [ ] Extract hooks into `src/hooks/`: `useAudioRecorder` (MediaRecorder + native
  Tauri recording), `useTranscription` (`processAudio` pipeline), `useApiKeySettings`
  (Mistral/DeepL localStorage persistence)
- [ ] Verify: `bun test && bun run build` green; behavior identical (upload, record,
  settings save, translate pre-fill, chat context, Capacitor back button)

### M3 — Design tokens refresh (Material You evolution)

- [ ] New tonal palette from a teal/petrol seed (light + dark), replacing current blue;
  verify WCAG AA contrast for all on-color pairs
- [ ] Self-host fonts in `public/fonts` (Tauri CSP blocks Google Fonts: `font-src`/`style-src`
  are not whitelisted) — variable font for UI + display; drop the `@import url(...)` in `index.css`
- [ ] Add elevation (tinted shadows), shape (radii scale), and motion (durations/easings)
  tokens to `index.css`
- [ ] Verify: `bun run build` green; visual smoke on web + Tauri

### M4 — Navigation & layout restructure

- [ ] Replace header mode dropdown with always-visible M3 segmented control
  (Transcribe / Translate / Chat) in the header on desktop
- [ ] Add M3 bottom navigation bar on mobile (safe-area inset aware)
- [ ] Convert settings inline panel into an M3 dialog; preserve Esc, Ctrl+Enter save,
  and Capacitor back-button behaviors
- [ ] Consistent page container/spacing per tab; keep `handleGoHome` reset semantics
- [ ] Verify: `bun test && bun run build` green; manual flow smoke (all tabs, back button)

### M5 — Screen restyle pass

- [ ] Create shared UI primitives (`Button`, `IconButton`, `Card`, `TextField`) using new tokens
- [ ] Restyle transcribe flow: upload/record cards, recording state (+ visualizer retint),
  processing state, result card (copy/save/translate/chat CTAs)
- [ ] Restyle `TranslationCard`, `ChatSection`, `TitleBar`, error banner, footer
- [ ] Verify: `bun test && bun run build` green; light/dark visual QA

### M6 — Final QA & release proposal

- [ ] Full validation: `bun test && bun run build`; Tauri/Android build smoke
- [ ] Update `AGENTS.md`/`README.md` if structure or conventions changed
- [ ] Propose release v0.7.0 (4-file version sync per AGENTS.md §6.1) — pending user approval

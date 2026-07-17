# SpeechForge Milestones

Track important project goals here. Mark items as completed only when fully verified.

## UI Renewal & App Update (target: v0.7.0)

**Direction:** Material You evolution — keep the M3 token system (`--md-sys-color-*`),
refine palette, typography, elevation, motion, and restructure navigation/UX.
**Dependency policy:** minor/patch only (no lucide-react 1.x, ESLint 10, TypeScript 7).
**Process:** one branch per milestone, atomic Conventional Commits, `bun test && bun run build`
must pass before each squash-merge to `main` (local squashes; push only after user confirmation).

### M1 — Dependency update (minor/patch)

- [x] Bump `react`/`react-dom` 19.2.4 → 19.2.7, `@types/react` → 19.2.17
- [x] Bump `tailwindcss` + `@tailwindcss/cli` 4.1.18 → 4.3.3 and verify `build.ts`/`dev.ts`
  still resolve `node_modules/.bin/tailwindcss` (AGENTS.md §6.2)
- [x] Bump `@capacitor/*` → 8.4.2 (`app` → 8.1.1), `@tauri-apps/api` → 2.11.1,
  `@tauri-apps/cli` → 2.11.4
- [x] Bump `tailwind-merge` → 3.6.0, `typescript-eslint` → 8.64.0,
  `eslint-plugin-react-hooks` → 7.1.1
- [x] Verify: `bun test && bun run build` green; smoke `bun run dev`

### M2 — App decomposition (refactor, zero visual changes)

- [x] Extract shared `cn()` into `src/utils/cn.ts` (currently duplicated in
  `App.tsx`, `ChatSection.tsx`, `TranslationCard.tsx`)
- [x] Extract from `App.tsx` (~1500 lines): `AppHeader`, `SettingsPanel`,
  `TranscribeSection`, `ErrorBanner` into `src/components/`
- [x] Extract hooks into `src/hooks/`: `useAudioRecorder` (MediaRecorder + native
  Tauri recording), `useTranscription` (`processAudio` pipeline), `useApiKeySettings`
  (Mistral/DeepL localStorage persistence)
- [x] Verify: `bun test && bun run build` green; behavior identical (upload, record,
  settings save, translate pre-fill, chat context, Capacitor back button)

### M3 — Design foundations

- [x] Replace the blue scheme with a WCAG-tested petrol/teal Material 3 palette
- [x] Self-host Manrope Variable and remove the remote Google Fonts import
- [x] Add semantic elevation, shape, state, typography, and motion tokens with reduced-motion support
- [x] Add typed English/Italian localization and system/light/dark theme contexts
- [x] Add shared UI primitives and a Bun + Happy DOM component-test harness
- [x] Verify: `bun test`, lint, strict TypeScript, and `bun run build` green

### M4 — Navigation, onboarding & settings

- [ ] Replace header mode dropdown with always-visible M3 segmented control
  (Transcribe / Translate / Chat) in the header on desktop
- [ ] Add M3 bottom navigation bar on mobile (safe-area inset aware)
- [ ] Add guided, skippable provider onboarding and contextual provider gates
- [ ] Convert settings into an accessible M3 dialog with atomic multi-provider validation
- [ ] Preserve tab sessions; confirm destructive Home resets; refine Capacitor back behavior
- [ ] Use a consistent responsive page container and safe-area spacing
- [ ] Verify: `bun test && bun run build` green; manual flow smoke (all tabs, back button)

### M5 — Workflow renovation

- [ ] Renovate transcribe flow: provider gate, upload/record, elapsed timer, processing, result actions
- [ ] Renovate translation and chat while preserving in-session work and transcript context
- [ ] Restyle `TitleBar`, error alert, empty states, provider gates, and footer
- [ ] Guard async workflows against stale updates after reset
- [ ] Verify: `bun test && bun run build` green; light/dark visual QA

### M6 — Final QA & release proposal

- [ ] Full validation: `bun test && bun run build`; Tauri/Android build smoke
- [ ] Add `ci-tests.yml` for tests, lint, strict TypeScript, and web build
- [ ] Update `AGENTS.md`/`README.md` if structure or conventions changed
- [ ] Propose release v0.7.0 (4-file version sync per AGENTS.md §6.1) — pending user approval

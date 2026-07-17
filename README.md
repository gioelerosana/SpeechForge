# SpeechForge

SpeechForge turns audio into editable transcripts, translates text with DeepL, and lets you continue working with a transcript in Mistral chat. The same React application targets the web, Linux/Windows desktop through Tauri v2, and Android through Capacitor.

## Highlights

- Upload or record audio and transcribe it with Mistral AI.
- Preserve the native Linux/Tauri recording path while using `MediaRecorder` on web and Android.
- Translate text with DeepL language, formality, model, sentence-splitting, and formatting controls.
- Attach the current transcript as private in-session chat context without exposing the system prompt in the UI.
- Switch between Transcribe, Translate, and Chat without losing current work; destructive Home resets require confirmation.
- Use the guided provider setup or configure Mistral and DeepL later in Settings.
- Choose English or Italian and system, light, or dark appearance.
- Run an accessible Material 3 interface across desktop and mobile layouts.

## Getting Started

Requirements:

- Bun 1.3 or newer
- Rust and the Tauri v2 platform dependencies for desktop builds
- Android SDK, command-line tools, and Java 21 for Android builds
- Docker for the containerized web target

Install and start the web app:

```bash
bun install
bun run dev
```

The first-run setup explains each workspace and can validate one or both providers. Mistral is required for transcription and chat; DeepL is required for translation. Settings validates every configured provider before committing any edited API setting, so a partial validation failure does not overwrite the last working configuration. Credentials remain in local device storage and are sent only to the configured provider when used.

## Commands

| Action | Command | Description |
| :-- | :-- | :-- |
| Install | `bun install` | Install dependencies from `bun.lock`. |
| Web development | `bun run dev` | Start the hot-reloading web server. |
| Web build | `bun run build` | Build production assets into `dist/`. |
| Tests | `bun test` | Run service, hook, context, and component tests. |
| Lint | `bun run lint` | Run ESLint over TypeScript and React sources. |
| Typecheck | `bunx --bun tsc --noEmit` | Run strict TypeScript validation. |
| Tauri development | `bun run dev:tauri` | Start the desktop application in development mode. |
| Tauri build | `bun run build:tauri` | Build the native desktop application. |
| Android sync | `bun run cap:sync` | Build web assets and sync them into Android. |
| Temporary ADB run | `bun run build:adb` | Build/install the debug app, then uninstall it when stopped. |

`bun run build:adb` uses `com.speechforge.app.debug`, so it can run beside the release app. Signed release artifacts are produced by the tag-based GitHub Actions workflows.

## Project Structure

- `src/components/`: app workspaces, shell components, provider setup, and reusable UI primitives
- `src/context/`: locale and theme state
- `src/hooks/`: transcription, dual-path recording, provider settings, and shared-file workflows
- `src/i18n/`: typed English and Italian messages
- `src/services/audio/`: duration, normalization, and long-audio splitting
- `src/services/mistral/` and `src/services/deepl/`: provider clients and platform-specific transport
- `src-tauri/`: Tauri configuration and Rust commands for desktop recording/network access
- `android/`: Capacitor Android project
- `test/`: Happy DOM and Testing Library setup for Bun component tests
- `build.ts` and `dev.ts`: custom Bun/Tailwind build pipeline

## Platform Notes

- Linux inside Tauri uses the Rust native recorder. Browser, Windows webview, and Android recording use the web `MediaRecorder` path.
- DeepL calls use the web proxy in browser builds, a Rust command in Tauri, and `CapacitorHttp` on Android.
- Run `bun run cap:sync` before every Android build so `android/app/src/main/assets/public/` matches the latest web build.
- The Tauri custom title bar and CSP are part of the desktop security and window integration; update them using the project specialist guidance.

## Docker Web App

```bash
docker build -t speechforge:web .
docker run --rm -p 3000:3000 speechforge:web
```

Open `http://localhost:3000`. Production serving must retain SPA fallback behavior.

## Arch Linux Packaging

```bash
makepkg -si
```

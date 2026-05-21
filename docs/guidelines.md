# Development Guidelines & Style Guide

This document defines the coding conventions, strict types, naming structures, error handling policies, and release workflows for TranscribeJS.

---

## 1. Codebase Standards

### 1.1 Strict TypeScript
* TypeScript `strict: true` is enabled on the repository. Do not use `any` unless absolutely necessary.
* Provide explicit interfaces or types for all API responses, component props, and state values.

### 1.2 React 19 Conventions
* **Functional Components:** All components must use functional components and named exports. Do not use default exports for components.
* **Logic Separation:** Keep UI views lightweight. Move heavy computations or multi-step processes (e.g., calculations, file loading) into separate custom hooks (`src/hooks/`) or service classes (`src/services/`).
* **State Management:**
  - Local state: Use React `useState` for local UI state (e.g. visibility triggers, local input text).
  - Global state: Use React Context (e.g. `ThemeContext` for light/dark mode, or settings storage) when state must be accessed by multiple components in separate layers.

### 1.3 Tailwind CSS v4 Styling
* Utility classes must be applied directly inside the component JSX templates.
* Use the class-merging utility `cn()` pattern to combine conditional styling:
  ```typescript
  import { clsx, type ClassValue } from "clsx";
  import { twMerge } from "tailwind-merge";

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

---

## 2. Naming Conventions

Maintain strict, consistent naming configurations across all folders:

| Symbol Type | Case | Example |
| :--- | :--- | :--- |
| **React Component Files** | `PascalCase.tsx` | `TranslationCard.tsx`, `TitleBar.tsx` |
| **Utility/Service Files** | `camelCase.ts` | `audioProcessor.ts`, `deepLClient.ts` |
| **Variables & Functions** | `camelCase` | `handleUpload`, `isSavingApiKey` |
| **Interfaces & Types** | `PascalCase` | `AudioMetadata`, `DeepLPlan` |
| **Global Constants** | `UPPER_SNAKE_CASE` | `ERROR_MESSAGES`, `SUPPORTED_AUDIO_FORMATS` |

---

## 3. Error Handling Policy

All asynchronous operations (APIs, filesystem inputs, Web Audio pipelines, and Tauri backend commands) must follow standard error capturing structures:

1. **Service Layer:** Wrap commands inside try/catch blocks. Log meaningful context to the console using a prefixed tag:
   ```typescript
   console.error("[ServiceName] Error performing action:", err);
   ```
2. **UI Layer:** Catch failures and reflect them directly in the UI. Set the status state to `'error'` and assign the error message to an error state to inform the user. Do not let promises fail silently.

---

## 4. Release & Version Synchronization

To release a new version, the version identifier string **must** be updated atomically across four configuration files in the same commit:

| File Name | Field Path |
| :--- | :--- |
| **[package.json](file:///home/joel/progetti/SpeechForge/package.json)** | `"version"` |
| **[tauri.conf.json](file:///home/joel/progetti/SpeechForge/src-tauri/tauri.conf.json)** | `"version"` |
| **[Cargo.toml](file:///home/joel/progetti/SpeechForge/src-tauri/Cargo.toml)** | `version` under `[package]` |
| **[PKGBUILD](file:///home/joel/progetti/SpeechForge/PKGBUILD)** | `pkgver` |

Verify synchronization after bumping the versions with the command:

```bash
grep -E '"version"' package.json src-tauri/tauri.conf.json && grep '^version' src-tauri/Cargo.toml && grep '^pkgver' PKGBUILD
```

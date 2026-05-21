---
name: testing-standards
description: "Testing standards and guidelines for TranscribeJS. Covers Bun test runner, mock patterns, service unit testing, hook testing, and regression prevention."
---

# Testing Standards Skill

This skill outlines the conventions and procedures to verify changes and write tests within TranscribeJS.

## 1. Test Architecture & Execution

The project uses `bun test` as its primary test runner. Avoid standard Node.js runners (Jest, Mocha) or npm scripts.

| Command | Action |
| :--- | :--- |
| `bun test` | Execute the entire suite. |
| `bun test <file_path>` | Run a single test file. |
| `bun test --watch` | Start hot-reloading test runner. |

## 2. Test Co-location Rule

- Place all tests in the same directory as the file being tested.
- Append `.test.ts` or `.test.tsx` to the file basename.
- Example:
  - Source: `src/services/mistral/MistralClient.ts`
  - Test: `src/services/mistral/MistralClient.test.ts`

## 3. Mandatory Mocking Practices

To ensure tests execute quickly and reliably in CI/CD without external side-effects:

* **Overriding Fetch:** Intercept network requests by mocking `globalThis.fetch`. Always preserve the original implementation and restore it inside `beforeEach` and `afterEach` hooks to prevent memory leakage or pollution.
* **Audio context stubs:** Stub global classes `Audio`, `AudioContext`, and URL helpers like `createObjectURL` and `revokeObjectURL`. Do not try to instantiate real audio contexts in headless test runs.
* **Tauri backend commands:** Stub the Tauri IPC module if testing components that call Rust `invoke` methods.

## 4. Test Verification Checklist

Before pushing any changes:
1. All tests must pass with zero failures.
2. Run `bun test` locally to verify there are no regression errors.

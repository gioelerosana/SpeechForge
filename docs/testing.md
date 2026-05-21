# Testing Standards & Conventions

This guide documents the testing framework, structure, mock patterns, and execution scripts for TranscribeJS.

---

## 1. Testing Framework: Bun Test

TranscribeJS uses Bun's fast, built-in test runner (`bun test`). It compiles TypeScript and ES modules natively, requiring zero configuration.

### Common Commands

| Purpose | Command |
| :--- | :--- |
| **Run all tests** | `bun test` |
| **Run a specific test file** | `bun test path/to/file.test.ts` |
| **Run tests in watch mode** | `bun test --watch` |
| **Filter by test name** | `bun test -t "happy path"` |

---

## 2. Test File Locations & Naming

* **Inline Co-location:** All test files must be co-located with the source code they are testing. For example:
  - Source: `src/services/audio/AudioProcessor.ts`
  - Test: `src/services/audio/AudioProcessor.test.ts`
* **File Naming:** All test files must end with the `.test.ts` suffix.

---

## 3. Mocking Conventions & Best Practices

Tests should run in isolation and avoid making real network requests to external APIs (Mistral, DeepL).

### 3.1 Network Requests Mocking

Mock API calls by temporarily overriding the global `fetch` handler. Always store and restore the original `fetch` implementation in `beforeEach`/`afterEach` blocks to prevent side-effects in other test suites:

```typescript
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { DeepLClient } from "./deepLClient";

const originalFetch = globalThis.fetch;

describe("DeepLClient", () => {
  beforeEach(() => {
    globalThis.fetch = originalFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("sends request", async () => {
    globalThis.fetch = (async (url, init) => {
      return new Response(JSON.stringify({ translations: [{ text: "Hello" }] }), { status: 200 });
    }) as typeof fetch;
    
    // Perform test execution and assertions...
  });
});
```

### 3.2 Web Audio API & HTML5 Audio Mocking

Since `AudioContext`, `Audio`, and `URL` APIs are not fully defined in the test runner's headless environment, they must be stubbed:

* Mock standard browser `Audio` structures by overriding `globalThis.Audio` using a mock class with configurable static results.
* Mock `AudioContext` by implementing a mock class with `decodeAudioData`.
* Mock `URL.createObjectURL` and `URL.revokeObjectURL` to track memory leaks/cleanup.

Refer to [AudioProcessor.test.ts](file:///home/joel/progetti/SpeechForge/src/services/audio/AudioProcessor.test.ts#L4-L67) for the exact implementation of these Audio mock adapters.

### 3.3 Tauri Native IPC Mocking

If a service invokes a native Rust Tauri command, mock the IPC pathway. You can stub `@tauri-apps/api/core` commands during testing by mocking the Tauri `invoke` call:

* Conditionally bypass or mock the `isTauriRuntime()` check.
* Stub the `invoke` return value for commands like `start_native_recording`, `stop_native_recording`, and `deepl_request`.

---

## 4. Test Guidelines & Regressions Prevention

* **Strict Cleanup:** Reset all mocks, environment state overrides, and localStorage writes after each test run.
* **Cover Edge Cases:** Ensure tests verify API failures (401 Unauthorized, 429 Rate Limit, 456 Quota Exceeded, 504 Gateway Timeout) as well as the happy paths.
* **Deterministic Results:** Do not write tests that rely on external variables, real network state, or system time unless explicitly stubbed.

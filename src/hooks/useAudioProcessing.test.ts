/* eslint-disable */
import { describe, expect, it } from "bun:test";
import { useAudioProcessing } from "./useAudioProcessing";
import React from "react";
import ReactDOMServer from "react-dom/server";

describe("useAudioProcessing hook", () => {
  it("initializes with default state", () => {
    const hookResultRef = { current: null as any };

    function TestComponent() {
      hookResultRef.current = useAudioProcessing({
        apiKey: "test-key",
        onApiKeyInvalid: () => {},
      });
      return null;
    }

    ReactDOMServer.renderToString(React.createElement(TestComponent));

    expect(hookResultRef.current).not.toBeNull();
    expect(hookResultRef.current.status).toBe("idle");
    expect(hookResultRef.current.progress).toBe("");
    expect(hookResultRef.current.transcription).toBe("");
    expect(hookResultRef.current.error).toBe("");
    expect(typeof hookResultRef.current.processAudio).toBe("function");
  });
});

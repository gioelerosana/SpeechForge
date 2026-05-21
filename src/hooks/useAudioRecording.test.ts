/* eslint-disable */
import { describe, expect, it } from "bun:test";
import { useAudioRecording } from "./useAudioRecording";
import React from "react";
import ReactDOMServer from "react-dom/server";

// Mock Tauri internals
(global as any).__TAURI_INTERNALS__ = {};

describe("useAudioRecording hook", () => {
  it("initializes with default values", () => {
    const hookResultRef = { current: null as any };

    function TestComponent() {
      hookResultRef.current = useAudioRecording({
        onRecordingComplete: async (file) => {},
        onError: (msg) => {},
      });
      return null;
    }

    ReactDOMServer.renderToString(React.createElement(TestComponent));

    expect(hookResultRef.current).not.toBeNull();
    expect(hookResultRef.current.isRecording).toBe(false);
    expect(hookResultRef.current.recordingDuration).toBe(0);
    expect(typeof hookResultRef.current.startRecording).toBe("function");
    expect(typeof hookResultRef.current.stopRecording).toBe("function");
  });
});

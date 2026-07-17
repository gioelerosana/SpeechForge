import { describe, expect, test } from "bun:test";
import {
  formatRecordingTime,
  getRecordingFileExtension,
  shouldUseNativeRecorder,
} from "./useAudioRecorder";

describe("useAudioRecorder path selection", () => {
  test("uses the native recorder only for Linux inside Tauri", () => {
    expect(shouldUseNativeRecorder(true, true)).toBe(true);
    expect(shouldUseNativeRecorder(true, false)).toBe(false);
    expect(shouldUseNativeRecorder(false, true)).toBe(false);
    expect(shouldUseNativeRecorder(false, false)).toBe(false);
  });

  test("keeps browser recording extensions aligned with MIME types", () => {
    expect(getRecordingFileExtension("audio/webm;codecs=opus")).toBe("webm");
    expect(getRecordingFileExtension("audio/ogg;codecs=opus")).toBe("ogg");
    expect(getRecordingFileExtension("audio/mp4")).toBe("mp4");
  });

  test("formats a shared elapsed timer for both recording paths", () => {
    expect(formatRecordingTime(0)).toBe("00:00");
    expect(formatRecordingTime(65)).toBe("01:05");
  });
});

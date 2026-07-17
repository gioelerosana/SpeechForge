import { describe, expect, test } from "bun:test";
import { contrastRatio } from "./colorContrast";

const ON_COLOR_PAIRS = [
  ["#ffffff", "#006a6a"],
  ["#002020", "#9cf1f0"],
  ["#ffffff", "#4a6363"],
  ["#051f1f", "#cce8e7"],
  ["#ffffff", "#4b607c"],
  ["#041c35", "#d3e4ff"],
  ["#161d1d", "#f4fbfa"],
  ["#ffffff", "#ba1a1a"],
  ["#410002", "#ffdad6"],
  ["#003737", "#80d5d4"],
  ["#9cf1f0", "#004f4f"],
  ["#1b3534", "#b0cccb"],
  ["#cce8e7", "#324b4b"],
  ["#1c314b", "#b3c8e8"],
  ["#d3e4ff", "#334862"],
  ["#dde4e3", "#0e1515"],
  ["#690005", "#ffb4ab"],
  ["#ffdad6", "#93000a"],
] as const;

describe("Material color tokens", () => {
  test.each(ON_COLOR_PAIRS)("%s on %s meets WCAG AA", (foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});

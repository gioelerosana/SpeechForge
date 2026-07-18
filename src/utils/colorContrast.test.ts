import { describe, expect, test } from "bun:test";
import { contrastRatio } from "./colorContrast";

const ON_COLOR_PAIRS = [
  ["#ffffff", "#4d5c92"],
  ["#354479", "#dce1ff"],
  ["#ffffff", "#595d72"],
  ["#424659", "#dee1f9"],
  ["#ffffff", "#75546f"],
  ["#5b3d57", "#ffd7f6"],
  ["#1a1b21", "#faf8ff"],
  ["#ffffff", "#ba1a1a"],
  ["#93000a", "#ffdad6"],
  ["#1d2d61", "#b6c4ff"],
  ["#dce1ff", "#354479"],
  ["#2b3042", "#c2c5dd"],
  ["#dee1f9", "#424659"],
  ["#432740", "#e3bada"],
  ["#ffd7f6", "#5b3d57"],
  ["#e3e1e9", "#121318"],
  ["#690005", "#ffb4ab"],
  ["#ffdad6", "#93000a"],
] as const;

describe("Material color tokens", () => {
  test.each(ON_COLOR_PAIRS)("%s on %s meets WCAG AA", (foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});

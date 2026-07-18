import { afterEach, describe, expect, test } from "bun:test";
import {
  accentRgbToArgb,
  applyMaterialYouTheme,
  buildMaterialYouTokens,
  clearMaterialYouTheme,
} from "./materialYou";

const GNOME_BLUE_ARGB = 0xff3584e4;
const GNOME_RED_ARGB = 0xffe62d42;

const EXPECTED_TOKENS = [
  "--md-sys-color-primary",
  "--md-sys-color-on-primary",
  "--md-sys-color-primary-container",
  "--md-sys-color-on-primary-container",
  "--md-sys-color-secondary",
  "--md-sys-color-on-secondary",
  "--md-sys-color-secondary-container",
  "--md-sys-color-on-secondary-container",
  "--md-sys-color-tertiary",
  "--md-sys-color-on-tertiary",
  "--md-sys-color-tertiary-container",
  "--md-sys-color-on-tertiary-container",
  "--md-sys-color-surface",
  "--md-sys-color-surface-container-low",
  "--md-sys-color-surface-container",
  "--md-sys-color-surface-container-high",
  "--md-sys-color-surface-container-highest",
  "--md-sys-color-on-surface",
  "--md-sys-color-on-surface-variant",
  "--md-sys-color-outline",
  "--md-sys-color-outline-variant",
  "--md-sys-color-error",
  "--md-sys-color-on-error",
  "--md-sys-color-error-container",
  "--md-sys-color-on-error-container",
];

describe("buildMaterialYouTokens", () => {
  test("produces every Material token as a hex color for both modes", () => {
    for (const isDark of [false, true]) {
      const tokens = buildMaterialYouTokens(GNOME_BLUE_ARGB, isDark);
      expect(Object.keys(tokens)).toHaveLength(EXPECTED_TOKENS.length);
      for (const token of EXPECTED_TOKENS) {
        expect(tokens[token]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  test("derives different light and dark schemes from the same seed", () => {
    const light = buildMaterialYouTokens(GNOME_BLUE_ARGB, false);
    const dark = buildMaterialYouTokens(GNOME_BLUE_ARGB, true);
    expect(light["--md-sys-color-surface"]).not.toBe(
      dark["--md-sys-color-surface"],
    );
    expect(light["--md-sys-color-primary"]).not.toBe(
      dark["--md-sys-color-primary"],
    );
  });

  test("adapts the scheme to the seed color", () => {
    const blue = buildMaterialYouTokens(GNOME_BLUE_ARGB, false);
    const red = buildMaterialYouTokens(GNOME_RED_ARGB, false);
    expect(blue["--md-sys-color-primary"]).not.toBe(
      red["--md-sys-color-primary"],
    );
    expect(blue["--md-sys-color-primary-container"]).not.toBe(
      red["--md-sys-color-primary-container"],
    );
  });
});

describe("applyMaterialYouTheme", () => {
  afterEach(() => clearMaterialYouTheme());

  test("injects overriding :root and .dark rules derived from the seed", () => {
    applyMaterialYouTheme(GNOME_BLUE_ARGB);
    const style = document.getElementById("sf-material-you-theme");
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain(":root");
    expect(style?.textContent).toContain(".dark");
    expect(style?.textContent).toContain("--sf-elevation-1");

    const light = buildMaterialYouTokens(GNOME_BLUE_ARGB, false);
    const dark = buildMaterialYouTokens(GNOME_BLUE_ARGB, true);
    expect(style?.textContent).toContain(light["--md-sys-color-primary"]);
    expect(style?.textContent).toContain(dark["--md-sys-color-primary"]);
  });

  test("updates the same style element on repeated applications", () => {
    applyMaterialYouTheme(GNOME_BLUE_ARGB);
    applyMaterialYouTheme(GNOME_RED_ARGB);
    expect(document.querySelectorAll("#sf-material-you-theme")).toHaveLength(1);
    const red = buildMaterialYouTokens(GNOME_RED_ARGB, false);
    expect(
      document.getElementById("sf-material-you-theme")?.textContent,
    ).toContain(red["--md-sys-color-primary"]);
  });

  test("clearMaterialYouTheme removes the injected rules", () => {
    applyMaterialYouTheme(GNOME_BLUE_ARGB);
    clearMaterialYouTheme();
    expect(document.getElementById("sf-material-you-theme")).toBeNull();
  });
});

test("accentRgbToArgb packs bytes into an opaque ARGB int", () => {
  expect(accentRgbToArgb([0x35, 0x84, 0xe4])).toBe(GNOME_BLUE_ARGB);
});

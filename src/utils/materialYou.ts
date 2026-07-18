import {
  argbFromRgb,
  blueFromArgb,
  greenFromArgb,
  hexFromArgb,
  Hct,
  MaterialDynamicColors,
  redFromArgb,
  SchemeTonalSpot,
  type DynamicColor,
} from "@material/material-color-utilities";

export type AccentRgb = [number, number, number];

export type MaterialYouTokens = Record<string, string>;

const STYLE_ELEMENT_ID = "sf-material-you-theme";

const COLOR_ROLES: ReadonlyArray<readonly [string, DynamicColor]> = [
  ["--md-sys-color-primary", MaterialDynamicColors.primary],
  ["--md-sys-color-on-primary", MaterialDynamicColors.onPrimary],
  ["--md-sys-color-primary-container", MaterialDynamicColors.primaryContainer],
  [
    "--md-sys-color-on-primary-container",
    MaterialDynamicColors.onPrimaryContainer,
  ],
  ["--md-sys-color-secondary", MaterialDynamicColors.secondary],
  ["--md-sys-color-on-secondary", MaterialDynamicColors.onSecondary],
  [
    "--md-sys-color-secondary-container",
    MaterialDynamicColors.secondaryContainer,
  ],
  [
    "--md-sys-color-on-secondary-container",
    MaterialDynamicColors.onSecondaryContainer,
  ],
  ["--md-sys-color-tertiary", MaterialDynamicColors.tertiary],
  ["--md-sys-color-on-tertiary", MaterialDynamicColors.onTertiary],
  [
    "--md-sys-color-tertiary-container",
    MaterialDynamicColors.tertiaryContainer,
  ],
  [
    "--md-sys-color-on-tertiary-container",
    MaterialDynamicColors.onTertiaryContainer,
  ],
  ["--md-sys-color-surface", MaterialDynamicColors.surface],
  [
    "--md-sys-color-surface-container-low",
    MaterialDynamicColors.surfaceContainerLow,
  ],
  ["--md-sys-color-surface-container", MaterialDynamicColors.surfaceContainer],
  [
    "--md-sys-color-surface-container-high",
    MaterialDynamicColors.surfaceContainerHigh,
  ],
  [
    "--md-sys-color-surface-container-highest",
    MaterialDynamicColors.surfaceContainerHighest,
  ],
  ["--md-sys-color-on-surface", MaterialDynamicColors.onSurface],
  ["--md-sys-color-on-surface-variant", MaterialDynamicColors.onSurfaceVariant],
  ["--md-sys-color-outline", MaterialDynamicColors.outline],
  ["--md-sys-color-outline-variant", MaterialDynamicColors.outlineVariant],
  ["--md-sys-color-error", MaterialDynamicColors.error],
  ["--md-sys-color-on-error", MaterialDynamicColors.onError],
  ["--md-sys-color-error-container", MaterialDynamicColors.errorContainer],
  [
    "--md-sys-color-on-error-container",
    MaterialDynamicColors.onErrorContainer,
  ],
];

/**
 * Builds the full set of `--md-sys-color-*` tokens for one brightness mode
 * from a seed color using the Tonal Spot scheme (Material You on Android).
 */
export function buildMaterialYouTokens(
  seedArgb: number,
  isDark: boolean,
): MaterialYouTokens {
  const scheme = new SchemeTonalSpot(Hct.fromInt(seedArgb), isDark, 0);
  const tokens: MaterialYouTokens = {};
  for (const [token, role] of COLOR_ROLES) {
    tokens[token] = hexFromArgb(role.getArgb(scheme));
  }
  return tokens;
}

function rgba(argb: number, alpha: number): string {
  const r = redFromArgb(argb);
  const g = greenFromArgb(argb);
  const b = blueFromArgb(argb);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Elevation shadows tinted with deep tones of the seed hue, mirroring the
 * static light-theme shadows. Dark mode keeps the plain black shadows
 * declared in `index.css`.
 */
function buildElevationTokens(seedArgb: number): MaterialYouTokens {
  const { hue, chroma } = Hct.fromInt(seedArgb);
  const shade = Hct.from(hue, chroma, 25).toInt();
  const deepShade = Hct.from(hue, chroma, 15).toInt();
  return {
    "--sf-elevation-1": `0 1px 3px ${rgba(shade, 0.12)}, 0 1px 2px ${rgba(deepShade, 0.08)}`,
    "--sf-elevation-2": `0 4px 12px ${rgba(shade, 0.14)}, 0 2px 4px ${rgba(deepShade, 0.08)}`,
    "--sf-elevation-3": `0 12px 32px ${rgba(shade, 0.16)}, 0 4px 10px ${rgba(deepShade, 0.1)}`,
  };
}

function tokensToCssDeclarations(tokens: MaterialYouTokens): string {
  return Object.entries(tokens)
    .map(([token, value]) => `${token}: ${value};`)
    .join("\n");
}

/**
 * Injects (or replaces) a `<style>` element that overrides the static
 * `:root`/`.dark` token declarations with a scheme derived from `seedArgb`.
 */
export function applyMaterialYouTheme(seedArgb: number): void {
  const lightTokens = {
    ...buildMaterialYouTokens(seedArgb, false),
    ...buildElevationTokens(seedArgb),
  };
  const darkTokens = buildMaterialYouTokens(seedArgb, true);

  let style = document.getElementById(STYLE_ELEMENT_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ELEMENT_ID;
    document.head.appendChild(style);
  }
  style.textContent = `:root {\n${tokensToCssDeclarations(lightTokens)}\n}\n.dark {\n${tokensToCssDeclarations(darkTokens)}\n}`;
}

/** Removes the injected dynamic theme, restoring the static brand palette. */
export function clearMaterialYouTheme(): void {
  document.getElementById(STYLE_ELEMENT_ID)?.remove();
}

export function accentRgbToArgb([red, green, blue]: AccentRgb): number {
  return argbFromRgb(red, green, blue);
}

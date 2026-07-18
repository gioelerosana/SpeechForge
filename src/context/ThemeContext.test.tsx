import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";

function ThemeProbe() {
  const { mode, resolvedTheme, setMode, toggleTheme } = useTheme();
  return (
    <div>
      <span>{mode}:{resolvedTheme}</span>
      <button onClick={toggleTheme}>toggle</button>
      <button onClick={() => setMode("system")}>system</button>
    </div>
  );
}

function PaletteProbe() {
  const { paletteSource, systemAccentActive, setPaletteSource } = useTheme();
  return (
    <div>
      <span>
        {paletteSource}:{String(systemAccentActive)}
      </span>
      <button onClick={() => setPaletteSource("brand")}>brand</button>
    </div>
  );
}

test("migrates a legacy theme and supports the quick toggle", () => {
  localStorage.setItem("theme", "dark");
  render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );

  expect(screen.getByText("dark:dark")).not.toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "toggle" }));
  expect(screen.getByText("light:light")).not.toBeNull();
  expect(localStorage.getItem("theme")).toBeNull();
});

test("defaults to the system palette and falls back to brand outside Tauri", () => {
  render(
    <ThemeProvider>
      <PaletteProbe />
    </ThemeProvider>,
  );

  // Web/Happy DOM has no system accent color: the brand palette stays active.
  expect(screen.getByText("system:false")).not.toBeNull();
  expect(document.getElementById("sf-material-you-theme")).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "brand" }));
  expect(screen.getByText("brand:false")).not.toBeNull();
  expect(localStorage.getItem("speechforge_palette_source")).toBe("brand");
});

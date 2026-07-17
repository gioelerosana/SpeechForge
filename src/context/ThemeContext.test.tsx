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

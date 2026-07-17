import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { LocaleProvider } from "../context/LocaleContext";
import { AppHeader } from "./AppHeader";

test("exposes direct desktop navigation without a mode menu", () => {
  let selected = "transcribe";
  render(
    <LocaleProvider>
      <AppHeader
        theme="light"
        toggleTheme={() => {}}
        tauriEnv={false}
        activeTab="transcribe"
        onTabChange={(tab) => { selected = tab; }}
        onHome={() => {}}
        onOpenSettings={() => {}}
      />
    </LocaleProvider>,
  );

  fireEvent.click(screen.getByRole("radio", { name: "Translate" }));
  expect(selected).toBe("translate");
  expect(screen.queryByLabelText("Toggle Mode Menu")).toBeNull();
});

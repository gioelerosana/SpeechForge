import { expect, test } from "bun:test";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";
import { LocaleProvider } from "./context/LocaleContext";
import { ThemeProvider } from "./context/ThemeContext";

function renderApp() {
  localStorage.setItem("mistral_api_key", "mistral-key");
  localStorage.setItem("mistral_api_key_verified", "true");
  localStorage.setItem("deepl_api_key", "deepl-key");
  localStorage.setItem("deepl_api_key_verified", "true");
  localStorage.setItem("speechforge_onboarding_state", "completed");

  render(
    <ThemeProvider>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </ThemeProvider>,
  );
}

test("preserves tab work and confirms a destructive Home reset", async () => {
  renderApp();
  const desktopNavigation = screen.getByRole("radiogroup", {
    name: "Primary navigation",
  });

  fireEvent.click(within(desktopNavigation).getByRole("radio", { name: "Translate" }));
  const source = screen.getByPlaceholderText("Enter text to translate…");
  fireEvent.change(source, { target: { value: "Keep this draft" } });

  fireEvent.click(within(desktopNavigation).getByRole("radio", { name: "Chat" }));
  fireEvent.click(within(desktopNavigation).getByRole("radio", { name: "Translate" }));
  expect(screen.getByDisplayValue("Keep this draft")).not.toBeNull();

  await waitFor(() => expect((source as HTMLTextAreaElement).value).toBe("Keep this draft"));
  fireEvent.click(screen.getByRole("button", { name: "SpeechForge home" }));
  expect(screen.getByRole("dialog", { name: "Discard current work?" })).not.toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Discard and return home" }));
  fireEvent.click(within(desktopNavigation).getByRole("radio", { name: "Translate" }));
  expect(
    (screen.getByPlaceholderText("Enter text to translate…") as HTMLTextAreaElement).value,
  ).toBe("");
});

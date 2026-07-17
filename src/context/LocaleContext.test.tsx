import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { LocaleProvider, useLocale } from "./LocaleContext";

function LocaleProbe() {
  const { locale, setLocale, copy } = useLocale();
  return (
    <button onClick={() => setLocale(locale === "en" ? "it" : "en")}>
      {copy.common.settings}
    </button>
  );
}

test("defaults to English and persists an Italian selection", () => {
  render(
    <LocaleProvider>
      <LocaleProbe />
    </LocaleProvider>,
  );

  const button = screen.getByRole("button", { name: "Settings" });
  expect(document.documentElement.lang).toBe("en");
  fireEvent.click(button);
  expect(screen.getByRole("button", { name: "Impostazioni" })).not.toBeNull();
  expect(document.documentElement.lang).toBe("it");
  expect(localStorage.getItem("speechforge_locale")).toBe("it");
});

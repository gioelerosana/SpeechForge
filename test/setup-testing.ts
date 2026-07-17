import { afterEach, mock } from "bun:test";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: mock((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: mock(),
    removeListener: mock(),
    addEventListener: mock(),
    removeEventListener: mock(),
    dispatchEvent: mock(() => false),
  })),
});

Object.defineProperty(Element.prototype, "scrollIntoView", {
  configurable: true,
  value: mock(),
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  localStorage.clear();
  document.documentElement.className = "";
});

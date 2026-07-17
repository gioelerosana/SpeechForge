import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "./Dialog";

test("labels the dialog and closes it with Escape", () => {
  let closed = false;
  render(
    <Dialog open title="Preferences" onClose={() => { closed = true; }}>
      <button>Inside</button>
    </Dialog>,
  );

  expect(screen.getByRole("dialog", { name: "Preferences" })).not.toBeNull();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(closed).toBe(true);
});

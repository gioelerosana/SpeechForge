import { build } from "bun";
import { cp, rm } from "node:fs/promises";

console.log("Building SpeechForge...");

// Clean dist
await rm("./dist", { recursive: true, force: true });

// Build Tailwind CSS
console.log("Generating Tailwind CSS...");
const tailwindProc = Bun.spawn({
  cmd: [
    "./node_modules/.bin/tailwindcss",
    "-c",
    "./tailwind.config.cjs",
    "-i",
    "./src/index.css",
    "-o",
    "./dist/index.css",
    "--minify",
  ],
  stdout: "inherit",
  stderr: "inherit",
});

const tailwindExitCode = await tailwindProc.exited;
if (tailwindExitCode !== 0) {
  console.error("Tailwind build failed");
  process.exit(1);
}

// Build React App
// format "iife" keeps bundled declarations out of the global scope: a
// top-level `function isTauri()` from @tauri-apps/api would otherwise collide
// with the non-configurable `window.isTauri` injected by Tauri's init script
// and crash the webview with a white screen.
const result = await build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  target: "browser",
  format: "iife",
  minify: true,
  sourcemap: "external",
});

if (!result.success) {
  console.error("Build failed");
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

// Copy HTML
await cp("./src/index.html", "./dist/index.html");

// Copy public assets
console.log("Copying public assets...");
await cp("./public", "./dist", { recursive: true });

console.log("Build complete!");

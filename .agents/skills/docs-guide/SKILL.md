---
name: docs-guide
description: "Documentation standards and guide for TranscribeJS. Covers file structure under docs/, markdown rules, link formatting, and synchronization of docs."
---

# Documentation Standards & Guide Skill

This skill governs the creation, update, and styling of documentation in the TranscribeJS repository.

## 1. Documentation Structure

All developer and user guides must reside in the root [docs/](file:///home/joel/progetti/SpeechForge/docs/) folder. Avoid creating scattered documentation in other subdirectories.

The root documentation index is [docs/README.md](file:///home/joel/progetti/SpeechForge/docs/README.md).

## 2. Markdown Guidelines

* Use clean GitHub Flavored Markdown (GFM).
* Structure headers hierarchically, using one `<h1>` per page.
* Use tables for comparisons, layouts, and lists of commands.
* Embed code snippets with appropriate syntax highlighting flags (`typescript`, `rust`, `bash`, `html`, `css`).

## 3. Link Formatting

When writing markdown documentation:
- **Clickable Links:** Always use absolute `file:///` links to refer to files in the repository.
  - Correct: `[deepLClient.ts](file:///home/joel/progetti/SpeechForge/src/services/deepl/deepLClient.ts)`
  - Incorrect: `[deepLClient.ts](../src/services/deepl/deepLClient.ts)`
- Do not wrap file links in backticks (e.g. use `[basename](file://...)`, not `[`basename`](file://...)`).

## 4. Maintenance & Synchronization

* **Feature Updates:** Whenever a component, service, command, or build script is modified, immediately update the corresponding document under `docs/` (e.g. `architecture.md`, `setup.md`, or `guidelines.md`).
* **Milestones Alignment:** Keep references to `MILESTONES.md` synchronized and accurate.

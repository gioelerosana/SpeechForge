# TranscribeJS Documentation

Welcome to the official developer and maintainer documentation for **TranscribeJS**, a modern, multi-platform audio transcription and translation application.

This suite of documentation is designed to assist developers, CI/CD systems, and agentic assistants in understanding, setting up, building, testing, and maintaining the application.

## Table of Contents

1. **[System Architecture](file:///home/joel/progetti/TranscribeAPP/docs/architecture.md)**
   - Detailed overview of frontend, desktop (Tauri), mobile (Capacitor), and web configurations.
   - Deep dive into audio processing, dual-path recording pipelines, and CORS workarounds.
2. **[Setup & Installation Guide](file:///home/joel/progetti/TranscribeAPP/docs/setup.md)**
   - Prerequisites (Bun, Rust, Android SDK, Docker).
   - Local setup, platform targets configuration, and package creation (Arch Linux `PKGBUILD`).
3. **[Testing Standard & Conventions](file:///home/joel/progetti/TranscribeAPP/docs/testing.md)**
   - Running the test suite (`bun test`).
   - Mocking APIs and Tauri commands, and adding new test suites.
4. **[Development Guidelines & Style Guide](file:///home/joel/progetti/TranscribeAPP/docs/guidelines.md)**
   - Strict TypeScript conventions, React 19 structure, and Tailwind CSS v4 patterns.
   - Version synchronization instructions and error handling rules.

---

## Local Maintenance Skills

We also maintain local developer agent skills under `.agents/skills/` to automate formatting, code style checks, document alignment, and regression testing:

- **[Code Style Skill](file:///home/joel/progetti/TranscribeAPP/.agents/skills/code-style/SKILL.md)**: Guides style consistency, strict mode checks, and error handling.
- **[Documentation Guide Skill](file:///home/joel/progetti/TranscribeAPP/.agents/skills/docs-guide/SKILL.md)**: Standardizes markdown style, documentation updates, and link management.
- **[Testing Standards Skill](file:///home/joel/progetti/TranscribeAPP/.agents/skills/testing-standards/SKILL.md)**: Guides writing unit tests, mocking interfaces, and running bun test runner.
- **[Git Workflow Skill](file:///home/joel/progetti/TranscribeAPP/.agents/skills/git-workflow/SKILL.md)**: Governs branch names, local squash-merges, commits formatting, and atomic version bumping.
- **[Tauri Development Skill](file:///home/joel/progetti/TranscribeAPP/.agents/skills/tauri-development/SKILL.md)**: Covers Rust desktop backend logic, system tray menus, and Webview configurations.
- **[Audio Standards Skill](file:///home/joel/progetti/TranscribeAPP/.agents/skills/audio-standards/SKILL.md)**: Focuses on audio recording paths, PCM resampling, and formats support.
- **[Mobile Android Skill](file:///home/joel/progetti/TranscribeAPP/.agents/skills/mobile-android/SKILL.md)**: Detailed Capacitor setup, APK builds, and signing keys configuration.

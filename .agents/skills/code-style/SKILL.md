---
name: code-style
description: "Code style and development standards for TranscribeJS. Covers React 19, TypeScript strict mode, TailwindCSS v4, ESLint, naming conventions, and error handling."
---

# Code Style Skill

This skill enforces programming conventions, type safety, folder layout, and component styling standards across TranscribeJS.

## 1. Programming Language & Type Constraints

* **Strict TypeScript:** Do not use `any`. Specify interfaces or types for all payloads.
* **ESLint Compliance:** Always run `bun run lint` to verify that there are no style or syntax violations.

## 2. React 19 Component Conventions

* **Functional Components:** Always write React components as functional components using named exports.
* **State Management:**
  - Local state: Use `useState`.
  - Shared state: Use React Context providers (like `ThemeContext`).
* **Logic isolation:** Place reusable logic inside `src/hooks/` and API integrations in `src/services/`.

## 3. Styling & Tailwind CSS v4

* **Utility Classes:** Use utility classes directly in JSX code.
* **Conditional Classnames:** Combine class lists using the `cn()` utility wrapper (`clsx` + `tailwind-merge`):
  ```typescript
  className={cn("base-class", isCondition && "conditional-class")}
  ```

## 4. Naming Schemes

* **React Components:** `PascalCase.tsx`
* **Services / Utils:** `camelCase.ts`
* **Variables / Functions:** `camelCase`
* **Types / Interfaces:** `PascalCase`
* **Constants:** `UPPER_SNAKE_CASE`

## 5. Async Error Handling

* Wrap async actions in `try/catch` blocks.
* Display readable feedback to users in error states.
* Log errors in detail using console tags: `console.error("[Service] Failure: ", error)`.

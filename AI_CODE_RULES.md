# AI Coding Standards & Rules

This document outlines the coding standards and rules that must be followed by AI assistants and developers working on this project.

## 1. TypeScript & Type Safety (CRITICAL)

*   **No `any`**: The strict usage of `any` is **prohibited**. It defeats the purpose of TypeScript.
*   **Use `unknown` Sparingly**: If you genuinely cannot determine the type (e.g., raw data from a schemaless external source), use `unknown`.
    *   **Rule**: You must use type guards, schema validation (like Zod), or safe casting (e.g., `(variable as ExpectedType)`) before using the variable.
    *   *Example*: `data.map((item: unknown) => (item as { value: string }).value)`
*   **Centralized Type Definitions**:
    *   **Do not** define interfaces or types locally inside component files unless they are extremely specific, private to that component, and very simple.
    *   **Action**: Create or update type definition files in **`apps/main/types/`**.
    *   Check existing files like `apps/main/types/projectv2.ts` or `apps/main/types/common.ts` before creating new ones.
    *   Always export interfaces so they can be reused.

## 2. Code Structure & Architecture

*   **Directory Structure**: Follow the existing monorepo structure. Code belonging to the main web app goes in `apps/main`. Shared UI components go in `packages/ui`.
*   **Imports**:
    *   Use absolute imports (aliases) whenever possible (e.g., `@/components`, `@/lib`, `@/actions`).
    *   Avoid deep relative paths (e.g., `../../../../components`).
*   **Server vs. Client**:
    *   By default, assume Server Components in `app` directory.
    *   Add `"use client"` at the top of the file **only** if you use React hooks (`useState`, `useEffect`) or event listeners.
    *   Server Actions must have `"use server"` at the top of the file.

## 3. UI & Styling

*   **Tailwind CSS**: Use Tailwind CSS for all styling. Avoid CSS modules or inline styles unless absolutely necessary.
*   **Shadcn UI**: Use the shared UI components from `@repo/ui`.
    *   *Example*: `import { Button } from '@repo/ui/components/ui/button'`
*   **Icons**: Use `lucide-react` for icons.

## 4. Linting & Quality

*   **No Unused Variables**: Remove all unused variables and imports.
*   **No ESLint Warnings**: The goal is 0 warnings. Address all lint warnings immediately.
*   **Comments**: Add brief comments for complex logic, but prefer self-documenting code (clear variable/function names).

## 5. Error Handling

*   **Safe Execution**: Wrap async operations (API calls, database queries) in `try/catch` blocks.
*   **User Feedback**: Verify that UI components handle loading and error states gracefully (e.g., checking `if (!data) return null` or showing a loader).

## 6. Workflow

*   **Check Before Creating**: Before creating a new component or utility, check if it already exists to avoid duplication.
*   **Build Verification**: After making changes, ensure `pnpm build` passes successfully.
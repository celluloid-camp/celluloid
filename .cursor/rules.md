# Cursor Coding Rules for Celluloid

## React
- Always use named functional React components (no class components, no anonymous functions).
- Prefer React hooks for state and side effects.
- Use `useMemo`, `useCallback`, and `useRef` for performance and clarity.
- Extract reusable UI logic into separate components/files.

## TypeScript
- All files should use TypeScript (`.ts`/`.tsx`).
- Type all component props and function arguments.
- Prefer explicit types for exported functions/components.

## File Organization
- Place each major component in its own file.
- Use folders to group related components (e.g., `project/studio/`).
- Place shared utilities in a `utils/` directory.
- Use `index.ts` for module entry points if needed.

## UI & Styling
- Use MUI (Material UI) components for layout and controls.
- Use `sx` prop for inline styling, prefer theme variables.
- Keep UI logic and rendering cleanly separated.

## Modularization
- Extract complex or reusable UI (e.g., overlays, timelines) into their own files.
- Import and use these components in parent files.
- Avoid large monolithic files; split by responsibility.

## General
- Use ES6+ features (arrow functions, destructuring, etc.).
- Prefer named exports for components and utilities.
- Write concise, readable, and maintainable code. 

## Naming Conventions
- New React component files should use snap-case (e.g., `my-component-file.tsx`). 

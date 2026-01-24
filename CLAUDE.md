# CLAUDE.md - Iron Frontier

> **IMPORTANT**: Upon starting a new session, you MUST read `memory-bank/activeContext.md` and `memory-bank/projectbrief.md` to ground yourself in the current state and goals of the project.

## Development Environment

- **Build**: `pnpm run build`
- **Dev**: `pnpm dev` (Vite 8080)
- **Test**: `pnpm test` (Vitest)
- **E2E**: `pnpm run test:e2e` (Playwright)
- **Lint**: `pnpm lint`

## Code Style

- **React**: Functional components, hooks, strong typing.
- **State**: Zustand for global state, minimal `useState`.
- **3D**: Babylon.js via "Reactylon" pattern (declarative components).
- **Styling**: Tailwind CSS v4.
- **Naming**: `PascalCase` for components, `camelCase` for functions/vars.

## Memory Bank

I maintain a set of context files in `memory-bank/` as my long-term memory.

- `projectbrief.md`: Core essence of the project.
- `activeContext.md`: Current session goals and recent history.
- `systemPatterns.md`: Decisions on architecture and patterns.
- `techContext.md`: Tooling and constraints.
- `productContext.md`: "Why" we are building this.
- `progress.md`: What is done and what is next.

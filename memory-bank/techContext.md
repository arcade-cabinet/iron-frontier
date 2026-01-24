# Tech Context

## Technology Stack

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, shadcn/ui components, Framer Motion

### 3D Rendering

- **Engine**: Babylon.js (v7+)
- **Integration**: Custom "Reactylon" bridge
- **Assets**: GLTF/GLB models (draco compressed)

### State & Persistence

- **Runtime**: Zustand
- **Storage**: sql.js (WASM SQLite) + idb-keyval (IndexedDB for binary blobs)
- **Architecture**: In-memory Zustand layout synced to SQLite for saves.

### Quality Assurance

- **Unit Testing**: Vitest
- **E2E Testing**: Playwright
- **Linting**: ESLint + Prettier

## Development Environment

- **Node**: v22.11.0
- **Package Manager**: pnpm
- **Port**: 8080 (Vite dev server)

## Key Constraints

- **Mobile Performance**: Must hold 60fps on mid-range devices.
- **Asset Budget**: ~100MB total for initial load (lazy loading for rest).
- **Touch**: UI must account for "fat fingers" (minimum 44px tap targets).
- **Offline**: Game must be playable without internet (PWA-ready).

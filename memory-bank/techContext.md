# Tech Context

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Expo 55 (React Native 0.83) |
| **Navigation** | Expo Router |
| **Language** | TypeScript 5.9 |
| **3D Engine** | React Three Fiber v9 + Three.js v0.175 |
| **3D Helpers** | @react-three/drei v10, @react-three/xr v6 |
| **Styling** | NativeWind v4 (Tailwind CSS for React Native) |
| **State** | Zustand v5 (12 modular slices) |
| **Schemas** | Zod v4 |
| **ECS** | Miniplex v2 |
| **AI** | Yuka v0.7 (behavior trees, steering) |
| **Audio** | Tone.js v15 |
| **Noise** | simplex-noise v4 |
| **RNG** | Alea (seeded PRNG) |
| **Persistence** | expo-sqlite, idb-keyval |
| **Animation** | React Native Reanimated v4 |
| **UI Primitives** | class-variance-authority, clsx, tailwind-merge |
| **Testing (Unit)** | Jest v29 + jest-expo |
| **Testing (E2E)** | Playwright |
| **Testing (Property)** | fast-check v4 |
| **Linting** | Biome v2 |
| **Build** | Metro bundler (via Expo) |

## Development Environment

| Tool | Version |
|------|---------|
| **Node.js** | 22+ (LTS recommended) |
| **Package Manager** | pnpm 10.20.0 |
| **Dev Server** | Expo CLI (`expo start`) |
| **Web Port** | 8081 (Expo default) |

## Build Targets

| Target | Method |
|--------|--------|
| **Web** | `expo start --web` (dev) / `expo export` (prod) |
| **Android** | EAS Build (`eas build --platform android`) |
| **iOS** | EAS Build (`eas build --platform ios`) |

## Key Constraints

| Constraint | Requirement |
|------------|-------------|
| **Performance** | 60fps on mid-range mobile |
| **Asset Budget** | ~100MB initial load |
| **Touch Targets** | Minimum 44px |
| **Offline** | Works without internet (local persistence) |
| **Orientation** | Landscape primary |

## Configuration Files

| File | Purpose |
|------|---------|
| `app.json` | Expo app configuration |
| `babel.config.js` | Babel transforms (decorators, class properties) |
| `metro.config.js` | Metro bundler configuration |
| `tailwind.config.js` | Tailwind/NativeWind theme |
| `tsconfig.json` | TypeScript configuration |
| `biome.json` | Biome linter/formatter settings |
| `jest.config.js` | Jest test runner configuration |
| `playwright.config.ts` | Playwright E2E configuration |
| `nativewind-env.d.ts` | NativeWind type declarations |

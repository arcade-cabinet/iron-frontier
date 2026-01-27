# Tech Context

## Technology Stack

### Web App (`apps/web/`)

| Layer | Technology |
|-------|------------|
| **Framework** | React 19 |
| **Build Tool** | Vite 7 |
| **Language** | TypeScript (strict-ready) |
| **3D Engine** | Babylon.js 8 (WebGPU) |
| **State** | Zustand |
| **Persistence** | sql.js + IndexedDB |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Animation** | Framer Motion |
| **Testing** | Vitest, Playwright |
| **Linting** | Biome |

### Mobile App (`apps/mobile/`)

| Layer | Technology |
|-------|------------|
| **Framework** | Expo SDK 54, React Native 0.81 |
| **Language** | TypeScript |
| **3D Engine** | React Native Filament |
| **State** | Zustand |
| **Persistence** | expo-sqlite |
| **Styling** | NativeWind |
| **Testing** | Maestro |
| **Build** | EAS Build |

### Shared Package (`packages/shared/`)

| Layer | Technology |
|-------|------------|
| **Schemas** | Zod v4 |
| **Types** | TypeScript |
| **Build** | tsup |

### Documentation (`apps/docs/`)

| Layer | Technology |
|-------|------------|
| **Framework** | Astro 5 |
| **Theme** | Starlight |
| **API Docs** | TypeDoc |

## Development Environment

| Tool | Version |
|------|---------|
| **Node.js** | 22.11.0 |
| **Package Manager** | pnpm 10.20.0 |
| **Dev Port** | 8080 (web), 8081 (mobile) |

## CI/CD

| Platform | Purpose |
|----------|---------|
| **GitHub Actions** | CI/CD pipelines |
| **Render.com** | Web app hosting |
| **GitHub Pages** | Documentation hosting |
| **EAS** | Mobile app builds |

## Key Constraints

| Constraint | Requirement |
|------------|-------------|
| **Performance** | 60fps on mid-range mobile |
| **Asset Budget** | ~100MB initial load |
| **Touch Targets** | Minimum 44px |
| **Offline** | PWA-ready, works without internet |
| **Responsive** | 320px - 1920px viewports |

## Build Outputs

| App | Output |
|-----|--------|
| **Web** | Single HTML file (7.7 MB) |
| **Mobile Android** | Debug APK |
| **Mobile iOS** | IPA via EAS |
| **Docs** | Static site |

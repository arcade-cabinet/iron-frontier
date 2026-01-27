# Tech Context

## Technology Stack

### Unified App (Root)

| Layer | Technology |
|-------|------------|
| **Framework** | Ionic Angular (Angular 20) |
| **Runtime** | Capacitor 8 (Web, Android, iOS) |
| **Desktop** | Electron via `@capacitor-community/electron` |
| **Language** | TypeScript |
| **3D Engine** | Babylon.js 8 (WebGPU/WebGL) |
| **Physics** | Rapier |
| **Animation** | Anime.js |
| **State** | Zustand (migration target) |
| **Persistence** | SQLite/IndexedDB via Capacitor |
| **Styling** | Ionic theming + custom SCSS |
| **Testing** | Karma (Angular default) |

## Development Environment

| Tool | Version |
|------|---------|
| **Node.js** | 22+ (LTS recommended) |
| **Package Manager** | pnpm 10.20.0 |
| **Dev Port** | 8100 (Ionic default) |

## CI/CD

| Platform | Purpose |
|----------|---------|
| **GitHub Actions** | CI/CD pipelines |
| **Render.com** | Web app hosting |
| **Electron** | Desktop packaging |

## Key Constraints

| Constraint | Requirement |
|------------|-------------|
| **Performance** | 60fps on mid-range mobile |
| **Asset Budget** | ~100MB initial load |
| **Touch Targets** | Minimum 44px |
| **Offline** | PWA-ready, works without internet |
| **Responsive** | 320px - 1920px viewports |

## Build Outputs

| Target | Output |
|--------|--------|
| **Web** | `www/` (Ionic build) |
| **Android** | Gradle project in `android/` |
| **iOS** | Xcode project in `ios/` |
| **Electron** | Desktop project in `electron/` |

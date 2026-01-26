# Iron Frontier

**A Cross-Platform Steampunk Frontier RPG - Unity 6**

![Status: v1.0 Development](https://img.shields.io/badge/status-v1.0%20dev-orange)
![Unity: 6.3 LTS](https://img.shields.io/badge/unity-6.3%20LTS-blue)
![Platform: Cross-Platform](https://img.shields.io/badge/platform-android%20%2B%20ios%20%2B%20webgl-brightgreen)

---

## Quick Start

```bash
# Open in Unity Hub
# Unity 6.3 LTS (6000.3.5f1) or later required

# Or open via command line
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity -projectPath .

# Run tests in batch mode
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -runTests -testPlatform EditMode -projectPath . -logFile -
```

---

## What is Iron Frontier?

Iron Frontier is an RPG set in a steampunk American frontier (circa 1887). Players explore authored locations, meet quirky NPCs, engage in turn-based combat, and complete quests in a 3-hour narrative experience.

### Core Features

- **3D Graphics** - URP Mobile-optimized rendering with day/night cycle
- **Turn-Based Combat** - Strategic combat with status effects and abilities
- **Branching Dialogue** - Meaningful conversations that affect the world
- **Quest System** - Multi-stage quests with objectives and rewards
- **AI NPCs** - NavMesh pathfinding with behavior state machines
- **Cross-Platform** - Android, iOS, and WebGL from single codebase

### Theme & Setting

- Late 1800s American frontier
- Steam-powered technology
- Brass, copper, and iron aesthetics
- Western frontier towns and railyards

---

## Project Structure

```
iron-frontier/
├── Assets/
│   ├── Scripts/        # C# game code
│   │   ├── Core/       # GameManager, EventBus, SaveSystem
│   │   ├── Data/       # ScriptableObject data types
│   │   ├── AI/         # NavMesh + behavior trees
│   │   ├── Combat/     # Turn-based combat system
│   │   ├── Dialogue/   # Branching dialogue system
│   │   ├── Quests/     # Quest tracking
│   │   └── UI/         # UI Toolkit components
│   ├── Prefabs/        # Reusable game objects
│   ├── Resources/      # Runtime-loaded assets
│   ├── Scenes/         # Game scenes
│   ├── Art/            # Models, textures, materials
│   └── Audio/          # Music and SFX
├── Packages/           # Unity package manifest
├── ProjectSettings/    # Unity project settings
├── Tests/              # Unit and integration tests
├── REFERENCE/          # TypeScript prototype (gitignored)
├── docs/               # Documentation
└── memory-bank/        # AI agent context
```

---

## Tech Stack

| System | Technology |
|--------|------------|
| **Engine** | Unity 6.3 LTS (6000.3.x) |
| **Rendering** | URP 17 Mobile |
| **Physics** | PhysX |
| **AI** | AI Navigation 2.0 (NavMesh) |
| **Input** | Unity Input System |
| **UI** | UI Toolkit + USS |
| **Audio** | Unity Audio |
| **Testing** | Unity Test Framework |
| **CI/CD** | game-ci + GitHub Actions |

---

## Key Unity 6 Features

| Feature | Usage |
|---------|-------|
| **URP Mobile** | Optimized rendering for mobile GPUs |
| **AI Navigation 2.0** | NPC pathfinding with NavMeshSurface |
| **Input System** | Modern WASD + gamepad support |
| **UI Toolkit** | React-like UI with USS styling |
| **Addressables** | Asset streaming for large worlds |
| **Test Framework** | TDD with NUnit assertions |

---

## Development

### Prerequisites

- Unity 6.3 LTS (6000.3.5f1 or later)
- Unity Hub (recommended)
- Android SDK (for Android builds)
- Xcode (for iOS builds on macOS)

### Commands

```bash
# Resolve packages headlessly
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -quit -projectPath . -logFile -

# Run all tests
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -runTests -testPlatform all -projectPath . -logFile -

# Build Android
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -quit -projectPath . -buildTarget Android \
  -executeMethod BuildScript.BuildAndroid -logFile -
```

---

## Migration from TypeScript

This project was migrated from a React Native + R3F prototype. The original TypeScript code is preserved in `REFERENCE/typescript/` (gitignored) for porting reference.

### Porting Status

| System | Status |
|--------|--------|
| Data Types | Ported to ScriptableObjects |
| Core Systems | Ported (GameManager, EventBus, SaveSystem) |
| Combat | Ported |
| AI | Ported (YukaJS → NavMesh + state machines) |
| Dialogue | Ported |
| Tests | Ported (205+ tests) |
| Assets | Imported (models, textures, audio) |

---

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | AI agent quick reference |
| [docs/UNITY6_MIGRATION_PLAN.md](./docs/UNITY6_MIGRATION_PLAN.md) | Migration roadmap |
| [docs/ARCHITECTURE_V2.md](./docs/ARCHITECTURE_V2.md) | System architecture |

---

## For AI Agents

Read [memory-bank/](./memory-bank/) for:
- Current context (`activeContext.md`)
- Project brief (`projectbrief.md`)
- Architecture decisions (`systemPatterns.md`)
- Tech constraints (`techContext.md`)

---

## Target Platforms

| Platform | Min Version | Notes |
|----------|-------------|-------|
| **Android** | 7.1 (API 25) | ARM64 |
| **iOS** | 15.0 | iPhone, iPad |
| **WebGL** | Modern browsers | WebGL 2.0 |

---

## License

Private project - not for distribution.

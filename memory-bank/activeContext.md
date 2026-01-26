# Active Context

## Current Focus

**Phase 9: Unity 6 Migration - IN PROGRESS** - Migrating from TypeScript/React Native to Unity 6.3 LTS for professional game development stability.

## Unity 6 Migration Session (2026-01-25)

### Why Unity 6?

After multiple sessions battling React Native + iOS build issues:
- iOS New Architecture C++ header issues (glog, folly)
- react-native-screens C++ compilation errors
- expo-three/expo-gl limitations
- Constant SDK update compatibility breaks

**Decision**: Unity 6 provides a stable, professional foundation for mobile game development.

### Migration Progress

**Branch**: `v1.0-unity6` (created from main)

**Completed:**
1. ✅ Created Unity 6.3 LTS project structure at root
2. ✅ Moved TypeScript code to `REFERENCE/typescript/` (gitignored)
3. ✅ Migrated assets (models, textures, audio) to Unity `Assets/`
4. ✅ Created Unity project manifest with packages:
   - URP 17 (mobile rendering)
   - AI Navigation 2.0 (NavMesh)
   - Input System
   - Test Framework
   - Addressables
   - Cinemachine

5. ✅ **Created C# Scripts** (via parallel agents):
   - `Assets/Scripts/Data/` - NPCData, ItemData, QuestData, DialogueData, LocationData, EnemyData
   - `Assets/Scripts/Core/` - GameManager, EventBus, SaveSystem
   - `Assets/Scripts/Systems/` - TimeSystem, WeatherSystem
   - `Assets/Scripts/Input/` - InputController
   - `Assets/Scripts/Combat/` - CombatManager, Combatant, DamageCalculator, StatusEffect, CombatUI, CombatAI
   - `Assets/Scripts/AI/` - AIController, AIState, NPCBehavior, PerceptionSystem, SteeringBehaviors, AIManager
   - `Assets/Scripts/Dialogue/` - DialogueManager, DialogueNode, DialogueOption, DialogueEffect, DialogueUI, DialogueDatabase

6. ✅ **Created Test Framework**:
   - `Tests/EditMode/` - CombatTests, DamageCalculatorTests, QuestSystemTests, InventoryTests, SaveSystemTests
   - `Tests/PlayMode/` - GameFlowTests
   - ~205 test cases ported from TypeScript

7. ✅ **Created CI/CD**:
   - `.github/workflows/unity-build.yml` - game-ci integration
   - Builds: Android, iOS, WebGL
   - Tests run before builds

8. ✅ **Updated Documentation**:
   - `CLAUDE.md` - Unity 6 development guide
   - `README.md` - Updated for Unity project
   - `docs/UNITY6_MIGRATION_PLAN.md` - 8-week migration plan

### Unity 6 Research Sources

- [Unity 6.3 Manual](https://docs.unity3d.com/6000.3/Documentation/Manual/)
- [AI Navigation 2.0](https://docs.unity3d.com/Packages/com.unity.ai.navigation@2.0/)
- [DOTS Tutorial](https://unity.com/dots)
- [UI Toolkit Manual](https://docs.unity3d.com/Manual/UIElements.html)

### Key Unity 6.3 Features

| Feature | Benefit |
|---------|---------|
| URP 17 Mobile | Optimized for mobile GPUs, tile-based deferred rendering |
| AI Navigation 2.0 | NavMeshSurface baking, multiple agent types |
| UI Toolkit | React-like UI with USS styling, SVG support |
| Input System | Modern input handling with context switching |
| Test Framework | TDD with NUnit, EditMode + PlayMode tests |

### Package Management

Using Unity Package Manager with `Packages/manifest.json`:
- Run `openupm add <package>` for third-party packages
- Run Unity in batch mode to resolve: `/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity -batchmode -quit -projectPath . -logFile -`

### TypeScript → C# Porting Reference

| TypeScript | C# Unity |
|------------|----------|
| Zod schemas | ScriptableObject classes |
| Zustand stores | GameManager singleton + events |
| React components | UI Toolkit VisualElements |
| YukaJS AI | NavMesh + state machines |
| useEffect | MonoBehaviour lifecycle |
| Jest/Vitest tests | Unity Test Framework |

---

## Previous Focus

**Phase 8: R3F Migration & AI Integration - COMPLETE** - Archived to `REFERENCE/typescript/`.

Summary of TypeScript implementation:
- 739 tests passing
- React Three Fiber rendering
- YukaJS AI with state machines
- Expo SDK 54 mobile app
- 10 main quests, 9 side quests, 77 items, 35 enemies
- Audio system (10 moods, 50+ SFX)

---

## Project Structure (Unity 6)

```
iron-frontier/
├── Assets/
│   ├── Scripts/        # C# game code
│   │   ├── Core/       # GameManager, EventBus, SaveSystem
│   │   ├── Data/       # ScriptableObject data types
│   │   ├── AI/         # NavMesh + state machines
│   │   ├── Combat/     # Turn-based combat
│   │   ├── Dialogue/   # Branching dialogue
│   │   ├── Quests/     # Quest tracking
│   │   ├── UI/         # UI Toolkit
│   │   ├── Input/      # Input System
│   │   └── Systems/    # Time, Weather
│   ├── Art/            # Models, textures, materials
│   ├── Audio/          # Music, SFX
│   ├── Prefabs/        # Reusable game objects
│   ├── Resources/      # Runtime-loaded assets
│   └── Scenes/         # Game scenes
├── Packages/           # Unity package manifest
├── ProjectSettings/    # Unity settings
├── Tests/              # EditMode + PlayMode tests
├── REFERENCE/          # TypeScript code (gitignored)
├── docs/               # Documentation
└── memory-bank/        # AI agent context
```

---

## Next Steps

1. [ ] Open project in Unity Editor to verify package resolution
2. [ ] Create initial scenes (MainMenu, Overworld, Combat, Town)
3. [ ] Set up URP rendering pipeline asset
4. [ ] Import dialogue JSON data from TypeScript
5. [ ] Create prefabs for NPCs, enemies, items
6. [ ] Set up NavMesh surfaces for town scenes
7. [ ] Run tests in Unity to verify ported logic

# CLAUDE.md - Iron Frontier (Unity 6)

> **IMPORTANT**: Upon starting a new session, read `memory-bank/activeContext.md` and `memory-bank/projectbrief.md` to understand the current project state.

## Project Overview

Iron Frontier is a Western steampunk RPG being built in **Unity 6.3 LTS**. The TypeScript/React Native prototype has been archived to `REFERENCE/typescript/` for porting reference.

## Unity 6 Project Structure

```
iron-frontier/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/           # GameManager, EventBus, SaveSystem
│   │   ├── Data/           # ScriptableObject data types
│   │   ├── AI/             # NavMesh + custom AI behaviors
│   │   ├── Combat/         # Turn-based combat system
│   │   ├── Dialogue/       # Branching dialogue system
│   │   ├── Quests/         # Quest tracking
│   │   ├── UI/             # UI Toolkit components
│   │   ├── Input/          # Input System integration
│   │   └── Systems/        # Time, Weather, etc.
│   ├── Prefabs/
│   ├── Resources/Data/     # JSON data imports
│   ├── Scenes/
│   ├── Art/
│   │   ├── Models/         # GLB/FBX 3D models
│   │   ├── Textures/       # PBR textures
│   │   └── Materials/
│   ├── Audio/
│   │   ├── Music/
│   │   └── SFX/
│   └── UI/                 # USS stylesheets
├── Packages/               # Unity package manifest
├── ProjectSettings/        # Unity project settings
├── Tests/
│   ├── EditMode/           # Unit tests
│   └── PlayMode/           # Integration tests
├── REFERENCE/              # TypeScript prototype (gitignored)
│   └── typescript/
├── docs/                   # Documentation
└── memory-bank/            # AI agent context files
```

## Development Commands

```bash
# Open project in Unity (GUI)
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity -projectPath .

# Resolve packages headlessly
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity -batchmode -quit -projectPath . -logFile -

# Run tests in batch mode
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -runTests -testPlatform EditMode -projectPath . -logFile -

# Build for Android
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -quit -projectPath . -buildTarget Android \
  -executeMethod BuildScript.BuildAndroid -logFile -

# Build for iOS
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -quit -projectPath . -buildTarget iOS \
  -executeMethod BuildScript.BuildIOS -logFile -

# Build for WebGL
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -quit -projectPath . -buildTarget WebGL \
  -executeMethod BuildScript.BuildWebGL -logFile -
```

## Unity 6 Key Features Used

| Feature | Purpose |
|---------|---------|
| **URP 17** | Optimized mobile rendering |
| **AI Navigation 2.0** | NavMesh for NPC pathfinding |
| **Input System** | Modern input handling |
| **UI Toolkit** | Modern UI with USS styling |
| **Addressables** | Asset streaming |
| **DOTS/ECS** | High-performance entities (optional) |
| **Cinemachine** | Camera system |
| **Test Framework** | TDD with NUnit |

## Code Style

- **Namespace**: `IronFrontier.*` (Core, Data, AI, Combat, Dialogue, Quests, UI, Systems, Input)
- **Patterns**: Singleton for managers, ScriptableObject for data, state machines for AI
- **Naming**: `PascalCase` for classes/methods, `camelCase` for fields, `_camelCase` for private fields
- **Comments**: XML documentation on all public members

## TypeScript → C# Porting Guide

| TypeScript | C# |
|------------|-----|
| `interface Foo { }` | `public class Foo { }` or `public struct Foo { }` |
| `type Foo = 'a' \| 'b'` | `public enum Foo { A, B }` |
| `const foo: Foo = { }` | `ScriptableObject` asset |
| Zod schema | `[Serializable]` class |
| Zustand store | `GameManager` singleton + events |
| React component | UI Toolkit `VisualElement` |
| useEffect | `MonoBehaviour` lifecycle |
| YukaJS AI | NavMesh + state machines |

## Memory Bank

Context files in `memory-bank/` for AI agent continuity:

| File | Purpose |
|------|---------|
| `activeContext.md` | Current focus, recent changes |
| `projectbrief.md` | Core project goals |
| `systemPatterns.md` | Architecture decisions |
| `techContext.md` | Tech stack and constraints |
| `productContext.md` | Product vision and UX |
| `progress.md` | Completed and planned work |

## Testing

```csharp
// EditMode test example
[Test]
public void Damage_Calculation_Is_Correct() {
    var attacker = new Combatant { Attack = 10 };
    var defender = new Combatant { Defense = 5 };

    int damage = DamageCalculator.CalculateDamage(attacker, defender);

    Assert.AreEqual(5, damage);
}

// PlayMode test example
[UnityTest]
public IEnumerator Combat_Ends_When_All_Enemies_Defeated() {
    // Setup
    var combat = new GameObject().AddComponent<CombatManager>();
    combat.StartCombat(new List<Enemy> { new Enemy { HP = 1 } });

    // Act
    combat.ExecuteAction(new AttackAction { Damage = 10 });
    yield return null;

    // Assert
    Assert.AreEqual(CombatState.Victory, combat.State);
}
```

## Key Unity 6 APIs

```csharp
// Modern Unity 6 patterns
FindFirstObjectByType<T>();      // Replaces FindObjectOfType
Object.InstantiateAsync();       // Async instantiation
NavMeshSurface.BuildNavMesh();   // Runtime NavMesh
InputSystem.actions["Move"];     // Input System

// UI Toolkit
var doc = GetComponent<UIDocument>();
var button = doc.rootVisualElement.Q<Button>("my-button");
button.clicked += OnButtonClicked;
```

## Sources

- [Unity 6.3 Manual](https://docs.unity3d.com/6000.3/Documentation/Manual/)
- [AI Navigation 2.0 Docs](https://docs.unity3d.com/Packages/com.unity.ai.navigation@2.0/)
- [DOTS Tutorial](https://unity.com/dots)
- [UI Toolkit Manual](https://docs.unity3d.com/Manual/UIElements.html)

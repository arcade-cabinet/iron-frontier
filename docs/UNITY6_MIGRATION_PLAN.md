# Unity 6 Migration Plan - Iron Frontier

## Why Unity 6?

### Current Pain Points with React Native + R3F
| Problem | Frequency | Unity 6 Solution |
|---------|-----------|------------------|
| iOS build failures (C++ headers) | Every SDK update | Native build system |
| New Architecture compatibility | Constant | N/A - native from start |
| expo-three/expo-gl limitations | Often | Native OpenGL/Metal |
| Testing friction (Maestro, Playwright, Vitest) | Always | Unity Test Framework |
| Performance ceilings | At scale | DOTS/ECS, Jobs System |
| Cross-platform consistency | Often | Single codebase |

### Unity 6 Features Perfect for Iron Frontier (Western RPG)
| Feature | Benefit for Iron Frontier |
|---------|---------------------------|
| **DOTS (ECS)** | Handle 1000s of NPCs, animals, vegetation at 60fps |
| **NavMesh** | Built-in pathfinding for NPCs, horses, wagons |
| **Behavior Trees** | Complex NPC AI (sheriffs patrol, outlaws flee, merchants trade) |
| **URP Mobile** | Optimized for mobile GPUs, 4x CPU improvement |
| **Physics** | Bullet collisions, ragdoll, destruction |
| **Cinemachine** | Cinematic cameras for combat, dialogue, cutscenes |
| **Timeline** | Story sequences, quest cutscenes |
| **Addressables** | Stream world chunks, towns on demand |
| **Terrain** | Built-in terrain with LOD, vegetation scattering |

---

## Asset Reuse Strategy

### What Can Be Ported

```
┌─────────────────────────────────────────────────────────────────┐
│                     IRON FRONTIER ASSETS                        │
├───────────────────┬─────────────────────────────────────────────┤
│ Game Logic (TS)   │ → C# (90% syntax similarity)                │
├───────────────────┼─────────────────────────────────────────────┤
│ Zod Schemas       │ → C# ScriptableObjects + JSON Schema        │
├───────────────────┼─────────────────────────────────────────────┤
│ YukaJS AI         │ → Unity NavMesh + Behavior Designer         │
├───────────────────┼─────────────────────────────────────────────┤
│ Game Data (JSON)  │ → ScriptableObjects or JSON import          │
│ - NPCs, Quests    │                                             │
│ - Items, Dialogue │                                             │
│ - Towns, Routes   │                                             │
├───────────────────┼─────────────────────────────────────────────┤
│ Zustand Store     │ → Unity Signals or custom EventBus         │
├───────────────────┼─────────────────────────────────────────────┤
│ Audio (Tone.js)   │ → Unity Audio + FMOD/Wwise                  │
├───────────────────┼─────────────────────────────────────────────┤
│ 3D Models (GLB)   │ → Direct import (Unity supports GLTF)       │
├───────────────────┼─────────────────────────────────────────────┤
│ Textures (PNG)    │ → Direct import                             │
├───────────────────┼─────────────────────────────────────────────┤
│ UI Components     │ → UI Toolkit (similar to React patterns)    │
└───────────────────┴─────────────────────────────────────────────┘
```

### TypeScript → C# Mapping

```csharp
// TypeScript (current)
interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  position: Vector3;
  personality: NPCPersonality;
}

// C# (Unity)
[System.Serializable]
public class NPC {
  public string id;
  public string name;
  public NPCRole role;
  public Vector3 position;
  public NPCPersonality personality;
}
```

---

## Migration Timeline

### Phase 1: Project Setup (Week 1)

```
unity-iron-frontier/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/           # Game systems
│   │   ├── Data/           # ScriptableObjects
│   │   ├── AI/             # NPC behaviors
│   │   ├── Combat/         # Turn-based combat
│   │   ├── Dialogue/       # Conversation system
│   │   ├── Quests/         # Quest tracking
│   │   └── UI/             # UI Toolkit
│   ├── Prefabs/
│   ├── Resources/
│   │   └── Data/           # JSON imports from TS
│   ├── Scenes/
│   │   ├── MainMenu.unity
│   │   ├── Overworld.unity
│   │   ├── Combat.unity
│   │   └── Town.unity
│   └── Settings/
│       └── URP/
├── Packages/
├── ProjectSettings/
└── Tests/
    ├── EditMode/
    └── PlayMode/
```

**Tasks:**
- [ ] Create Unity 6 project (URP Mobile template)
- [ ] Configure Unity Test Framework
- [ ] Set up CI/CD with batch mode builds
- [ ] Import existing 3D assets (GLB/GLTF)
- [ ] Port type definitions to C# classes

### Phase 2: Core Systems (Week 2)

**Game State Management**
```csharp
// GameManager.cs - Singleton pattern
public class GameManager : MonoBehaviour {
    public static GameManager Instance { get; private set; }

    public GamePhase CurrentPhase { get; private set; }
    public PlayerData Player { get; private set; }
    public TimeState Time { get; private set; }

    public event Action<GamePhase> OnPhaseChanged;
    public event Action<TimeState> OnTimeChanged;
}
```

**Tasks:**
- [ ] Port GameStore → GameManager singleton
- [ ] Port TimeSystem → Unity coroutines
- [ ] Port SaveSystem → Unity PlayerPrefs + JSON
- [ ] Port InputSystem → Unity Input System
- [ ] Create EventBus for cross-system communication

### Phase 3: World & Terrain (Week 3)

**Streaming Terrain**
```csharp
// TerrainChunk.cs - Addressable loading
public class TerrainChunk : MonoBehaviour {
    public ChunkCoord Coord { get; private set; }
    public BiomeType Biome { get; private set; }

    public async Task LoadAsync() {
        var terrain = await Addressables.LoadAssetAsync<GameObject>($"Chunk_{Coord}");
        Instantiate(terrain, transform);
    }
}
```

**Tasks:**
- [ ] Create terrain system with Unity Terrain or custom mesh
- [ ] Implement chunk streaming with Addressables
- [ ] Port BiomeSystem → Terrain layers
- [ ] Add vegetation scattering (SpeedTree or custom)
- [ ] Implement day/night cycle with lighting presets

### Phase 4: NPC AI (Week 4)

**YukaJS → Unity NavMesh + Behavior Trees**
```csharp
// NPCController.cs
[RequireComponent(typeof(NavMeshAgent))]
public class NPCController : MonoBehaviour {
    public NPCData Data;
    public BehaviorTree BehaviorTree;

    private NavMeshAgent agent;

    void Start() {
        agent = GetComponent<NavMeshAgent>();
        agent.speed = Data.MaxSpeed;

        // Start behavior tree
        BehaviorTree.SetVariable("DetectionRange", Data.DetectionRange);
        BehaviorTree.Start();
    }
}
```

**Behavior Tree Structure:**
```
Root (Selector)
├── Alert Sequence
│   ├── Can See Player?
│   ├── Face Player
│   └── Wait 0.5s
├── Patrol Sequence (Sheriff, Deputy)
│   ├── Has Patrol Route?
│   ├── Move To Waypoint
│   └── Wait At Waypoint
├── Wander Sequence (Drifter, Miner)
│   ├── Pick Random Point
│   ├── Move To Point
│   └── Wait Random Time
└── Idle (Default)
```

**Tasks:**
- [ ] Port AIManager → NavMeshAgent + Behavior Designer
- [ ] Create behavior trees for each NPC role
- [ ] Implement perception system (vision cones)
- [ ] Add NPC spawning system
- [ ] Create NPC interaction triggers

### Phase 5: Combat System (Week 5)

**Turn-Based Combat**
```csharp
// CombatManager.cs
public class CombatManager : MonoBehaviour {
    public CombatState State { get; private set; }
    public List<Combatant> Combatants { get; private set; }

    public async Task StartCombat(List<Enemy> enemies) {
        State = CombatState.PlayerTurn;

        // Transition to combat scene
        await SceneManager.LoadSceneAsync("Combat", LoadSceneMode.Additive);

        // Set up combatants
        foreach (var enemy in enemies) {
            SpawnCombatant(enemy);
        }
    }

    public void ExecuteAction(CombatAction action) {
        // Process action
        // Animate
        // Check for victory/defeat
    }
}
```

**Tasks:**
- [ ] Port CombatSystem → CombatManager
- [ ] Create combat scene with positioning
- [ ] Implement action execution with animations
- [ ] Add combat UI (health bars, action menu)
- [ ] Port damage calculations

### Phase 6: Dialogue & Quests (Week 6)

**Dialogue System**
```csharp
// DialogueManager.cs
public class DialogueManager : MonoBehaviour {
    public DialogueTree CurrentTree { get; private set; }

    public void StartDialogue(string npcId) {
        CurrentTree = Resources.Load<DialogueTree>($"Dialogue/{npcId}");
        ShowDialogueUI(CurrentTree.RootNode);
    }

    public void SelectOption(DialogueOption option) {
        // Apply effects
        foreach (var effect in option.Effects) {
            effect.Apply();
        }

        // Navigate to next node
        ShowDialogueUI(option.NextNode);
    }
}
```

**Tasks:**
- [ ] Port DialogueSystem → ScriptableObject trees
- [ ] Import existing dialogue JSON
- [ ] Create dialogue UI
- [ ] Port QuestSystem → Quest ScriptableObjects
- [ ] Implement quest tracking UI

### Phase 7: UI & Polish (Week 7)

**UI Toolkit (React-like)**
```csharp
// HUD.cs
public class HUD : MonoBehaviour {
    private UIDocument document;

    void Start() {
        document = GetComponent<UIDocument>();

        // Bind data
        var healthBar = document.rootVisualElement.Q<ProgressBar>("health-bar");
        healthBar.value = GameManager.Instance.Player.Health;

        // Listen for changes
        GameManager.Instance.OnHealthChanged += (health) => {
            healthBar.value = health;
        };
    }
}
```

**Tasks:**
- [ ] Create HUD with UI Toolkit
- [ ] Port inventory panel
- [ ] Port journal/quest log
- [ ] Create main menu
- [ ] Add settings menu

### Phase 8: Audio & Effects (Week 8)

**Tasks:**
- [ ] Port audio system → Unity Audio
- [ ] Add western ambient sounds
- [ ] Implement combat SFX
- [ ] Add UI sounds
- [ ] Create particle effects (dust, gunfire)

---

## Testing Strategy

### Unity Test Framework

```csharp
// CombatTests.cs
public class CombatTests {
    [Test]
    public void Damage_Calculation_Is_Correct() {
        var attacker = new Combatant { Attack = 10 };
        var defender = new Combatant { Defense = 5 };

        int damage = CombatCalculator.CalculateDamage(attacker, defender);

        Assert.AreEqual(5, damage);
    }

    [UnityTest]
    public IEnumerator Combat_Ends_When_All_Enemies_Defeated() {
        var combat = new GameObject().AddComponent<CombatManager>();
        combat.StartCombat(new List<Enemy> { new Enemy { HP = 1 } });

        combat.ExecuteAction(new AttackAction { Damage = 10 });

        yield return null;

        Assert.AreEqual(CombatState.Victory, combat.State);
    }
}
```

### AltTester for Visual Testing

```csharp
[Test]
public void TestDialogueFlow() {
    altDriver.FindObject(By.NAME, "NPC_Sheriff").Tap();

    Assert.IsNotNull(altDriver.FindObject(By.NAME, "DialoguePanel"));

    altDriver.FindObject(By.NAME, "DialogueOption_1").Tap();

    // Screenshot comparison
    altDriver.GetPNGScreenshot("dialogue_sheriff.png");
}
```

---

## Build Automation

### GitHub Actions CI

```yaml
# .github/workflows/unity-build.yml
name: Unity Build

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: game-ci/unity-test-runner@v4
        with:
          projectPath: unity-iron-frontier
          testMode: all

  build:
    needs: test
    strategy:
      matrix:
        platform: [iOS, Android, WebGL]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: game-ci/unity-builder@v4
        with:
          projectPath: unity-iron-frontier
          targetPlatform: ${{ matrix.platform }}
```

---

## Comparison: Current vs Unity 6

| Aspect | React Native + R3F | Unity 6 |
|--------|-------------------|---------|
| **Build reliability** | ❌ Frequent failures | ✅ Mature toolchain |
| **3D Performance** | Good | Excellent (DOTS) |
| **AI/Pathfinding** | Manual (Yuka) | Built-in NavMesh |
| **Physics** | Limited | PhysX |
| **Testing** | Fragmented (Jest/Vitest/Playwright/Maestro) | Unified (Unity Test Framework) |
| **Asset pipeline** | Manual | Built-in |
| **Mobile optimization** | Manual | URP Mobile |
| **Editor** | VS Code only | Visual + Code |
| **Asset store** | None | Thousands |
| **Learning curve** | React skills | New engine |
| **Build size** | ~50MB | ~30-80MB |

---

## Recommendation

**Unity 6 is the professional choice for Iron Frontier:**

1. **Stability** - No more dependency hell, native build system
2. **Performance** - DOTS for 1000s of NPCs, mobile-optimized rendering
3. **Testing** - Single testing framework that works
4. **AI** - NavMesh + Behavior Trees > manual YukaJS
5. **Asset Pipeline** - Import GLB, textures, audio directly
6. **Long-term** - Industry standard, extensive documentation

**Migration effort:** ~8 weeks (one developer)

The existing game logic in TypeScript can be ported to C# - the languages are 90% similar. Game data (JSON) imports directly.

---

## Next Steps

1. Create Unity 6 project with URP Mobile template
2. Port type definitions (NPCData, QuestData, etc.) to C#
3. Import existing 3D assets
4. Set up Unity Test Framework
5. Begin Phase 1: Project Setup

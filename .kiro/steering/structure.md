# Project Structure

## Monorepo Organization

```
iron-frontier/
├── apps/
│   ├── web/                      # Web game client
│   ├── mobile/                   # Mobile game client
│   └── docs/                     # Documentation site
├── packages/
│   ├── shared/                   # DRY: All game logic
│   ├── assets/                   # 3D models, textures (Git LFS)
│   ├── types/                    # Shared TypeScript types
│   └── ui/                       # Shared UI components
├── memory-bank/                  # AI context files
├── .github/workflows/            # CI/CD pipelines
└── .maestro/                     # Mobile E2E tests
```

## Web App (`apps/web/`)

```
src/
├── game/
│   ├── Game.tsx                  # Root game component, phase routing
│   ├── store/
│   │   └── webGameStore.ts       # Web-specific Zustand store
│   ├── components/
│   │   └── GameScene.tsx         # Babylon.js 3D scene
│   ├── screens/
│   │   └── TitleScreen.tsx       # Splash + main menu
│   ├── ui/                       # Game UI panels
│   │   ├── ActionBar.tsx         # Bottom navigation
│   │   ├── DialogueBox.tsx       # NPC dialogue
│   │   ├── InventoryPanel.tsx
│   │   ├── CombatPanel.tsx
│   │   ├── ShopPanel.tsx
│   │   └── ...
│   └── lib/
│       ├── procgen.ts            # Sector generator
│       └── prng.ts               # Seeded RNG
├── engine/                       # Babylon.js rendering
│   ├── hex/                      # Hex grid system
│   ├── rendering/                # SceneManager
│   └── terrain/                  # Heightmap, chunks
├── components/ui/                # shadcn/ui components
└── test/                         # Vitest tests
```

## Mobile App (`apps/mobile/`)

```
app/                              # Expo Router pages
src/
├── components/                   # Filament renderer
└── store/                        # Mobile-specific store
```

## Shared Package (`packages/shared/`)

**Critical**: All game logic, schemas, and data live here for DRY architecture.

```
src/
├── data/
│   ├── schemas/                  # Zod validation schemas
│   │   ├── item.ts               # Item schema
│   │   ├── npc.ts                # NPC schema
│   │   ├── quest.ts              # Quest schema
│   │   ├── combat.ts             # Combat schema
│   │   └── dialogue.ts           # Dialogue schema
│   ├── items/                    # Item definitions
│   ├── npcs/                     # NPC definitions
│   ├── quests/                   # Quest definitions
│   └── generation/               # Procedural generators
│       ├── generators/
│       │   ├── nameGenerator.ts
│       │   ├── npcGenerator.ts
│       │   ├── questGenerator.ts
│       │   ├── itemGenerator.ts
│       │   └── worldGenerator.ts
│       ├── templates/            # Generation templates
│       └── pools/                # Name/content pools
├── store/                        # Shared store types
├── types/                        # TypeScript types
├── lib/                          # Utilities
└── index.ts                      # Package exports
```

## Import Patterns

```typescript
// Import schemas
import { ItemSchema, type Item } from '@iron-frontier/shared/data/schemas/item';

// Import data
import { getItem, getAllItems } from '@iron-frontier/shared/data/items';

// Import generators
import { generateNPC } from '@iron-frontier/shared/data/generation/generators/npcGenerator';

// Import store types
import type { GameState } from '@iron-frontier/shared/store';
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/game/Game.tsx` | Main game component, phase routing |
| `apps/web/src/game/store/webGameStore.ts` | Web Zustand store |
| `packages/shared/src/store/index.ts` | Shared store types |
| `packages/shared/src/data/schemas/*.ts` | All Zod schemas |
| `packages/shared/src/data/generation/*.ts` | Procedural generators |
| `apps/web/src/engine/hex/HexSceneManager.ts` | Babylon.js scene orchestration |

## Test Structure

Tests mirror source structure:
- `apps/web/src/test/` - Web-specific tests
- Unit tests co-located with source files
- E2E tests in `.maestro/` (mobile) and `apps/web/tests/` (web)

## Asset Management

- 3D models: `packages/assets/models/` (Git LFS)
- Textures: `packages/assets/textures/` (Git LFS)
- Synced to `apps/web/public/assets/` during build

## Documentation

- Architecture: `docs/ARCHITECTURE.md`
- Game Design: `docs/GAME_DESIGN.md`
- Development Guide: `docs/DEVELOPMENT_GUIDE.md`
- Memory Bank: `memory-bank/*.md` (AI context)

# Active Context

## Current Focus

**Expo Unified Architecture Migration - STRUCTURE REFINEMENT** - Moved components to src/ following Expo best practices, fixing imports and path aliases.

## Expo Migration Summary (2026-01-26)

### ✅ MIGRATION COMPLETE - ALL 8 PHASES + CLEANUP + STRUCTURE REFINEMENT

**Phase 1-8: Core Migration** ✅ (Completed earlier)
- Expo project setup with tabs template
- Game logic, 3D rendering, UI components migrated
- Assets moved, tests configured, CI/CD marked for update
- Old monorepo structure removed

**Phase 9: Repository Audit & Final Cleanup** ✅ (Completed earlier)
- Removed ~1,264 old monorepo files
- Updated documentation (AGENTS.md, CLAUDE.md, GEMINI.md)
- Git tag `v0.1-monorepo` created to preserve old structure

**Phase 10: Critical Recovery** ✅ (Completed earlier)
- Restored accidentally deleted `src/` and `__tests__/` directories
- Fixed jest.config.cjs for ES module compatibility
- 19 commits made to feature branch

**Phase 11: Expo Best Practices Alignment** ✅ (Just completed)
- **Moved components/ to src/components/** following Expo recommended structure
- **Updated tsconfig.json** path alias from `@/* -> ./*` to `@/* -> ./src/*`
- **Fixed all imports** from `@/src/*` to `@/*` throughout codebase (7 files)
- **Updated jest.config.cjs** to reflect new structure
- **Updated AGENTS.md** with correct file paths
- **Fixed test imports** to use @/ path alias
- Commit 44c5d26 pushed to remote

### Current Structure (Expo Best Practices)
```
iron-frontier/
├── app/                    # Expo Router pages
├── src/                    # ALL source code (Expo recommended)
│   ├── components/         # React components (moved from root)
│   │   ├── ui/             # Base UI components
│   │   └── game/           # Game-specific components
│   ├── store/              # Zustand store
│   ├── lib/                # Utilities
│   ├── game/               # Game systems
│   └── types/              # TypeScript types
├── assets/                 # 3D models, textures (Git LFS)
├── __tests__/              # Jest tests
├── .maestro/               # Mobile E2E tests
├── docs/                   # Documentation
└── memory-bank/            # AI context files
```

### Migration Statistics
- **20 commits** made to feature branch (all pushed)
- **Components created**: 20+ (HUD, UI panels, navigation)
- **Assets migrated**: 201 files (models + textures)
- **Old structure removed**: 2,086 files deleted total
- **Structure refined**: 25 component files moved to src/

### Known Issues
- **Tests using Vitest**: Old tests in src/ use Vitest, but we're using Jest with Expo
  - 10 test files need conversion from Vitest to Jest
  - Only __tests__/components/ui/Button.test.tsx uses Jest currently
- **TypeScript errors**: ~40 type errors in components (variant mismatches, missing exports)
- **Test failures**: Button test has async render issues

### Next Steps
1. ✅ Move components to src/ (DONE)
2. ✅ Update path aliases (DONE)
3. ✅ Fix imports (DONE)
4. ⏭️ Fix TypeScript errors in components
5. ⏭️ Convert Vitest tests to Jest or remove old tests
6. ⏭️ Fix Button test async issues
7. ⏭️ Run typecheck and fix all errors
8. ⏭️ Test Expo web platform
9. ⏭️ Update CI/CD workflows
10. ⏭️ Merge to main

### Status
- ✅ Expo dev server can run (tested earlier)
- ✅ Single unified Expo app structure
- ✅ All old monorepo files removed
- ✅ Documentation updated
- ✅ Components moved to src/ (Expo best practice)
- ⚠️ TypeScript errors need fixing
- ⚠️ Old Vitest tests need conversion
- ⏭️ Ready for testing and fixes

---

## Previous Focus

**Phase 8: R3F Migration & AI Integration - COMPLETE** - Migrated from Babylon.js to React Three Fiber. Added YukaJS for AI.

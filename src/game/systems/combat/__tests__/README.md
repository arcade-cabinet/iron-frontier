# Combat System Test Suite

Comprehensive test coverage for the Iron Frontier combat system.

## Coverage Summary

**Overall Coverage: 90.32%**

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| ai.ts | 93.87% | 88.09% | 95.83% | 93.18% |
| damage.ts | 100% | 86.95% | 100% | 100% |
| engine.ts | 93.85% | 90.22% | 97.87% | 94.23% |
| index.ts | 93.75% | 70.58% | 100% | 92.59% |
| store.ts | 78.23% | 66.07% | 89.18% | 80.83% |
| types.ts | 100% | 100% | 100% | 100% |

**Total Tests: 240 passing**

## Test Files

### 1. `damage.test.ts` (Core Damage Calculations)
Tests all damage calculation functions including:
- Base damage calculation
- Variance application
- Critical hit multipliers
- Defense reduction
- Fatigue penalties
- Type effectiveness
- Hit/miss calculations
- Status effect damage
- Healing calculations
- Stat modifiers from effects

**Coverage:** 100% statements, 86.95% branches

### 2. `engine.test.ts` (Combat Engine)
Tests the core combat engine including:
- Combatant creation (player and enemies)
- Combat initialization
- Turn order calculation
- Turn advancement
- Action processing (attack, defend, item, flee)
- Status effect application
- Victory/defeat detection
- Reward calculation
- Action validation

**Coverage:** 93.85% statements, 90.22% branches

### 3. `ai.test.ts` (Enemy AI)
Tests AI decision-making and behavior:
- Target selection strategies (lowest HP, highest threat, player-first, random)
- Behavior patterns (aggressive, defensive, support, random, ranged)
- AI decision making
- Item usage decisions
- Situation evaluation

**Coverage:** 93.87% statements, 88.09% branches

### 4. `store.test.ts` (Zustand Store Integration)
Tests the combat store slice:
- Store initialization
- Combat start/end
- Action selection and execution
- Turn management
- Query methods (getCurrentCombatant, getValidTargets, etc.)
- Selectors (phase, round, HP percentages, etc.)
- Event callbacks

**Coverage:** 78.23% statements, 66.07% branches

### 5. `integration.test.ts` (End-to-End Combat Flows)
Tests complete combat scenarios:
- Full combat flow to victory
- Player defeat scenarios
- Successful flee attempts
- Boss fight restrictions
- Multi-enemy combat
- Status effects in combat
- AI behavior patterns
- Damage calculation edge cases
- Reward calculation
- Round management

**Coverage:** Comprehensive integration testing

### 6. `edge-cases.test.ts` (Boundary Conditions & Error Handling)
Tests unusual scenarios and edge cases:
- Extreme stat values (zero attack, very high defense)
- Hit chance boundaries (5% min, 95% max)
- Status effect edge cases (bleeding with 0 HP, multiple effects stacking)
- Combat action edge cases (no targets, invalid actors)
- Initialization edge cases (no enemies, missing definitions)
- Boundary conditions (1 HP, 0 HP, 100% accuracy)

**Coverage:** Extensive edge case coverage

## Test Patterns

### Mocking
Tests use Jest mocks for:
- Data access functions (`getEncounterById`, `getEnemyById`)
- Event callbacks (`onCombatEnd`)
- Random values for deterministic testing

### Fixtures
Reusable test data:
- `mockPlayerStats`: Standard player combat stats
- `mockEnemy`: Basic enemy definition
- `mockEncounter`: Standard combat encounter
- Helper functions for creating test states

### Deterministic Testing
All random elements can be controlled via optional parameters:
```typescript
processAction(state, action, {
  hitRoll: 0.5,      // Control hit/miss
  critRoll: 0.1,     // Control critical hits
  damageVariance: 0.5 // Control damage variance
});
```

## Running Tests

```bash
# Run all combat tests
pnpm test src/game/systems/combat/__tests__/

# Run with coverage
pnpm test src/game/systems/combat/__tests__/ --coverage

# Run specific test file
pnpm test src/game/systems/combat/__tests__/damage.test.ts

# Watch mode
pnpm test src/game/systems/combat/__tests__/ --watch
```

## Coverage Goals

✅ **Target: 90%+ coverage** - ACHIEVED (90.32%)

### Areas with Lower Coverage

1. **store.ts (78.23%)**: Some error handling paths and edge cases in the store slice
2. **index.ts branches (70.58%)**: Convenience functions with multiple conditional paths

These areas have lower coverage due to:
- Complex error handling paths that are difficult to trigger
- Multiple conditional branches in convenience functions
- Some defensive programming checks that rarely execute

## Test Organization

Tests follow the existing controller test patterns:
- Clear describe blocks for logical grouping
- Descriptive test names using "should" convention
- Setup/teardown with `beforeEach`
- Comprehensive assertions
- Edge case coverage

## Key Testing Principles

1. **Deterministic**: All random values can be controlled
2. **Isolated**: Each test is independent
3. **Comprehensive**: Tests cover happy paths, error cases, and edge cases
4. **Maintainable**: Clear structure and reusable fixtures
5. **Fast**: All 240 tests run in ~1.7 seconds

## Future Improvements

Potential areas for additional testing:
- More complex multi-combatant scenarios
- Performance testing for large battles
- Stress testing with extreme stat values
- Additional AI behavior patterns
- More store integration scenarios

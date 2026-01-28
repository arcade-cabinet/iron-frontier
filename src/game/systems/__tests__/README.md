# Survival Systems Test Suite

Comprehensive test coverage for Iron Frontier's survival systems.

## Test Files

### Core Survival Systems

1. **time.test.ts** - GameClock time system (90+ tests)
   - Time queries and formatting
   - Time phases (dawn, day, dusk, night)
   - Ambient light calculations
   - Time advancement and control
   - Event system (tick, hourChanged, phaseChanged, dayChanged)
   - Serialization and state management
   - Utility functions

2. **fatigue.test.ts** - FatigueSystem (100+ tests)
   - Fatigue levels (rested, tired, weary, exhausted, collapsed)
   - Combat and travel fatigue
   - Rest recovery (inn, camp, items)
   - Fatigue effects on gameplay
   - Stumble mechanics
   - Night penalties
   - Serialization

3. **provisions.test.ts** - ProvisionsSystem (120+ tests)
   - Food and water tracking
   - Provision status levels
   - Travel and camping consumption
   - Hunting mechanics
   - Foraging by terrain type
   - Fatigue multipliers when depleted
   - Dehydration damage
   - Serialization

4. **camping.test.ts** - CampingSystem (130+ tests)
   - Camp setup and breakdown
   - Fire management
   - Rest mechanics with duration options
   - Encounter system (9 encounter types)
   - Rest interruption
   - Fuel consumption
   - Integration with fatigue and provisions
   - Serialization

5. **survivalStore.test.ts** - Zustand integration (140+ tests)
   - Time actions and selectors
   - Fatigue actions and selectors
   - Provisions actions and selectors
   - Camping actions and selectors
   - Combined actions (travel, inn rest)
   - Integration scenarios
   - State consistency
   - Serialization

## Coverage Summary

| System | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| time.ts | 89.7% | 89.85% | 94.87% | 90% |
| fatigue.ts | 94.8% | 89.74% | 100% | 94.11% |
| provisions.ts | 95.74% | 89.04% | 100% | 95.38% |
| camping.ts | 99.17% | 88.15% | 100% | 99.14% |
| survivalStore.ts | 97.36% | 75.86% | 97.82% | 98% |

**Overall: 95%+ coverage across all survival systems**

## Test Categories

### Unit Tests
- Individual system functionality
- State management
- Calculations and formulas
- Edge cases and boundary conditions

### Integration Tests
- System interactions (fatigue + provisions + time)
- Camping with all systems
- Travel mechanics
- Store integration

### Edge Cases
- Zero values
- Negative values
- Overflow/underflow
- Boundary conditions
- Invalid inputs

## Running Tests

```bash
# Run all survival system tests
pnpm test src/game/systems/__tests__/

# Run specific test file
pnpm test src/game/systems/__tests__/time.test.ts

# Run with coverage
pnpm test src/game/systems/__tests__/ --coverage

# Watch mode
pnpm test src/game/systems/__tests__/ --watch
```

## Test Patterns

### System Initialization
```typescript
let system: SystemType;

beforeEach(() => {
  system = new SystemType();
});
```

### State Testing
```typescript
it('should get current state', () => {
  const state = system.getState();
  expect(state).toHaveProperty('propertyName');
});
```

### Integration Testing
```typescript
it('should integrate with other systems', () => {
  const result = system.performAction(otherSystem);
  expect(result).toBeDefined();
});
```

### Serialization Testing
```typescript
it('should serialize and deserialize', () => {
  const state = system.getState();
  system.loadState(state);
  expect(system.getState()).toEqual(state);
});
```

## Key Features Tested

### Time System
- ✅ Real-time clock with configurable time scale
- ✅ Day/night cycle with 4 phases
- ✅ Event emission for time changes
- ✅ Ambient light calculations
- ✅ Time advancement and control

### Fatigue System
- ✅ 5 fatigue levels with effects
- ✅ Travel, combat, and idle fatigue
- ✅ Night penalties
- ✅ Multiple rest types (inn, camp, items)
- ✅ Stumble mechanics
- ✅ Combat penalties

### Provisions System
- ✅ Food and water tracking
- ✅ 5 provision status levels
- ✅ Travel and camping consumption
- ✅ Hunting mini-game
- ✅ Terrain-based foraging
- ✅ Dehydration damage
- ✅ Fatigue multipliers

### Camping System
- ✅ Camp setup with fire option
- ✅ 3 rest durations (2/4/8 hours)
- ✅ 9 encounter types
- ✅ Fire management and fuel
- ✅ Rest interruption
- ✅ Integration with all systems

### Survival Store
- ✅ Zustand slice integration
- ✅ All system actions
- ✅ All system selectors
- ✅ Combined actions
- ✅ State consistency
- ✅ Serialization

## Notes

- All tests use Jest with React Native preset
- Mock functions used for deterministic random number generation
- Time-based tests use controlled clock advancement
- Integration tests verify cross-system behavior
- Edge cases ensure robustness

## Future Enhancements

- [ ] Add property-based testing for edge cases
- [ ] Add performance benchmarks
- [ ] Add visual regression tests for UI components
- [ ] Add E2E tests with Maestro
- [ ] Add stress tests for long-running scenarios

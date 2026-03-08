# Implementation Plan: Comprehensive E2E Testing for Iron Frontier

## Overview

This implementation plan creates a comprehensive end-to-end testing suite for Iron Frontier using Playwright (web), Maestro (mobile), and fast-check (property-based testing). The tests are organized by game system and include a final handoff specification generation task.

## Tasks

- [x] 1. Set up test infrastructure and helpers
  - [x] 1.1 Create test directory structure and configuration files
    - Create `tests/e2e/core/`, `tests/e2e/ui/`, `tests/e2e/systems/`, `tests/e2e/spatial/`, `tests/e2e/persistence/`, `tests/e2e/validation/`, `tests/e2e/quality/` directories
    - Update `playwright.config.ts` with new test paths and viewport configurations
    - _Requirements: All_
  
  - [x] 1.2 Implement enhanced test helpers
    - Extend `tests/e2e/helpers.ts` with `waitForPhase`, `waitForPanel`, `closeAllPanels`, `captureScreenshot`, `measurePerformance` functions
    - Add error recovery and retry logic
    - _Requirements: 22.1, 22.3_
  
  - [x] 1.3 Create test fixtures file
    - Create `tests/e2e/fixtures.ts` with mock data for players, items, encounters, shops
    - Define test constants and seed values
    - _Requirements: All_
  
  - [x] 1.4 Verify and extend test harness API
    - Verify `window.__IRON_FRONTIER_TEST__` exposes all required methods
    - Add missing methods: `checkCollision`, `getZoneAt`, `setFatigue`, `setProvisions`
    - _Requirements: All_

- [ ] 2. Implement core game flow tests
  - [x] 2.1 Create initialization tests
    - Create `tests/e2e/core/initialization.spec.ts`
    - Test title screen load within 5 seconds
    - Test game title visibility
    - Test New Game and Continue button presence
    - Test Continue button state based on save data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 2.2 Create new game flow tests
    - Create `tests/e2e/core/new-game-flow.spec.ts`
    - Test character creation screen appearance
    - Test name validation (valid, empty, too long)
    - Test initial player stats after game start
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [-] 2.3 Write property test for character name validation
    - **Property 2: Character Name Validation**
    - **Validates: Requirements 2.2**
  
  - [~] 2.4 Create phase transition tests
    - Create `tests/e2e/core/phase-transitions.spec.ts`
    - Test all phase transitions (title→playing, playing→dialogue, playing→combat, etc.)
    - Test HUD visibility changes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [~] 2.5 Write property test for phase transition state integrity
    - **Property 1: Phase Transition State Integrity**
    - **Validates: Requirements 3.7**

- [~] 3. Checkpoint - Verify core flow tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement UI tests
  - [~] 4.1 Create HUD tests
    - Create `tests/e2e/ui/hud.spec.ts`
    - Test health, gold, level display
    - Test time display format
    - Test survival indicators visibility
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [~] 4.2 Write property test for time display formatting
    - **Property 3: Time Display Formatting**
    - **Validates: Requirements 4.2**
  
  - [~] 4.3 Create action bar tests
    - Create `tests/e2e/ui/action-bar.spec.ts`
    - Test all action bar buttons open correct panels
    - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [~] 4.4 Create panel tests
    - Create `tests/e2e/ui/panels.spec.ts`
    - Test each panel opens and closes correctly
    - Test panel content renders properly
    - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [~] 4.5 Create responsive UI tests
    - Create `tests/e2e/ui/responsive.spec.ts`
    - Test mobile portrait, mobile landscape, tablet, desktop viewports
    - Test touch target sizes
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
  
  - [~] 4.6 Write property test for responsive UI adaptation
    - **Property 19: Responsive UI Adaptation**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5**

- [ ] 5. Implement game system tests - Part 1
  - [~] 5.1 Create inventory tests
    - Create `tests/e2e/systems/inventory.spec.ts`
    - Test adding, removing, using, dropping items
    - Test equipment equip/unequip
    - Test inventory full edge case
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [~] 5.2 Write property test for inventory operation consistency
    - **Property 4: Inventory Operation Consistency**
    - **Validates: Requirements 5.7**
  
  - [~] 5.3 Create quest tests
    - Create `tests/e2e/systems/quests.spec.ts`
    - Test quest start, objective completion, stage advancement
    - Test quest completion and rewards
    - Test quest abandonment
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [~] 5.4 Write property test for quest state machine correctness
    - **Property 5: Quest State Machine Correctness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
  
  - [~] 5.5 Create dialogue tests
    - Create `tests/e2e/systems/dialogue.spec.ts`
    - Test dialogue start, choice selection, effects
    - Test conditional branches
    - Test dialogue end
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [~] 5.6 Write property test for dialogue tree traversal correctness
    - **Property 6: Dialogue Tree Traversal Correctness**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

- [~] 6. Checkpoint - Verify inventory, quest, dialogue tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement game system tests - Part 2
  - [~] 7.1 Create combat tests
    - Create `tests/e2e/systems/combat.spec.ts`
    - Test combat start, attack, defend actions
    - Test enemy AI behavior
    - Test victory and defeat conditions
    - Test flee mechanics
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_
  
  - [~] 7.2 Write property test for combat damage calculation correctness
    - **Property 7: Combat Damage Calculation Correctness**
    - **Validates: Requirements 8.2, 9.1, 9.2, 9.3, 9.4**
  
  - [~] 7.3 Write property test for combat state machine correctness
    - **Property 8: Combat State Machine Correctness**
    - **Validates: Requirements 8.5, 8.6, 8.7, 8.8, 8.9**
  
  - [~] 7.4 Create combat edge case tests
    - Create `tests/e2e/systems/combat-edge-cases.spec.ts`
    - Test zero attack power, high defense, hit chance bounds
    - Test status effect stacking
    - Test 1 HP boundary, no valid targets
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  
  - [~] 7.5 Create shop tests
    - Create `tests/e2e/systems/shop.spec.ts`
    - Test shop open, buy, sell operations
    - Test insufficient gold edge case
    - Test shop close
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [~] 7.6 Write property test for shop transaction consistency
    - **Property 9: Shop Transaction Consistency**
    - **Validates: Requirements 10.6**
  
  - [~] 7.7 Create travel tests
    - Create `tests/e2e/systems/travel.spec.ts`
    - Test travel initiation, completion, cancellation
    - Test encounter triggers during travel
    - Test time and resource consumption
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  
  - [~] 7.8 Write property test for travel state management
    - **Property 10: Travel State Management**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.5, 11.6**
  
  - [~] 7.9 Create survival system tests
    - Create `tests/e2e/systems/survival.spec.ts`
    - Test time advancement and display
    - Test fatigue levels and combat penalties
    - Test provisions consumption
    - Test camping mechanics
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  
  - [~] 7.10 Write property test for survival system integration
    - **Property 11: Survival System Integration**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.5, 12.6**

- [~] 8. Checkpoint - Verify combat, shop, travel, survival tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement spatial system tests
  - [~] 9.1 Create collision tests
    - Create `tests/e2e/spatial/collision.spec.ts`
    - Test building, NPC, terrain collisions
    - Test open space movement
    - Test corrected position calculation
    - Test trigger zone enter/exit
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [~] 9.2 Write property test for collision detection correctness
    - **Property 12: Collision Detection Correctness**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**
  
  - [~] 9.3 Create zone tests
    - Create `tests/e2e/spatial/zones.spec.ts`
    - Test zone enter/exit callbacks
    - Test town vs route encounter settings
    - Test zone transitions and spawn positions
    - Test overlapping zone priority
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  
  - [~] 9.4 Write property test for zone management correctness
    - **Property 13: Zone Management Correctness**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6**
  
  - [~] 9.5 Create boundary tests
    - Create `tests/e2e/spatial/boundaries.spec.ts`
    - Test world edge blocking
    - Test extreme coordinates handling
    - Test negative coordinates
    - Test camera bounds near edges
    - Test all map edges for gaps
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [~] 9.6 Write property test for boundary enforcement
    - **Property 14: Boundary Enforcement**
    - **Validates: Requirements 15.1, 15.5**

- [~] 10. Checkpoint - Verify spatial tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement persistence and validation tests
  - [~] 11.1 Create save/load tests
    - Create `tests/e2e/persistence/save-load.spec.ts`
    - Test save persists all state
    - Test load restores all state
    - Test corrupted save handling
    - Test multiple saves
    - _Requirements: 16.1, 16.2, 16.3, 16.4_
  
  - [~] 11.2 Write property test for save/load round-trip consistency
    - **Property 15: Save/Load Round-Trip Consistency**
    - **Validates: Requirements 16.1, 16.2, 16.5**
  
  - [~] 11.3 Create puzzle tests
    - Create `tests/e2e/systems/puzzle.spec.ts`
    - Test puzzle render, tile rotation, solve detection
    - Test puzzle cancel
    - Test invalid state handling
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_
  
  - [~] 11.4 Write property test for puzzle state management
    - **Property 16: Puzzle State Management**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4**
  
  - [~] 11.5 Create procedural generation validation tests
    - Create `tests/e2e/validation/procedural-generation.spec.ts`
    - Test world generation produces reachable locations
    - Test NPC generation populates required fields
    - Test quest generation creates completable quests
    - Test item generation produces valid items
    - _Requirements: 18.1, 18.2, 18.3, 18.4_
  
  - [~] 11.6 Write property test for procedural generation determinism
    - **Property 17: Procedural Generation Determinism**
    - **Validates: Requirements 18.5**
  
  - [~] 11.7 Create notification tests
    - Create `tests/e2e/validation/notifications.spec.ts`
    - Test item, XP, quest, level up notifications
    - Test notification expiration
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_
  
  - [~] 11.8 Write property test for notification lifecycle
    - **Property 18: Notification Lifecycle**
    - **Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5**

- [~] 12. Checkpoint - Verify persistence and validation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement quality tests
  - [~] 13.1 Create accessibility tests
    - Create `tests/e2e/quality/accessibility.spec.ts`
    - Test ARIA labels on interactive elements
    - Test keyboard navigation
    - Test color contrast
    - Test focus indicators
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_
  
  - [~] 13.2 Write property test for accessibility compliance
    - **Property 20: Accessibility Compliance**
    - **Validates: Requirements 21.1, 21.2, 21.3, 21.4, 21.5**
  
  - [~] 13.3 Create error handling tests
    - Create `tests/e2e/quality/error-handling.spec.ts`
    - Test invalid action handling
    - Test state recovery
    - Test storage full handling
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_
  
  - [~] 13.4 Create performance tests
    - Create `tests/e2e/quality/performance.spec.ts`
    - Test initial load time
    - Test panel open response time
    - Test combat action response time
    - Test many entities performance
    - Test memory leak detection
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [ ] 14. Implement mobile E2E tests
  - [~] 14.1 Create Maestro smoke tests
    - Update `.maestro/smoke/app-launch.yaml` with comprehensive checks
    - Update `.maestro/smoke/main-menu.yaml` with all menu options
    - _Requirements: 24.1, 24.2_
  
  - [~] 14.2 Create Maestro flow tests
    - Update `.maestro/flows/new-game.yaml` with full flow
    - Update `.maestro/flows/character-creation.yaml` with validation tests
    - Update `.maestro/flows/basic-gameplay.yaml` with interaction tests
    - Update `.maestro/flows/panel-smoke.yaml` with all panels
    - _Requirements: 24.3, 24.4, 24.5_

- [~] 15. Checkpoint - Verify all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Create handoff specification generator
  - [~] 16.1 Create handoff generation script
    - Create `tests/handoff/generate-handoff.ts`
    - Implement test result collection and summarization
    - Implement codebase archaeology assessment
    - Implement feature completion matrix generation
    - Implement issue extraction and prioritization
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7_
  
  - [~] 16.2 Create handoff template
    - Create `tests/handoff/template.md` with all required sections
    - Include placeholders for test results, issues, resolution plan
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7_
  
  - [~] 16.3 Integrate handoff generation into test pipeline
    - Add post-test hook to generate handoff spec
    - Configure output path for handoff document
    - _Requirements: 25.1_

- [~] 17. Final checkpoint - Generate handoff specification
  - Run complete test suite
  - Generate handoff specification document
  - Review and validate handoff content
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The final task (16) creates the comprehensive handoff specification for the next agent

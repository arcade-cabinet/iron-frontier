import type {
  Combatant,
  CombatAction,
  CombatResult,
  CombatState,
} from '../types';
import { createFailureResult } from './helpers';
import { processAimedShot, processQuickDraw } from './skillsOffensive';
import { processOverwatch, processFirstAid, processIntimidate } from './skillsUtility';

export function processSkill(
  state: CombatState,
  action: CombatAction,
  actor: Combatant,
  randomValues?: { hitRoll?: number; critRoll?: number; damageVariance?: number }
): { state: CombatState; result: CombatResult } {
  switch (action.skillId) {
    case 'aimed_shot':
      return processAimedShot(state, action, actor, randomValues);
    case 'quick_draw':
      return processQuickDraw(state, action, actor, randomValues);
    case 'overwatch':
      return processOverwatch(state, action, actor);
    case 'first_aid':
      return processFirstAid(state, action, actor);
    case 'intimidate':
      return processIntimidate(state, action, actor, randomValues?.hitRoll);
    default:
      return {
        state,
        result: createFailureResult(action, `Unknown skill: ${action.skillId}`),
      };
  }
}

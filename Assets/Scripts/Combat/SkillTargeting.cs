using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using IronFrontier.Data;

namespace IronFrontier.Combat
{
    /// <summary>
    /// Result of target validation.
    /// </summary>
    public struct TargetValidationResult
    {
        /// <summary>Is the target valid?</summary>
        public bool IsValid;

        /// <summary>Reason for invalid target (if applicable).</summary>
        public string Reason;

        public static TargetValidationResult Valid => new TargetValidationResult { IsValid = true };

        public static TargetValidationResult Invalid(string reason)
        {
            return new TargetValidationResult { IsValid = false, Reason = reason };
        }
    }

    /// <summary>
    /// Handles skill targeting validation and target acquisition.
    /// Provides utility methods for determining valid targets based on skill definitions.
    /// </summary>
    public static class SkillTargeting
    {
        /// <summary>
        /// Validate if a specific target is valid for a skill.
        /// </summary>
        /// <param name="skill">The skill being used.</param>
        /// <param name="caster">The combatant using the skill.</param>
        /// <param name="target">The potential target.</param>
        /// <param name="targetPosition">Ground position for ground-targeted skills.</param>
        /// <returns>Validation result with reason if invalid.</returns>
        public static TargetValidationResult ValidateTarget(
            SkillData skill,
            Combatant caster,
            Combatant target,
            Vector2Int? targetPosition = null)
        {
            if (skill == null)
                return TargetValidationResult.Invalid("No skill specified");

            if (caster == null)
                return TargetValidationResult.Invalid("No caster specified");

            // Handle self-targeting skills
            if (skill.TargetType == SkillTargetType.Self)
            {
                if (target != null && target.Id != caster.Id)
                    return TargetValidationResult.Invalid("Self-targeting skill can only target self");
                return TargetValidationResult.Valid;
            }

            // Handle ground-targeted skills
            if (skill.TargetType == SkillTargetType.Ground)
            {
                if (!targetPosition.HasValue)
                    return TargetValidationResult.Invalid("Ground-targeted skill requires a position");

                if (!IsInRange(caster.Position, targetPosition.Value, skill.Range))
                    return TargetValidationResult.Invalid("Target position is out of range");

                return TargetValidationResult.Valid;
            }

            // Handle all-target skills (no specific target required)
            if (skill.TargetType == SkillTargetType.AllAllies ||
                skill.TargetType == SkillTargetType.AllEnemies)
            {
                return TargetValidationResult.Valid;
            }

            // From here, we need a specific target
            if (target == null)
                return TargetValidationResult.Invalid("No target specified");

            if (!target.IsAlive)
                return TargetValidationResult.Invalid("Target is not alive");

            // Check target type compatibility
            bool isCasterEnemy = caster.Type == CombatantType.Enemy;
            bool isTargetEnemy = target.Type == CombatantType.Enemy;
            bool isTargetAlly = target.Type == CombatantType.Ally || target.IsPlayer;

            switch (skill.TargetType)
            {
                case SkillTargetType.Enemy:
                case SkillTargetType.AreaEnemy:
                    // Enemies of the caster
                    if (isCasterEnemy)
                    {
                        if (!isTargetAlly)
                            return TargetValidationResult.Invalid("Skill targets enemies only");
                    }
                    else
                    {
                        if (!isTargetEnemy)
                            return TargetValidationResult.Invalid("Skill targets enemies only");
                    }
                    break;

                case SkillTargetType.Ally:
                case SkillTargetType.AreaAlly:
                    // Allies of the caster (including self)
                    if (isCasterEnemy)
                    {
                        if (!isTargetEnemy && target.Id != caster.Id)
                            return TargetValidationResult.Invalid("Skill targets allies only");
                    }
                    else
                    {
                        if (isTargetEnemy)
                            return TargetValidationResult.Invalid("Skill targets allies only");
                    }
                    break;
            }

            // Check range
            if (skill.Range > 0)
            {
                if (!IsInRange(caster.Position, target.Position, skill.Range))
                    return TargetValidationResult.Invalid("Target is out of range");
            }

            return TargetValidationResult.Valid;
        }

        /// <summary>
        /// Get all valid targets for a skill.
        /// </summary>
        /// <param name="skill">The skill being used.</param>
        /// <param name="caster">The combatant using the skill.</param>
        /// <param name="allCombatants">All combatants in the battle.</param>
        /// <returns>List of valid targets.</returns>
        public static List<Combatant> GetValidTargets(
            SkillData skill,
            Combatant caster,
            IEnumerable<Combatant> allCombatants)
        {
            if (skill == null || caster == null || allCombatants == null)
                return new List<Combatant>();

            var validTargets = new List<Combatant>();

            // Self-targeting returns only the caster
            if (skill.TargetType == SkillTargetType.Self)
            {
                if (caster.IsAlive)
                    validTargets.Add(caster);
                return validTargets;
            }

            // Ground-targeted skills don't return combatants
            if (skill.TargetType == SkillTargetType.Ground)
            {
                return validTargets;
            }

            bool isCasterEnemy = caster.Type == CombatantType.Enemy;

            foreach (var combatant in allCombatants)
            {
                if (combatant == null || !combatant.IsAlive)
                    continue;

                bool isEnemy = combatant.Type == CombatantType.Enemy;
                bool isAlly = combatant.Type == CombatantType.Ally || combatant.IsPlayer;

                switch (skill.TargetType)
                {
                    case SkillTargetType.Enemy:
                    case SkillTargetType.AreaEnemy:
                    case SkillTargetType.AllEnemies:
                        // Get enemies relative to caster
                        if (isCasterEnemy)
                        {
                            if (isAlly && IsInRange(caster.Position, combatant.Position, skill.Range))
                                validTargets.Add(combatant);
                        }
                        else
                        {
                            if (isEnemy && IsInRange(caster.Position, combatant.Position, skill.Range))
                                validTargets.Add(combatant);
                        }
                        break;

                    case SkillTargetType.Ally:
                    case SkillTargetType.AreaAlly:
                    case SkillTargetType.AllAllies:
                        // Get allies relative to caster (including self)
                        if (isCasterEnemy)
                        {
                            if (isEnemy && IsInRange(caster.Position, combatant.Position, skill.Range))
                                validTargets.Add(combatant);
                        }
                        else
                        {
                            if (!isEnemy && IsInRange(caster.Position, combatant.Position, skill.Range))
                                validTargets.Add(combatant);
                        }
                        break;
                }
            }

            return validTargets;
        }

        /// <summary>
        /// Get all combatants within an area effect.
        /// </summary>
        /// <param name="skill">The skill being used.</param>
        /// <param name="center">Center position of the area (target's position or ground target).</param>
        /// <param name="allCombatants">All combatants in the battle.</param>
        /// <param name="caster">The combatant using the skill (for determining friend/foe).</param>
        /// <returns>List of combatants within the area.</returns>
        public static List<Combatant> GetAreaTargets(
            SkillData skill,
            Vector2Int center,
            IEnumerable<Combatant> allCombatants,
            Combatant caster = null)
        {
            if (skill == null || allCombatants == null)
                return new List<Combatant>();

            // Non-AoE skills only affect the direct target
            if (!skill.IsAreaOfEffect && skill.AreaRadius == 0)
            {
                return allCombatants
                    .Where(c => c != null && c.IsAlive && c.Position == center)
                    .ToList();
            }

            var affectedTargets = new List<Combatant>();
            bool isCasterEnemy = caster != null && caster.Type == CombatantType.Enemy;

            foreach (var combatant in allCombatants)
            {
                if (combatant == null || !combatant.IsAlive)
                    continue;

                // Check if within area radius
                if (!IsInRange(center, combatant.Position, skill.AreaRadius))
                    continue;

                bool isEnemy = combatant.Type == CombatantType.Enemy;
                bool isAlly = combatant.Type == CombatantType.Ally || combatant.IsPlayer;

                // Filter by target type
                switch (skill.TargetType)
                {
                    case SkillTargetType.AreaEnemy:
                    case SkillTargetType.AllEnemies:
                        if (isCasterEnemy)
                        {
                            if (isAlly) affectedTargets.Add(combatant);
                        }
                        else
                        {
                            if (isEnemy) affectedTargets.Add(combatant);
                        }
                        break;

                    case SkillTargetType.AreaAlly:
                    case SkillTargetType.AllAllies:
                        if (isCasterEnemy)
                        {
                            if (isEnemy) affectedTargets.Add(combatant);
                        }
                        else
                        {
                            if (!isEnemy) affectedTargets.Add(combatant);
                        }
                        break;

                    case SkillTargetType.Ground:
                        // Ground-targeted AoE can affect anyone in the area
                        affectedTargets.Add(combatant);
                        break;

                    default:
                        // Single-target skills with area radius still only hit the center target
                        if (combatant.Position == center)
                            affectedTargets.Add(combatant);
                        break;
                }
            }

            return affectedTargets;
        }

        /// <summary>
        /// Get all ground positions that can be targeted.
        /// </summary>
        /// <param name="skill">The skill being used.</param>
        /// <param name="caster">The combatant using the skill.</param>
        /// <param name="maxX">Maximum X coordinate of the combat grid.</param>
        /// <param name="maxY">Maximum Y coordinate of the combat grid.</param>
        /// <returns>List of valid ground positions.</returns>
        public static List<Vector2Int> GetValidGroundPositions(
            SkillData skill,
            Combatant caster,
            int maxX = 10,
            int maxY = 10)
        {
            if (skill == null || caster == null)
                return new List<Vector2Int>();

            if (skill.TargetType != SkillTargetType.Ground)
                return new List<Vector2Int>();

            var validPositions = new List<Vector2Int>();

            for (int x = 0; x <= maxX; x++)
            {
                for (int y = 0; y <= maxY; y++)
                {
                    var pos = new Vector2Int(x, y);
                    if (IsInRange(caster.Position, pos, skill.Range))
                    {
                        validPositions.Add(pos);
                    }
                }
            }

            return validPositions;
        }

        /// <summary>
        /// Calculate the number of targets a skill would hit.
        /// Useful for AI decision making.
        /// </summary>
        /// <param name="skill">The skill being used.</param>
        /// <param name="caster">The combatant using the skill.</param>
        /// <param name="targetPosition">The target position.</param>
        /// <param name="allCombatants">All combatants in the battle.</param>
        /// <returns>Number of targets that would be hit.</returns>
        public static int CountPotentialTargets(
            SkillData skill,
            Combatant caster,
            Vector2Int targetPosition,
            IEnumerable<Combatant> allCombatants)
        {
            if (skill == null || allCombatants == null)
                return 0;

            if (skill.TargetType == SkillTargetType.Self)
                return 1;

            var targets = GetAreaTargets(skill, targetPosition, allCombatants, caster);
            return targets.Count;
        }

        /// <summary>
        /// Find the optimal target position for an AoE skill.
        /// Returns the position that would hit the most valid targets.
        /// </summary>
        /// <param name="skill">The skill being used.</param>
        /// <param name="caster">The combatant using the skill.</param>
        /// <param name="allCombatants">All combatants in the battle.</param>
        /// <returns>Optimal target position and number of targets.</returns>
        public static (Vector2Int position, int targetCount) FindOptimalAoEPosition(
            SkillData skill,
            Combatant caster,
            IEnumerable<Combatant> allCombatants)
        {
            if (skill == null || caster == null || allCombatants == null)
                return (Vector2Int.zero, 0);

            var validTargets = GetValidTargets(skill, caster, allCombatants);
            if (validTargets.Count == 0)
                return (Vector2Int.zero, 0);

            Vector2Int bestPosition = validTargets[0].Position;
            int maxTargets = 0;

            foreach (var target in validTargets)
            {
                int count = CountPotentialTargets(skill, caster, target.Position, allCombatants);
                if (count > maxTargets)
                {
                    maxTargets = count;
                    bestPosition = target.Position;
                }
            }

            return (bestPosition, maxTargets);
        }

        /// <summary>
        /// Get the nearest valid target for a skill.
        /// </summary>
        /// <param name="skill">The skill being used.</param>
        /// <param name="caster">The combatant using the skill.</param>
        /// <param name="allCombatants">All combatants in the battle.</param>
        /// <returns>The nearest valid target, or null if none.</returns>
        public static Combatant GetNearestTarget(
            SkillData skill,
            Combatant caster,
            IEnumerable<Combatant> allCombatants)
        {
            var validTargets = GetValidTargets(skill, caster, allCombatants);
            if (validTargets.Count == 0)
                return null;

            Combatant nearest = null;
            float minDistance = float.MaxValue;

            foreach (var target in validTargets)
            {
                float distance = CalculateDistance(caster.Position, target.Position);
                if (distance < minDistance)
                {
                    minDistance = distance;
                    nearest = target;
                }
            }

            return nearest;
        }

        /// <summary>
        /// Get the weakest valid target for a skill (lowest HP).
        /// </summary>
        /// <param name="skill">The skill being used.</param>
        /// <param name="caster">The combatant using the skill.</param>
        /// <param name="allCombatants">All combatants in the battle.</param>
        /// <returns>The weakest valid target, or null if none.</returns>
        public static Combatant GetWeakestTarget(
            SkillData skill,
            Combatant caster,
            IEnumerable<Combatant> allCombatants)
        {
            var validTargets = GetValidTargets(skill, caster, allCombatants);
            if (validTargets.Count == 0)
                return null;

            return validTargets.OrderBy(t => t.Stats.HP).First();
        }

        /// <summary>
        /// Get the target with lowest HP percentage (for execute skills).
        /// </summary>
        /// <param name="skill">The skill being used.</param>
        /// <param name="caster">The combatant using the skill.</param>
        /// <param name="allCombatants">All combatants in the battle.</param>
        /// <returns>Target with lowest HP percentage, or null if none.</returns>
        public static Combatant GetLowestHPPercentTarget(
            SkillData skill,
            Combatant caster,
            IEnumerable<Combatant> allCombatants)
        {
            var validTargets = GetValidTargets(skill, caster, allCombatants);
            if (validTargets.Count == 0)
                return null;

            return validTargets.OrderBy(t => t.HPPercentage).First();
        }

        #region Private Helpers

        /// <summary>
        /// Check if a target is within range.
        /// Uses hex/grid distance calculation.
        /// </summary>
        private static bool IsInRange(Vector2Int from, Vector2Int to, int range)
        {
            // Range of 0 means any range (or self-only, handled separately)
            if (range == 0)
                return true;

            float distance = CalculateDistance(from, to);
            return distance <= range;
        }

        /// <summary>
        /// Calculate hex/grid distance between two positions.
        /// Uses Chebyshev distance (allows diagonal movement).
        /// </summary>
        private static float CalculateDistance(Vector2Int from, Vector2Int to)
        {
            int dx = Mathf.Abs(to.x - from.x);
            int dy = Mathf.Abs(to.y - from.y);

            // Chebyshev distance (8-directional movement)
            return Mathf.Max(dx, dy);
        }

        #endregion
    }
}

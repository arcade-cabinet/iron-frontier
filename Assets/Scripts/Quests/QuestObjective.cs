using System;
using UnityEngine;
using IronFrontier.Data;

namespace IronFrontier.Quests
{
    /// <summary>
    /// Runtime objective handler that validates and processes objective completion.
    /// Works with QuestTracker to determine when objectives should progress.
    /// </summary>
    /// <remarks>
    /// Provides utility methods for validating different objective types
    /// against game events and conditions.
    /// </remarks>
    public static class QuestObjectiveValidator
    {
        #region Kill Objectives

        /// <summary>
        /// Check if a kill event matches a kill objective.
        /// </summary>
        /// <param name="objective">The objective to check.</param>
        /// <param name="killedEnemyId">ID of the killed enemy.</param>
        /// <param name="killedEnemyType">Type of the killed enemy.</param>
        /// <returns>True if the kill matches the objective.</returns>
        public static bool MatchesKillObjective(QuestObjective objective, string killedEnemyId, string killedEnemyType = null)
        {
            if (objective.type != ObjectiveType.Kill)
                return false;

            // Match by exact enemy ID
            if (objective.target == killedEnemyId)
                return true;

            // Match by enemy type (e.g., "bandit" matches any bandit enemy)
            if (!string.IsNullOrEmpty(killedEnemyType) && objective.target == killedEnemyType)
                return true;

            // Match wildcard (kill any enemy)
            if (objective.target == "*" || objective.target == "any")
                return true;

            return false;
        }

        /// <summary>
        /// Create a kill objective for a specific enemy type.
        /// </summary>
        /// <param name="enemyId">Enemy ID or type to kill.</param>
        /// <param name="count">Number required.</param>
        /// <param name="description">Description text.</param>
        /// <returns>The created objective.</returns>
        public static QuestObjective CreateKillObjective(string enemyId, int count, string description)
        {
            return new QuestObjective
            {
                id = $"kill_{enemyId}_{Guid.NewGuid():N}".Substring(0, 32),
                description = description,
                type = ObjectiveType.Kill,
                target = enemyId,
                count = count,
                optional = false,
                hidden = false
            };
        }

        #endregion

        #region Collect Objectives

        /// <summary>
        /// Check if an item event matches a collect objective.
        /// </summary>
        /// <param name="objective">The objective to check.</param>
        /// <param name="itemId">ID of the collected item.</param>
        /// <returns>True if the item matches the objective.</returns>
        public static bool MatchesCollectObjective(QuestObjective objective, string itemId)
        {
            if (objective.type != ObjectiveType.Collect)
                return false;

            return objective.target == itemId;
        }

        /// <summary>
        /// Check if player has enough of an item in inventory.
        /// </summary>
        /// <param name="objective">The objective to check.</param>
        /// <param name="inventoryCount">Number of items in inventory.</param>
        /// <returns>True if requirement is met.</returns>
        public static bool HasEnoughItems(QuestObjective objective, int inventoryCount)
        {
            if (objective.type != ObjectiveType.Collect)
                return false;

            return inventoryCount >= objective.count;
        }

        /// <summary>
        /// Create a collect objective for an item.
        /// </summary>
        /// <param name="itemId">Item ID to collect.</param>
        /// <param name="count">Number required.</param>
        /// <param name="description">Description text.</param>
        /// <returns>The created objective.</returns>
        public static QuestObjective CreateCollectObjective(string itemId, int count, string description)
        {
            return new QuestObjective
            {
                id = $"collect_{itemId}_{Guid.NewGuid():N}".Substring(0, 32),
                description = description,
                type = ObjectiveType.Collect,
                target = itemId,
                count = count,
                optional = false,
                hidden = false
            };
        }

        #endregion

        #region Talk Objectives

        /// <summary>
        /// Check if a dialogue event matches a talk objective.
        /// </summary>
        /// <param name="objective">The objective to check.</param>
        /// <param name="npcId">ID of the NPC talked to.</param>
        /// <returns>True if the NPC matches the objective.</returns>
        public static bool MatchesTalkObjective(QuestObjective objective, string npcId)
        {
            if (objective.type != ObjectiveType.Talk)
                return false;

            return objective.target == npcId;
        }

        /// <summary>
        /// Create a talk objective for an NPC.
        /// </summary>
        /// <param name="npcId">NPC ID to talk to.</param>
        /// <param name="description">Description text.</param>
        /// <returns>The created objective.</returns>
        public static QuestObjective CreateTalkObjective(string npcId, string description)
        {
            return new QuestObjective
            {
                id = $"talk_{npcId}_{Guid.NewGuid():N}".Substring(0, 32),
                description = description,
                type = ObjectiveType.Talk,
                target = npcId,
                count = 1,
                optional = false,
                hidden = false
            };
        }

        #endregion

        #region Visit Objectives

        /// <summary>
        /// Check if a location event matches a visit objective.
        /// </summary>
        /// <param name="objective">The objective to check.</param>
        /// <param name="locationId">ID of the location visited.</param>
        /// <returns>True if the location matches the objective.</returns>
        public static bool MatchesVisitObjective(QuestObjective objective, string locationId)
        {
            if (objective.type != ObjectiveType.Visit)
                return false;

            return objective.target == locationId;
        }

        /// <summary>
        /// Check if player is at the objective's location.
        /// </summary>
        /// <param name="objective">The objective to check.</param>
        /// <param name="currentLocationId">Player's current location ID.</param>
        /// <returns>True if at the location.</returns>
        public static bool IsAtLocation(QuestObjective objective, string currentLocationId)
        {
            return MatchesVisitObjective(objective, currentLocationId);
        }

        /// <summary>
        /// Create a visit objective for a location.
        /// </summary>
        /// <param name="locationId">Location ID to visit.</param>
        /// <param name="description">Description text.</param>
        /// <returns>The created objective.</returns>
        public static QuestObjective CreateVisitObjective(string locationId, string description)
        {
            return new QuestObjective
            {
                id = $"visit_{locationId}_{Guid.NewGuid():N}".Substring(0, 32),
                description = description,
                type = ObjectiveType.Visit,
                target = locationId,
                count = 1,
                optional = false,
                hidden = false,
                mapMarker = new ObjectiveMapMarker
                {
                    locationId = locationId,
                    markerLabel = description
                }
            };
        }

        #endregion

        #region Interact Objectives

        /// <summary>
        /// Check if an interaction event matches an interact objective.
        /// </summary>
        /// <param name="objective">The objective to check.</param>
        /// <param name="interactableId">ID of the interactable used.</param>
        /// <returns>True if the interactable matches the objective.</returns>
        public static bool MatchesInteractObjective(QuestObjective objective, string interactableId)
        {
            if (objective.type != ObjectiveType.Interact)
                return false;

            return objective.target == interactableId;
        }

        /// <summary>
        /// Create an interact objective for an interactable.
        /// </summary>
        /// <param name="interactableId">Interactable ID to use.</param>
        /// <param name="description">Description text.</param>
        /// <returns>The created objective.</returns>
        public static QuestObjective CreateInteractObjective(string interactableId, string description)
        {
            return new QuestObjective
            {
                id = $"interact_{interactableId}_{Guid.NewGuid():N}".Substring(0, 32),
                description = description,
                type = ObjectiveType.Interact,
                target = interactableId,
                count = 1,
                optional = false,
                hidden = false
            };
        }

        #endregion

        #region Deliver Objectives

        /// <summary>
        /// Check if a delivery can be completed.
        /// </summary>
        /// <param name="objective">The objective to check.</param>
        /// <param name="hasItem">Whether player has the item.</param>
        /// <param name="atRecipient">Whether player is at the recipient NPC/location.</param>
        /// <returns>True if delivery can be completed.</returns>
        public static bool CanCompleteDelivery(QuestObjective objective, bool hasItem, bool atRecipient)
        {
            if (objective.type != ObjectiveType.Deliver)
                return false;

            return hasItem && atRecipient;
        }

        /// <summary>
        /// Check if an NPC or location is the delivery target.
        /// </summary>
        /// <param name="objective">The objective to check.</param>
        /// <param name="targetId">The NPC or location ID to check.</param>
        /// <returns>True if this is the delivery target.</returns>
        public static bool IsDeliveryTarget(QuestObjective objective, string targetId)
        {
            if (objective.type != ObjectiveType.Deliver)
                return false;

            return objective.deliverTo == targetId;
        }

        /// <summary>
        /// Create a deliver objective.
        /// </summary>
        /// <param name="itemId">Item ID to deliver.</param>
        /// <param name="recipientId">NPC or location to deliver to.</param>
        /// <param name="description">Description text.</param>
        /// <returns>The created objective.</returns>
        public static QuestObjective CreateDeliverObjective(string itemId, string recipientId, string description)
        {
            return new QuestObjective
            {
                id = $"deliver_{itemId}_to_{recipientId}_{Guid.NewGuid():N}".Substring(0, 32),
                description = description,
                type = ObjectiveType.Deliver,
                target = itemId,
                deliverTo = recipientId,
                count = 1,
                optional = false,
                hidden = false
            };
        }

        #endregion

        #region Utility Methods

        /// <summary>
        /// Get a display string for an objective's progress.
        /// </summary>
        /// <param name="objective">The objective.</param>
        /// <param name="currentProgress">Current progress value.</param>
        /// <returns>Formatted progress string.</returns>
        public static string GetProgressString(QuestObjective objective, int currentProgress)
        {
            if (objective.count <= 1)
            {
                return currentProgress >= 1 ? "Complete" : "Incomplete";
            }

            return $"{currentProgress}/{objective.count}";
        }

        /// <summary>
        /// Get an icon identifier for an objective type.
        /// </summary>
        /// <param name="type">The objective type.</param>
        /// <returns>Icon identifier string.</returns>
        public static string GetObjectiveIcon(ObjectiveType type)
        {
            return type switch
            {
                ObjectiveType.Kill => "icon_sword",
                ObjectiveType.Collect => "icon_bag",
                ObjectiveType.Talk => "icon_chat",
                ObjectiveType.Visit => "icon_map_pin",
                ObjectiveType.Interact => "icon_hand",
                ObjectiveType.Deliver => "icon_package",
                _ => "icon_quest"
            };
        }

        /// <summary>
        /// Get a verb for the objective type.
        /// </summary>
        /// <param name="type">The objective type.</param>
        /// <returns>Verb string (e.g., "Kill", "Collect").</returns>
        public static string GetObjectiveVerb(ObjectiveType type)
        {
            return type switch
            {
                ObjectiveType.Kill => "Defeat",
                ObjectiveType.Collect => "Collect",
                ObjectiveType.Talk => "Talk to",
                ObjectiveType.Visit => "Visit",
                ObjectiveType.Interact => "Use",
                ObjectiveType.Deliver => "Deliver",
                _ => "Complete"
            };
        }

        /// <summary>
        /// Calculate progress percentage for an objective.
        /// </summary>
        /// <param name="objective">The objective.</param>
        /// <param name="currentProgress">Current progress value.</param>
        /// <returns>Progress percentage (0-100).</returns>
        public static float GetProgressPercent(QuestObjective objective, int currentProgress)
        {
            if (objective.count <= 0) return 100f;
            return Mathf.Clamp01((float)currentProgress / objective.count) * 100f;
        }

        /// <summary>
        /// Check if an objective is considered complete.
        /// </summary>
        /// <param name="objective">The objective.</param>
        /// <param name="currentProgress">Current progress value.</param>
        /// <returns>True if complete.</returns>
        public static bool IsComplete(QuestObjective objective, int currentProgress)
        {
            return currentProgress >= objective.count;
        }

        #endregion
    }

    /// <summary>
    /// Extension methods for QuestObjective.
    /// </summary>
    public static class QuestObjectiveExtensions
    {
        /// <summary>
        /// Get the display icon for this objective.
        /// </summary>
        public static string GetIcon(this QuestObjective objective)
        {
            return QuestObjectiveValidator.GetObjectiveIcon(objective.type);
        }

        /// <summary>
        /// Get the action verb for this objective.
        /// </summary>
        public static string GetVerb(this QuestObjective objective)
        {
            return QuestObjectiveValidator.GetObjectiveVerb(objective.type);
        }

        /// <summary>
        /// Check if this objective has a map marker.
        /// </summary>
        public static bool HasMapMarker(this QuestObjective objective)
        {
            return !string.IsNullOrEmpty(objective.mapMarker.locationId);
        }

        /// <summary>
        /// Get a summary description of the objective.
        /// </summary>
        public static string GetSummary(this QuestObjective objective, int currentProgress)
        {
            var progress = QuestObjectiveValidator.GetProgressString(objective, currentProgress);
            var prefix = objective.optional ? "[Optional] " : "";
            return $"{prefix}{objective.description} ({progress})";
        }
    }
}

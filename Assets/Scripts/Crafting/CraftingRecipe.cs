using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Crafting
{
    /// <summary>
    /// Crafting recipe category.
    /// </summary>
    public enum CraftingCategory
    {
        Ammunition,
        Medicine,
        EquipmentUpgrade,
        Survival,
        Cooking
    }

    /// <summary>
    /// Crafting station types.
    /// </summary>
    public enum CraftingStation
    {
        None,
        Campfire,
        Workbench,
        Kitchen,
        Forge,
        AlchemyTable
    }

    /// <summary>
    /// Skills required for crafting.
    /// </summary>
    public enum CraftingSkill
    {
        None,
        Gunsmith,
        Medicine,
        Cooking,
        Survival,
        Engineering,
        Alchemy
    }

    /// <summary>
    /// Unlock condition types.
    /// </summary>
    public enum UnlockConditionType
    {
        None,
        QuestComplete,
        Reputation,
        SkillLevel,
        ItemOwned,
        NpcTaught,
        Discovered
    }

    /// <summary>
    /// Ingredient required for crafting a recipe.
    /// </summary>
    [Serializable]
    public struct CraftingIngredient
    {
        /// <summary>Item ID of the required ingredient.</summary>
        [Tooltip("Item ID of the required ingredient")]
        public string itemId;

        /// <summary>Quantity required.</summary>
        [Tooltip("Quantity required")]
        [Min(1)]
        public int quantity;

        /// <summary>Whether the ingredient is consumed.</summary>
        [Tooltip("Whether consumed on craft")]
        public bool consumed;

        public CraftingIngredient(string itemId, int quantity, bool consumed = true)
        {
            this.itemId = itemId;
            this.quantity = quantity;
            this.consumed = consumed;
        }
    }

    /// <summary>
    /// Output produced by a crafting recipe.
    /// </summary>
    [Serializable]
    public struct CraftingOutput
    {
        /// <summary>Item ID of the output.</summary>
        [Tooltip("Item ID of the output")]
        public string itemId;

        /// <summary>Quantity produced.</summary>
        [Tooltip("Quantity produced")]
        [Min(1)]
        public int quantity;

        /// <summary>Chance to produce (0-1).</summary>
        [Tooltip("Chance to produce (0-1)")]
        [Range(0f, 1f)]
        public float chance;

        public CraftingOutput(string itemId, int quantity, float chance = 1f)
        {
            this.itemId = itemId;
            this.quantity = quantity;
            this.chance = chance;
        }
    }

    /// <summary>
    /// Condition required to unlock a recipe.
    /// </summary>
    [Serializable]
    public struct UnlockCondition
    {
        /// <summary>Type of unlock condition.</summary>
        [Tooltip("Type of unlock condition")]
        public UnlockConditionType type;

        /// <summary>Target ID (quest, NPC, faction, etc.).</summary>
        [Tooltip("Target ID")]
        public string targetId;

        /// <summary>Required value (reputation, skill level).</summary>
        [Tooltip("Required value")]
        public int value;

        /// <summary>Human-readable description.</summary>
        [Tooltip("Description")]
        [TextArea(1, 3)]
        public string description;
    }

    /// <summary>
    /// Crafting recipe definition as a ScriptableObject.
    /// </summary>
    [CreateAssetMenu(fileName = "New Recipe", menuName = "Iron Frontier/Crafting/Recipe", order = 1)]
    public class CraftingRecipe : ScriptableObject
    {
        [Header("Identity")]
        /// <summary>Unique identifier.</summary>
        [Tooltip("Unique identifier")]
        public string id;

        /// <summary>Display name.</summary>
        [Tooltip("Display name")]
        public string displayName;

        /// <summary>Flavor description.</summary>
        [Tooltip("Flavor description")]
        [TextArea(2, 4)]
        public string description;

        /// <summary>Recipe category.</summary>
        [Tooltip("Recipe category")]
        public CraftingCategory category;

        [Header("Requirements")]
        /// <summary>Required crafting station.</summary>
        [Tooltip("Required crafting station")]
        public CraftingStation station = CraftingStation.None;

        /// <summary>Required skill type.</summary>
        [Tooltip("Required skill type")]
        public CraftingSkill requiredSkill = CraftingSkill.None;

        /// <summary>Minimum skill level required (0-100).</summary>
        [Tooltip("Minimum skill level (0-100)")]
        [Range(0, 100)]
        public int skillLevel = 0;

        [Header("Ingredients & Outputs")]
        /// <summary>Required ingredients.</summary>
        [Tooltip("Required ingredients")]
        public List<CraftingIngredient> ingredients = new List<CraftingIngredient>();

        /// <summary>Output items produced.</summary>
        [Tooltip("Output items produced")]
        public List<CraftingOutput> outputs = new List<CraftingOutput>();

        [Header("Timing & XP")]
        /// <summary>Crafting time in seconds.</summary>
        [Tooltip("Crafting time in seconds")]
        [Min(0)]
        public float craftingTime = 5f;

        /// <summary>Skill XP gained on successful craft.</summary>
        [Tooltip("Skill XP gained")]
        [Min(0)]
        public int skillXpGain = 5;

        [Header("Unlock")]
        /// <summary>Is this recipe unlocked by default?</summary>
        [Tooltip("Unlocked by default")]
        public bool unlockedByDefault = true;

        /// <summary>Unlock condition (if not default).</summary>
        [Tooltip("Unlock condition")]
        public UnlockCondition unlockCondition;

        [Header("Visuals & Lore")]
        /// <summary>Icon identifier for UI.</summary>
        [Tooltip("Icon ID")]
        public string iconId;

        /// <summary>Recipe icon sprite.</summary>
        [Tooltip("Recipe icon")]
        public Sprite icon;

        /// <summary>Flavor text/lore.</summary>
        [Tooltip("Lore text")]
        [TextArea(1, 3)]
        public string lore;

        [Header("Metadata")]
        /// <summary>Tags for filtering.</summary>
        [Tooltip("Tags")]
        public List<string> tags = new List<string>();

        /// <summary>Checks if recipe has a specific tag.</summary>
        public bool HasTag(string tag) => tags.Contains(tag);

        /// <summary>Gets the display name for the category.</summary>
        public string CategoryName => category switch
        {
            CraftingCategory.Ammunition => "Ammunition",
            CraftingCategory.Medicine => "Medicine",
            CraftingCategory.EquipmentUpgrade => "Equipment Upgrades",
            CraftingCategory.Survival => "Survival Items",
            CraftingCategory.Cooking => "Cooking",
            _ => "Unknown"
        };

        /// <summary>Gets the UI color for the category.</summary>
        public Color CategoryColor => category switch
        {
            CraftingCategory.Ammunition => new Color(0.753f, 0.224f, 0.169f),    // #C0392B
            CraftingCategory.Medicine => new Color(0.153f, 0.682f, 0.376f),      // #27AE60
            CraftingCategory.EquipmentUpgrade => new Color(0.953f, 0.612f, 0.071f), // #F39C12
            CraftingCategory.Survival => new Color(0.557f, 0.267f, 0.678f),      // #8E44AD
            CraftingCategory.Cooking => new Color(0.902f, 0.494f, 0.133f),       // #E67E22
            _ => Color.gray
        };

        /// <summary>Gets the display name for the station.</summary>
        public string StationName => station switch
        {
            CraftingStation.None => "Anywhere",
            CraftingStation.Campfire => "Campfire",
            CraftingStation.Workbench => "Workbench",
            CraftingStation.Kitchen => "Kitchen",
            CraftingStation.Forge => "Forge",
            CraftingStation.AlchemyTable => "Alchemy Table",
            _ => "Unknown"
        };

        /// <summary>Gets the display name for the required skill.</summary>
        public string SkillName => requiredSkill switch
        {
            CraftingSkill.None => "None",
            CraftingSkill.Gunsmith => "Gunsmith",
            CraftingSkill.Medicine => "Medicine",
            CraftingSkill.Cooking => "Cooking",
            CraftingSkill.Survival => "Survival",
            CraftingSkill.Engineering => "Engineering",
            CraftingSkill.Alchemy => "Alchemy",
            _ => "Unknown"
        };

        /// <summary>Calculates crafting success chance based on skill level.</summary>
        public float CalculateSuccessChance(int playerSkillLevel)
        {
            if (requiredSkill == CraftingSkill.None) return 1f;

            int diff = playerSkillLevel - skillLevel;
            if (diff >= 20) return 1f;           // 100% if 20+ above requirement
            if (diff >= 0) return 0.8f + diff * 0.01f;  // 80-100% at or above
            return Mathf.Max(0.5f, 0.8f + diff * 0.02f); // 50-80% below
        }

#if UNITY_EDITOR
        private void OnValidate()
        {
            if (string.IsNullOrEmpty(id))
            {
                id = name.ToLowerInvariant().Replace(" ", "_");
            }
        }
#endif
    }

    /// <summary>
    /// Player's crafting state for save/load.
    /// </summary>
    [Serializable]
    public class PlayerCraftingState
    {
        /// <summary>Unlocked recipe IDs.</summary>
        public List<string> unlockedRecipes = new List<string>();

        /// <summary>Recipe craft counts for statistics.</summary>
        public Dictionary<string, int> craftCounts = new Dictionary<string, int>();

        /// <summary>Skill levels (skill name -> level 0-100).</summary>
        public Dictionary<string, int> skillLevels = new Dictionary<string, int>();

        /// <summary>Active crafting operation (null if none).</summary>
        public ActiveCraft activeCraft;

        /// <summary>Gets skill level for a skill type.</summary>
        public int GetSkillLevel(CraftingSkill skill)
        {
            string key = skill.ToString().ToLower();
            return skillLevels.TryGetValue(key, out int level) ? level : 0;
        }

        /// <summary>Adds XP to a skill and returns true if leveled up.</summary>
        public bool AddSkillXp(CraftingSkill skill, int xp)
        {
            if (skill == CraftingSkill.None) return false;

            string key = skill.ToString().ToLower();
            if (!skillLevels.ContainsKey(key))
                skillLevels[key] = 0;

            int oldLevel = skillLevels[key];
            skillLevels[key] = Mathf.Min(100, skillLevels[key] + xp);

            return skillLevels[key] > oldLevel;
        }

        /// <summary>Checks if a recipe is unlocked.</summary>
        public bool IsRecipeUnlocked(CraftingRecipe recipe)
        {
            return recipe.unlockedByDefault || unlockedRecipes.Contains(recipe.id);
        }

        /// <summary>Unlocks a recipe by ID.</summary>
        public void UnlockRecipe(string recipeId)
        {
            if (!unlockedRecipes.Contains(recipeId))
                unlockedRecipes.Add(recipeId);
        }

        /// <summary>Records a crafting completion.</summary>
        public void RecordCraft(string recipeId)
        {
            if (!craftCounts.ContainsKey(recipeId))
                craftCounts[recipeId] = 0;
            craftCounts[recipeId]++;
        }

        /// <summary>Gets craft count for a recipe.</summary>
        public int GetCraftCount(string recipeId)
        {
            return craftCounts.TryGetValue(recipeId, out int count) ? count : 0;
        }
    }

    /// <summary>
    /// Represents an active crafting operation in progress.
    /// </summary>
    [Serializable]
    public class ActiveCraft
    {
        public string recipeId;
        public float startTime;
        public float endTime;

        /// <summary>Checks if crafting is complete.</summary>
        public bool IsComplete => Time.time >= endTime;

        /// <summary>Gets progress from 0 to 1.</summary>
        public float Progress => Mathf.Clamp01((Time.time - startTime) / (endTime - startTime));

        /// <summary>Gets remaining time in seconds.</summary>
        public float RemainingTime => Mathf.Max(0, endTime - Time.time);
    }
}

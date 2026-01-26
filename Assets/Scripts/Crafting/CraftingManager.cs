using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using IronFrontier.Data;

namespace IronFrontier.Crafting
{
    /// <summary>
    /// Result of a crafting attempt.
    /// </summary>
    public struct CraftingResult
    {
        public bool success;
        public string message;
        public List<CraftingOutput> producedItems;
        public int xpGained;
        public bool leveledUp;
    }

    /// <summary>
    /// Manages the crafting system including recipes, stations, and crafting operations.
    /// </summary>
    public class CraftingManager : MonoBehaviour
    {
        public static CraftingManager Instance { get; private set; }

        [Header("Database")]
        [SerializeField] private TextAsset craftingJsonFile;
        [SerializeField] private List<CraftingRecipe> recipeAssets = new List<CraftingRecipe>();

        [Header("Settings")]
        [SerializeField] private float craftingSpeedMultiplier = 1f;
        [SerializeField] private bool allowCraftingAnywhere = false;

        /// <summary>All loaded recipes indexed by ID.</summary>
        public Dictionary<string, CraftingRecipe> RecipesById { get; private set; } = new Dictionary<string, CraftingRecipe>();

        /// <summary>Recipes organized by category.</summary>
        public Dictionary<CraftingCategory, List<CraftingRecipe>> RecipesByCategory { get; private set; }
            = new Dictionary<CraftingCategory, List<CraftingRecipe>>();

        /// <summary>Player's crafting state.</summary>
        public PlayerCraftingState PlayerState { get; private set; } = new PlayerCraftingState();

        /// <summary>Currently available crafting stations.</summary>
        public HashSet<CraftingStation> AvailableStations { get; private set; } = new HashSet<CraftingStation>();

        /// <summary>Event fired when crafting starts.</summary>
        public event Action<CraftingRecipe> OnCraftingStarted;

        /// <summary>Event fired when crafting completes.</summary>
        public event Action<CraftingRecipe, CraftingResult> OnCraftingCompleted;

        /// <summary>Event fired when a recipe is unlocked.</summary>
        public event Action<CraftingRecipe> OnRecipeUnlocked;

        /// <summary>Event fired when a skill levels up.</summary>
        public event Action<CraftingSkill, int> OnSkillLevelUp;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            LoadRecipes();
            InitializeCategories();

            // Always have access to "no station" crafting
            AvailableStations.Add(CraftingStation.None);
        }

        private void Update()
        {
            // Check active crafting progress
            if (PlayerState.activeCraft != null && PlayerState.activeCraft.IsComplete)
            {
                CompleteCrafting();
            }
        }

        /// <summary>
        /// Loads recipes from JSON and ScriptableObjects.
        /// </summary>
        private void LoadRecipes()
        {
            // Load from ScriptableObject assets first
            foreach (var recipe in recipeAssets)
            {
                if (recipe != null && !string.IsNullOrEmpty(recipe.id))
                {
                    RecipesById[recipe.id] = recipe;
                }
            }

            // Load from JSON if available
            if (craftingJsonFile != null)
            {
                try
                {
                    var data = JsonUtility.FromJson<CraftingJsonData>(craftingJsonFile.text);
                    Debug.Log($"[CraftingManager] Loaded {data.recipes?.Length ?? 0} recipes from JSON");

                    // JSON recipes would need conversion to CraftingRecipe ScriptableObjects
                    // This is handled at import time, but we log the count for verification
                }
                catch (Exception e)
                {
                    Debug.LogError($"[CraftingManager] Failed to parse crafting JSON: {e.Message}");
                }
            }

            Debug.Log($"[CraftingManager] Total recipes loaded: {RecipesById.Count}");
        }

        /// <summary>
        /// Organizes recipes by category for UI display.
        /// </summary>
        private void InitializeCategories()
        {
            foreach (CraftingCategory category in Enum.GetValues(typeof(CraftingCategory)))
            {
                RecipesByCategory[category] = new List<CraftingRecipe>();
            }

            foreach (var recipe in RecipesById.Values)
            {
                RecipesByCategory[recipe.category].Add(recipe);
            }
        }

        /// <summary>
        /// Gets a recipe by ID.
        /// </summary>
        public CraftingRecipe GetRecipe(string recipeId)
        {
            return RecipesById.TryGetValue(recipeId, out var recipe) ? recipe : null;
        }

        /// <summary>
        /// Gets all recipes in a category.
        /// </summary>
        public List<CraftingRecipe> GetRecipesByCategory(CraftingCategory category)
        {
            return RecipesByCategory.TryGetValue(category, out var recipes) ? recipes : new List<CraftingRecipe>();
        }

        /// <summary>
        /// Gets all recipes available at a specific station.
        /// </summary>
        public List<CraftingRecipe> GetRecipesForStation(CraftingStation station)
        {
            return RecipesById.Values
                .Where(r => r.station == station || r.station == CraftingStation.None)
                .ToList();
        }

        /// <summary>
        /// Gets all recipes the player can currently craft.
        /// </summary>
        public List<CraftingRecipe> GetAvailableRecipes()
        {
            return RecipesById.Values
                .Where(r => CanCraft(r).canCraft)
                .ToList();
        }

        /// <summary>
        /// Gets all unlocked recipes.
        /// </summary>
        public List<CraftingRecipe> GetUnlockedRecipes()
        {
            return RecipesById.Values
                .Where(r => PlayerState.IsRecipeUnlocked(r))
                .ToList();
        }

        /// <summary>
        /// Checks if a recipe can be crafted.
        /// </summary>
        public (bool canCraft, string reason) CanCraft(CraftingRecipe recipe)
        {
            // Check if recipe is unlocked
            if (!PlayerState.IsRecipeUnlocked(recipe))
            {
                return (false, "Recipe not unlocked");
            }

            // Check if already crafting
            if (PlayerState.activeCraft != null)
            {
                return (false, "Already crafting");
            }

            // Check station access
            if (!allowCraftingAnywhere && !HasStationAccess(recipe.station))
            {
                return (false, $"Requires {recipe.StationName}");
            }

            // Check skill level
            int skillLevel = PlayerState.GetSkillLevel(recipe.requiredSkill);
            if (skillLevel < recipe.skillLevel)
            {
                return (false, $"Requires {recipe.SkillName} level {recipe.skillLevel}");
            }

            // Check ingredients
            if (!HasIngredients(recipe))
            {
                return (false, "Missing ingredients");
            }

            return (true, "");
        }

        /// <summary>
        /// Checks if player has required ingredients.
        /// </summary>
        public bool HasIngredients(CraftingRecipe recipe)
        {
            // This would integrate with InventoryManager
            // For now, we return true and log
            foreach (var ingredient in recipe.ingredients)
            {
                // int owned = InventoryManager.Instance.GetItemCount(ingredient.itemId);
                // if (owned < ingredient.quantity) return false;
            }
            return true;
        }

        /// <summary>
        /// Checks if player has access to a crafting station.
        /// </summary>
        public bool HasStationAccess(CraftingStation station)
        {
            return station == CraftingStation.None || AvailableStations.Contains(station);
        }

        /// <summary>
        /// Adds a crafting station to available stations.
        /// </summary>
        public void AddStationAccess(CraftingStation station)
        {
            AvailableStations.Add(station);
        }

        /// <summary>
        /// Removes a crafting station from available stations.
        /// </summary>
        public void RemoveStationAccess(CraftingStation station)
        {
            if (station != CraftingStation.None)
            {
                AvailableStations.Remove(station);
            }
        }

        /// <summary>
        /// Starts crafting a recipe.
        /// </summary>
        public bool StartCrafting(string recipeId)
        {
            var recipe = GetRecipe(recipeId);
            if (recipe == null)
            {
                Debug.LogWarning($"[CraftingManager] Recipe not found: {recipeId}");
                return false;
            }

            return StartCrafting(recipe);
        }

        /// <summary>
        /// Starts crafting a recipe.
        /// </summary>
        public bool StartCrafting(CraftingRecipe recipe)
        {
            var (canCraft, reason) = CanCraft(recipe);
            if (!canCraft)
            {
                Debug.Log($"[CraftingManager] Cannot craft {recipe.displayName}: {reason}");
                return false;
            }

            // Consume ingredients
            ConsumeIngredients(recipe);

            // Start crafting timer
            float duration = recipe.craftingTime / craftingSpeedMultiplier;
            PlayerState.activeCraft = new ActiveCraft
            {
                recipeId = recipe.id,
                startTime = Time.time,
                endTime = Time.time + duration
            };

            Debug.Log($"[CraftingManager] Started crafting {recipe.displayName} ({duration:F1}s)");
            OnCraftingStarted?.Invoke(recipe);

            // If instant crafting (0 time), complete immediately
            if (duration <= 0)
            {
                CompleteCrafting();
            }

            return true;
        }

        /// <summary>
        /// Consumes ingredients for a recipe.
        /// </summary>
        private void ConsumeIngredients(CraftingRecipe recipe)
        {
            foreach (var ingredient in recipe.ingredients)
            {
                if (ingredient.consumed)
                {
                    // InventoryManager.Instance.RemoveItem(ingredient.itemId, ingredient.quantity);
                    Debug.Log($"[CraftingManager] Consumed {ingredient.quantity}x {ingredient.itemId}");
                }
            }
        }

        /// <summary>
        /// Completes the active crafting operation.
        /// </summary>
        private void CompleteCrafting()
        {
            if (PlayerState.activeCraft == null) return;

            var recipe = GetRecipe(PlayerState.activeCraft.recipeId);
            if (recipe == null)
            {
                PlayerState.activeCraft = null;
                return;
            }

            // Calculate success chance
            int skillLevel = PlayerState.GetSkillLevel(recipe.requiredSkill);
            float successChance = recipe.CalculateSuccessChance(skillLevel);
            bool success = UnityEngine.Random.value <= successChance;

            var result = new CraftingResult
            {
                success = success,
                producedItems = new List<CraftingOutput>(),
                xpGained = 0,
                leveledUp = false
            };

            if (success)
            {
                // Produce outputs
                foreach (var output in recipe.outputs)
                {
                    if (UnityEngine.Random.value <= output.chance)
                    {
                        // InventoryManager.Instance.AddItem(output.itemId, output.quantity);
                        result.producedItems.Add(output);
                        Debug.Log($"[CraftingManager] Produced {output.quantity}x {output.itemId}");
                    }
                }

                // Grant XP
                result.xpGained = recipe.skillXpGain;
                result.leveledUp = PlayerState.AddSkillXp(recipe.requiredSkill, recipe.skillXpGain);

                if (result.leveledUp)
                {
                    int newLevel = PlayerState.GetSkillLevel(recipe.requiredSkill);
                    OnSkillLevelUp?.Invoke(recipe.requiredSkill, newLevel);
                }

                // Record craft
                PlayerState.RecordCraft(recipe.id);

                result.message = $"Crafted {recipe.displayName}!";
            }
            else
            {
                result.message = $"Failed to craft {recipe.displayName}";
                // Could return partial ingredients here
            }

            Debug.Log($"[CraftingManager] {result.message}");

            PlayerState.activeCraft = null;
            OnCraftingCompleted?.Invoke(recipe, result);
        }

        /// <summary>
        /// Cancels the active crafting operation.
        /// </summary>
        public void CancelCrafting()
        {
            if (PlayerState.activeCraft == null) return;

            var recipe = GetRecipe(PlayerState.activeCraft.recipeId);
            if (recipe != null)
            {
                // Return ingredients (partial or full based on progress)
                float progress = PlayerState.activeCraft.Progress;
                if (progress < 0.5f)
                {
                    // Return all ingredients if less than 50% complete
                    foreach (var ingredient in recipe.ingredients)
                    {
                        if (ingredient.consumed)
                        {
                            // InventoryManager.Instance.AddItem(ingredient.itemId, ingredient.quantity);
                            Debug.Log($"[CraftingManager] Returned {ingredient.quantity}x {ingredient.itemId}");
                        }
                    }
                }
            }

            Debug.Log("[CraftingManager] Crafting cancelled");
            PlayerState.activeCraft = null;
        }

        /// <summary>
        /// Unlocks a recipe for the player.
        /// </summary>
        public void UnlockRecipe(string recipeId)
        {
            var recipe = GetRecipe(recipeId);
            if (recipe == null) return;

            if (!PlayerState.IsRecipeUnlocked(recipe))
            {
                PlayerState.UnlockRecipe(recipeId);
                Debug.Log($"[CraftingManager] Unlocked recipe: {recipe.displayName}");
                OnRecipeUnlocked?.Invoke(recipe);
            }
        }

        /// <summary>
        /// Gets crafting progress (0-1) for UI.
        /// </summary>
        public float GetCraftingProgress()
        {
            return PlayerState.activeCraft?.Progress ?? 0f;
        }

        /// <summary>
        /// Gets remaining crafting time in seconds.
        /// </summary>
        public float GetRemainingCraftingTime()
        {
            return PlayerState.activeCraft?.RemainingTime ?? 0f;
        }

        /// <summary>
        /// Checks if currently crafting.
        /// </summary>
        public bool IsCrafting => PlayerState.activeCraft != null;

        /// <summary>
        /// Gets the recipe currently being crafted.
        /// </summary>
        public CraftingRecipe CurrentCraftingRecipe
        {
            get
            {
                if (PlayerState.activeCraft == null) return null;
                return GetRecipe(PlayerState.activeCraft.recipeId);
            }
        }

        /// <summary>
        /// Saves crafting state.
        /// </summary>
        public PlayerCraftingState SaveState()
        {
            return PlayerState;
        }

        /// <summary>
        /// Loads crafting state.
        /// </summary>
        public void LoadState(PlayerCraftingState state)
        {
            if (state != null)
            {
                PlayerState = state;
            }
        }

        /// <summary>
        /// Gets recipes that use a specific ingredient.
        /// </summary>
        public List<CraftingRecipe> GetRecipesUsingIngredient(string itemId)
        {
            return RecipesById.Values
                .Where(r => r.ingredients.Any(i => i.itemId == itemId))
                .ToList();
        }

        /// <summary>
        /// Gets recipes that produce a specific item.
        /// </summary>
        public List<CraftingRecipe> GetRecipesProducingItem(string itemId)
        {
            return RecipesById.Values
                .Where(r => r.outputs.Any(o => o.itemId == itemId))
                .ToList();
        }
    }

    /// <summary>
    /// JSON data structure for crafting recipes.
    /// </summary>
    [Serializable]
    public class CraftingJsonData
    {
        public string schemaVersion;
        public int totalRecipes;
        public CraftingJsonRecipe[] recipes;
    }

    [Serializable]
    public class CraftingJsonRecipe
    {
        public string id;
        public string name;
        public string description;
        public string category;
        public string station;
        public CraftingJsonIngredient[] ingredients;
        public CraftingJsonOutput[] outputs;
        public float craftingTime;
        public string requiredSkill;
        public int skillLevel;
        public int skillXpGain;
        public bool unlockedByDefault;
        public CraftingJsonUnlockCondition unlockCondition;
        public string[] tags;
        public string icon;
        public string lore;
    }

    [Serializable]
    public class CraftingJsonIngredient
    {
        public string itemId;
        public int quantity;
        public bool consumed;
    }

    [Serializable]
    public class CraftingJsonOutput
    {
        public string itemId;
        public int quantity;
        public float chance;
    }

    [Serializable]
    public class CraftingJsonUnlockCondition
    {
        public string type;
        public string targetId;
        public int? value;
        public string description;
    }
}

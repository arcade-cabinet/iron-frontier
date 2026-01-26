using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Systems;

namespace IronFrontier.Inventory
{
    /// <summary>
    /// Component for chests and containers that hold loot.
    /// Attach this to any GameObject that represents a lootable container.
    /// </summary>
    public class ChestContainer : MonoBehaviour
    {
        [Header("Loot Configuration")]
        [SerializeField] private string _lootTableId;
        [SerializeField] private int _goldMin = 0;
        [SerializeField] private int _goldMax = 50;
        [SerializeField] private bool _respawns = false;
        [SerializeField] private float _respawnTime = 300f;

        [Header("Visual Effects")]
        [SerializeField] private bool _enableGlow = true;
        [SerializeField] private GameObject _openedVisual;
        [SerializeField] private GameObject _closedVisual;

        [Header("Audio")]
        [SerializeField] private AudioClip _openSound;
        [SerializeField] private AudioClip _closeSound;

        private bool _isOpened;
        private bool _hasBeenLooted;
        private float _respawnTimer;
        private List<LootResult> _generatedLoot;
        private int _generatedGold;

        /// <summary>
        /// The loot table ID for this chest.
        /// </summary>
        public string LootTableId
        {
            get => _lootTableId;
            set => _lootTableId = value;
        }

        /// <summary>
        /// Whether the chest is currently open.
        /// </summary>
        public bool IsOpened => _isOpened;

        /// <summary>
        /// Whether the chest has been looted.
        /// </summary>
        public bool HasBeenLooted => _hasBeenLooted;

        /// <summary>
        /// The generated loot (available after opening).
        /// </summary>
        public IReadOnlyList<LootResult> GeneratedLoot => _generatedLoot;

        /// <summary>
        /// The generated gold amount.
        /// </summary>
        public int GeneratedGold => _generatedGold;

        /// <summary>
        /// Display name for UI.
        /// </summary>
        public string DisplayName => gameObject.name.Replace("_", " ");

        private void Start()
        {
            UpdateVisuals();
        }

        private void Update()
        {
            if (_respawns && _hasBeenLooted)
            {
                _respawnTimer += Time.deltaTime;
                if (_respawnTimer >= _respawnTime)
                {
                    Respawn();
                }
            }
        }

        /// <summary>
        /// Opens the chest and generates loot.
        /// </summary>
        /// <returns>True if the chest was opened, false if already open.</returns>
        public bool Open()
        {
            if (_isOpened) return false;

            _isOpened = true;

            // Play sound
            if (_openSound != null)
            {
                AudioSource.PlayClipAtPoint(_openSound, transform.position);
            }

            // Generate loot if not already generated
            if (_generatedLoot == null)
            {
                GenerateLoot();
            }

            // Update visuals
            UpdateVisuals();

            // Trigger animation if animator exists
            var animator = GetComponent<Animator>();
            if (animator != null)
            {
                animator.SetBool("IsOpen", true);
            }

            // Publish event
            Core.EventBus.Instance?.Publish("chest_opened", gameObject.name);

            return true;
        }

        /// <summary>
        /// Closes the chest.
        /// </summary>
        public void Close()
        {
            if (!_isOpened) return;

            _isOpened = false;

            // Play sound
            if (_closeSound != null)
            {
                AudioSource.PlayClipAtPoint(_closeSound, transform.position);
            }

            // Update visuals
            UpdateVisuals();

            // Trigger animation
            var animator = GetComponent<Animator>();
            if (animator != null)
            {
                animator.SetBool("IsOpen", false);
            }
        }

        /// <summary>
        /// Generates loot from the configured loot table.
        /// </summary>
        private void GenerateLoot()
        {
            _generatedLoot = new List<LootResult>();
            _generatedGold = 0;

            // Generate items from loot table
            if (!string.IsNullOrEmpty(_lootTableId) && LootSystem.Instance != null)
            {
                _generatedLoot = LootSystem.Instance.RollLoot(_lootTableId, gameObject.name);
            }

            // Generate gold
            if (_goldMax > 0)
            {
                _generatedGold = UnityEngine.Random.Range(_goldMin, _goldMax + 1);
            }

            Debug.Log($"[ChestContainer] Generated {_generatedLoot.Count} items and {_generatedGold} gold from {gameObject.name}");
        }

        /// <summary>
        /// Collects all loot from the chest and adds to inventory.
        /// </summary>
        /// <returns>True if loot was collected.</returns>
        public bool CollectAllLoot()
        {
            if (_generatedLoot == null || _hasBeenLooted) return false;

            bool anyCollected = false;

            // Add gold
            if (_generatedGold > 0 && InventoryManager.Instance != null)
            {
                InventoryManager.Instance.AddGold(_generatedGold);
                anyCollected = true;
            }

            // Add items
            foreach (var loot in _generatedLoot)
            {
                if (InventoryManager.Instance != null)
                {
                    int added = InventoryManager.Instance.AddItemById(loot.ItemId, loot.Quantity);
                    if (added > 0)
                    {
                        anyCollected = true;
                        Core.EventBus.Instance?.Publish(Core.GameEvents.ItemAdded, loot.ItemId);
                    }
                }
            }

            if (anyCollected)
            {
                _hasBeenLooted = true;
                _respawnTimer = 0f;

                // Publish event
                Core.EventBus.Instance?.Publish("chest_looted", gameObject.name);
            }

            return anyCollected;
        }

        /// <summary>
        /// Collects a specific item from the chest.
        /// </summary>
        /// <param name="itemId">Item ID to collect.</param>
        /// <returns>Quantity collected.</returns>
        public int CollectItem(string itemId)
        {
            if (_generatedLoot == null || _hasBeenLooted) return 0;

            var loot = _generatedLoot.Find(l => l.ItemId == itemId);
            if (loot == null) return 0;

            int added = 0;
            if (InventoryManager.Instance != null)
            {
                added = InventoryManager.Instance.AddItemById(loot.ItemId, loot.Quantity);
            }

            if (added > 0)
            {
                _generatedLoot.Remove(loot);
                Core.EventBus.Instance?.Publish(Core.GameEvents.ItemAdded, loot.ItemId);

                // Check if all loot collected
                if (_generatedLoot.Count == 0 && _generatedGold == 0)
                {
                    _hasBeenLooted = true;
                    _respawnTimer = 0f;
                }
            }

            return added;
        }

        /// <summary>
        /// Respawns the chest with new loot.
        /// </summary>
        private void Respawn()
        {
            _isOpened = false;
            _hasBeenLooted = false;
            _respawnTimer = 0f;
            _generatedLoot = null;
            _generatedGold = 0;

            UpdateVisuals();

            Debug.Log($"[ChestContainer] {gameObject.name} respawned");
        }

        /// <summary>
        /// Updates the visual state of the chest.
        /// </summary>
        private void UpdateVisuals()
        {
            if (_openedVisual != null)
            {
                _openedVisual.SetActive(_isOpened);
            }

            if (_closedVisual != null)
            {
                _closedVisual.SetActive(!_isOpened);
            }
        }

        /// <summary>
        /// Highlights this chest (called when player is nearby).
        /// </summary>
        public void Highlight()
        {
            if (!_enableGlow) return;

            var renderer = GetComponentInChildren<Renderer>();
            if (renderer != null)
            {
                // Could add outline effect or emission
            }
        }

        /// <summary>
        /// Removes highlight from this chest.
        /// </summary>
        public void RemoveHighlight()
        {
            if (!_enableGlow) return;

            var renderer = GetComponentInChildren<Renderer>();
            if (renderer != null)
            {
                // Remove outline effect or emission
            }
        }

        /// <summary>
        /// Gets save data for this chest.
        /// </summary>
        public ChestSaveData GetSaveData()
        {
            return new ChestSaveData
            {
                chestId = gameObject.name,
                isOpened = _isOpened,
                hasBeenLooted = _hasBeenLooted,
                respawnTimer = _respawnTimer
            };
        }

        /// <summary>
        /// Loads save data for this chest.
        /// </summary>
        public void LoadSaveData(ChestSaveData data)
        {
            if (data == null) return;

            _isOpened = data.isOpened;
            _hasBeenLooted = data.hasBeenLooted;
            _respawnTimer = data.respawnTimer;

            UpdateVisuals();
        }
    }

    /// <summary>
    /// Save data for a chest container.
    /// </summary>
    [Serializable]
    public class ChestSaveData
    {
        public string chestId;
        public bool isOpened;
        public bool hasBeenLooted;
        public float respawnTimer;
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace IronFrontier.Dialogue
{
    /// <summary>
    /// Entry point for a dialogue tree, with conditions to determine which node to start at.
    /// </summary>
    [Serializable]
    public class DialogueEntryPoint
    {
        [Tooltip("Node ID to start at")]
        public string nodeId;

        [Tooltip("Conditions that must be met to use this entry point")]
        public List<DialogueCondition> conditions = new List<DialogueCondition>();

        [Tooltip("Higher priority entry points are checked first")]
        public int priority;

        public DialogueEntryPoint() { }

        public DialogueEntryPoint(string nodeId, int priority = 0)
        {
            this.nodeId = nodeId;
            this.priority = priority;
        }
    }

    /// <summary>
    /// A complete dialogue tree, stored as a ScriptableObject.
    /// </summary>
    [CreateAssetMenu(fileName = "NewDialogue", menuName = "Iron Frontier/Dialogue Tree")]
    public class DialogueTree : ScriptableObject
    {
        [Tooltip("Unique identifier for this dialogue tree")]
        public string treeId;

        [Tooltip("Human-readable name (for editors)")]
        public string displayName;

        [Tooltip("Description of this dialogue's purpose")]
        [TextArea(2, 4)]
        public string description;

        [Tooltip("Entry points - conditions determine which node starts")]
        public List<DialogueEntryPoint> entryPoints = new List<DialogueEntryPoint>();

        [Tooltip("All nodes in this dialogue tree")]
        public List<DialogueNode> nodes = new List<DialogueNode>();

        [Tooltip("Tags for categorization")]
        public List<string> tags = new List<string>();

        /// <summary>
        /// Get a node by its ID
        /// </summary>
        public DialogueNode GetNode(string nodeId)
        {
            return nodes.FirstOrDefault(n => n.id == nodeId);
        }

        /// <summary>
        /// Get the entry node based on conditions
        /// </summary>
        public DialogueNode GetEntryNode(Func<DialogueCondition, bool> conditionChecker)
        {
            // Sort by priority (higher first)
            var sortedEntries = entryPoints.OrderByDescending(e => e.priority);

            foreach (var entry in sortedEntries)
            {
                // Check if all conditions are met
                bool allConditionsMet = entry.conditions == null ||
                                        entry.conditions.Count == 0 ||
                                        entry.conditions.All(conditionChecker);

                if (allConditionsMet)
                {
                    return GetNode(entry.nodeId);
                }
            }

            // Fall back to last entry point (lowest priority, usually default)
            var fallback = entryPoints.OrderBy(e => e.priority).FirstOrDefault();
            return fallback != null ? GetNode(fallback.nodeId) : null;
        }

        /// <summary>
        /// Get available choices for a node, filtered by conditions
        /// </summary>
        public List<DialogueOption> GetAvailableChoices(DialogueNode node, Func<DialogueCondition, bool> conditionChecker)
        {
            if (node.choices == null || node.choices.Count == 0)
            {
                return new List<DialogueOption>();
            }

            return node.choices.Where(choice =>
            {
                if (choice.conditions == null || choice.conditions.Count == 0)
                {
                    return true;
                }
                return choice.conditions.All(conditionChecker);
            }).ToList();
        }

        /// <summary>
        /// Validate the dialogue tree integrity
        /// </summary>
        public List<string> Validate()
        {
            var errors = new List<string>();
            var nodeIds = new HashSet<string>(nodes.Select(n => n.id));

            // Check entry points reference valid nodes
            foreach (var entry in entryPoints)
            {
                if (!nodeIds.Contains(entry.nodeId))
                {
                    errors.Add($"Entry point references unknown node: {entry.nodeId}");
                }
            }

            // Check all nextNodeId references
            foreach (var node in nodes)
            {
                if (!string.IsNullOrEmpty(node.nextNodeId) && !nodeIds.Contains(node.nextNodeId))
                {
                    errors.Add($"Node '{node.id}' references unknown next node: {node.nextNodeId}");
                }

                if (node.choices != null)
                {
                    foreach (var choice in node.choices)
                    {
                        if (!string.IsNullOrEmpty(choice.nextNodeId) && !nodeIds.Contains(choice.nextNodeId))
                        {
                            errors.Add($"Choice in node '{node.id}' references unknown node: {choice.nextNodeId}");
                        }
                    }
                }
            }

            // Check for duplicate node IDs
            var duplicates = nodes.GroupBy(n => n.id).Where(g => g.Count() > 1).Select(g => g.Key);
            foreach (var dup in duplicates)
            {
                errors.Add($"Duplicate node ID: {dup}");
            }

            return errors;
        }

        /// <summary>
        /// Check if this tree has a specific tag
        /// </summary>
        public bool HasTag(string tag)
        {
            return tags != null && tags.Contains(tag);
        }
    }

    /// <summary>
    /// Central database for all dialogue trees in the game.
    /// </summary>
    [CreateAssetMenu(fileName = "DialogueDatabase", menuName = "Iron Frontier/Dialogue Database")]
    public class DialogueDatabase : ScriptableObject
    {
        [Tooltip("All dialogue trees in the game")]
        public List<DialogueTree> dialogueTrees = new List<DialogueTree>();

        private Dictionary<string, DialogueTree> _treeCache;

        /// <summary>
        /// Build the cache for fast lookup
        /// </summary>
        public void Initialize()
        {
            _treeCache = new Dictionary<string, DialogueTree>();
            foreach (var tree in dialogueTrees)
            {
                if (tree != null && !string.IsNullOrEmpty(tree.treeId))
                {
                    _treeCache[tree.treeId] = tree;
                }
            }
        }

        /// <summary>
        /// Get a dialogue tree by ID
        /// </summary>
        public DialogueTree GetTree(string treeId)
        {
            if (_treeCache == null)
            {
                Initialize();
            }

            return _treeCache.TryGetValue(treeId, out var tree) ? tree : null;
        }

        /// <summary>
        /// Get all trees with a specific tag
        /// </summary>
        public List<DialogueTree> GetTreesByTag(string tag)
        {
            return dialogueTrees.Where(t => t != null && t.HasTag(tag)).ToList();
        }

        /// <summary>
        /// Validate all dialogue trees
        /// </summary>
        public Dictionary<string, List<string>> ValidateAll()
        {
            var results = new Dictionary<string, List<string>>();
            foreach (var tree in dialogueTrees)
            {
                if (tree != null)
                {
                    var errors = tree.Validate();
                    if (errors.Count > 0)
                    {
                        results[tree.treeId] = errors;
                    }
                }
            }
            return results;
        }

#if UNITY_EDITOR
        /// <summary>
        /// Editor utility to add a dialogue tree
        /// </summary>
        public void AddTree(DialogueTree tree)
        {
            if (tree != null && !dialogueTrees.Contains(tree))
            {
                dialogueTrees.Add(tree);
                _treeCache = null; // Invalidate cache
            }
        }

        /// <summary>
        /// Editor utility to remove a dialogue tree
        /// </summary>
        public void RemoveTree(DialogueTree tree)
        {
            dialogueTrees.Remove(tree);
            _treeCache = null; // Invalidate cache
        }
#endif
    }
}

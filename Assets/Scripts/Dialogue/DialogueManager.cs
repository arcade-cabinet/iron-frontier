using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace IronFrontier.Dialogue
{
    /// <summary>
    /// Runtime state for an active dialogue session.
    /// </summary>
    public class DialogueState
    {
        public string NpcId { get; set; }
        public DialogueTree Tree { get; set; }
        public DialogueNode CurrentNode { get; set; }
        public List<string> History { get; } = new List<string>();
        public Dictionary<string, bool> ConversationFlags { get; } = new Dictionary<string, bool>();
        public DateTime StartedAt { get; set; }
    }

    /// <summary>
    /// Event data for dialogue events.
    /// </summary>
    public class DialogueEventArgs
    {
        public string NpcId { get; set; }
        public DialogueNode Node { get; set; }
        public List<DialogueOption> AvailableChoices { get; set; }
    }

    /// <summary>
    /// Event data for choice selection.
    /// </summary>
    public class ChoiceSelectedEventArgs
    {
        public string NpcId { get; set; }
        public DialogueOption Choice { get; set; }
        public DialogueNode PreviousNode { get; set; }
        public DialogueNode NextNode { get; set; }
    }

    /// <summary>
    /// Event data for effect execution.
    /// </summary>
    public class EffectEventArgs
    {
        public DialogueEffect Effect { get; set; }
        public string NpcId { get; set; }
    }

    /// <summary>
    /// Central manager for the dialogue system.
    /// Handles dialogue flow, condition checking, and effect application.
    /// </summary>
    public class DialogueManager : MonoBehaviour
    {
        public static DialogueManager Instance { get; private set; }

        [Header("Configuration")]
        [SerializeField] private DialogueDatabase _database;
        [SerializeField] private bool _logDebugInfo = false;

        [Header("Events")]
        public UnityEvent<DialogueEventArgs> OnDialogueStarted;
        public UnityEvent<DialogueEventArgs> OnNodeEntered;
        public UnityEvent<ChoiceSelectedEventArgs> OnChoiceSelected;
        public UnityEvent<EffectEventArgs> OnEffectTriggered;
        public UnityEvent<string> OnDialogueEnded;

        // Current dialogue state
        private DialogueState _currentState;
        private bool _isInDialogue;

        // Condition checker delegate
        private Func<string, DialogueCondition, bool> _conditionChecker;

        // Effect handler delegate
        private Action<string, DialogueEffect> _effectHandler;

        /// <summary>
        /// Whether a dialogue is currently active
        /// </summary>
        public bool IsInDialogue => _isInDialogue;

        /// <summary>
        /// Current dialogue state (null if not in dialogue)
        /// </summary>
        public DialogueState CurrentState => _currentState;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            if (_database != null)
            {
                _database.Initialize();
            }
        }

        /// <summary>
        /// Register the condition checker function.
        /// This function evaluates whether dialogue conditions are met.
        /// </summary>
        public void RegisterConditionChecker(Func<string, DialogueCondition, bool> checker)
        {
            _conditionChecker = checker;
        }

        /// <summary>
        /// Register the effect handler function.
        /// This function applies dialogue effects to the game state.
        /// </summary>
        public void RegisterEffectHandler(Action<string, DialogueEffect> handler)
        {
            _effectHandler = handler;
        }

        /// <summary>
        /// Start a dialogue with an NPC using their primary dialogue tree.
        /// </summary>
        public bool StartDialogue(string npcId, string dialogueTreeId)
        {
            if (_isInDialogue)
            {
                LogWarning($"Cannot start dialogue with {npcId}: already in dialogue");
                return false;
            }

            var tree = _database?.GetTree(dialogueTreeId);
            if (tree == null)
            {
                LogError($"Dialogue tree not found: {dialogueTreeId}");
                return false;
            }

            return StartDialogueWithTree(npcId, tree);
        }

        /// <summary>
        /// Start a dialogue with a specific dialogue tree.
        /// </summary>
        public bool StartDialogueWithTree(string npcId, DialogueTree tree)
        {
            if (_isInDialogue)
            {
                LogWarning($"Cannot start dialogue with {npcId}: already in dialogue");
                return false;
            }

            if (tree == null)
            {
                LogError("Cannot start dialogue: tree is null");
                return false;
            }

            // Find the entry node based on conditions
            var entryNode = tree.GetEntryNode(c => CheckCondition(npcId, c));
            if (entryNode == null)
            {
                LogError($"No valid entry node found for dialogue tree: {tree.treeId}");
                return false;
            }

            // Initialize state
            _currentState = new DialogueState
            {
                NpcId = npcId,
                Tree = tree,
                CurrentNode = entryNode,
                StartedAt = DateTime.Now
            };
            _isInDialogue = true;

            Log($"Starting dialogue with {npcId}, tree: {tree.treeId}, entry: {entryNode.id}");

            // Fire started event
            OnDialogueStarted?.Invoke(new DialogueEventArgs
            {
                NpcId = npcId,
                Node = entryNode,
                AvailableChoices = GetAvailableChoices()
            });

            // Enter the first node
            EnterNode(entryNode);

            return true;
        }

        /// <summary>
        /// Select a dialogue choice by index.
        /// </summary>
        public bool SelectChoice(int choiceIndex)
        {
            if (!_isInDialogue || _currentState == null)
            {
                LogWarning("Cannot select choice: not in dialogue");
                return false;
            }

            var availableChoices = GetAvailableChoices();
            if (choiceIndex < 0 || choiceIndex >= availableChoices.Count)
            {
                LogWarning($"Invalid choice index: {choiceIndex}");
                return false;
            }

            var choice = availableChoices[choiceIndex];
            return SelectChoice(choice);
        }

        /// <summary>
        /// Select a specific dialogue choice.
        /// </summary>
        public bool SelectChoice(DialogueOption choice)
        {
            if (!_isInDialogue || _currentState == null)
            {
                LogWarning("Cannot select choice: not in dialogue");
                return false;
            }

            if (choice == null)
            {
                LogWarning("Cannot select null choice");
                return false;
            }

            var previousNode = _currentState.CurrentNode;

            Log($"Choice selected: {choice.text}");

            // Apply choice effects
            if (choice.effects != null)
            {
                foreach (var effect in choice.effects)
                {
                    ApplyEffect(effect);
                }
            }

            // Check if conversation ends
            if (choice.EndsConversation)
            {
                OnChoiceSelected?.Invoke(new ChoiceSelectedEventArgs
                {
                    NpcId = _currentState.NpcId,
                    Choice = choice,
                    PreviousNode = previousNode,
                    NextNode = null
                });

                EndDialogue();
                return true;
            }

            // Navigate to next node
            var nextNode = _currentState.Tree.GetNode(choice.nextNodeId);
            if (nextNode == null)
            {
                LogError($"Next node not found: {choice.nextNodeId}");
                EndDialogue();
                return false;
            }

            OnChoiceSelected?.Invoke(new ChoiceSelectedEventArgs
            {
                NpcId = _currentState.NpcId,
                Choice = choice,
                PreviousNode = previousNode,
                NextNode = nextNode
            });

            EnterNode(nextNode);
            return true;
        }

        /// <summary>
        /// Continue a monologue (auto-advance) dialogue.
        /// </summary>
        public bool Continue()
        {
            if (!_isInDialogue || _currentState == null)
            {
                LogWarning("Cannot continue: not in dialogue");
                return false;
            }

            var currentNode = _currentState.CurrentNode;

            // If this is a monologue node, advance automatically
            if (currentNode.IsMonologue)
            {
                var nextNode = _currentState.Tree.GetNode(currentNode.nextNodeId);
                if (nextNode == null)
                {
                    LogError($"Next node not found: {currentNode.nextNodeId}");
                    EndDialogue();
                    return false;
                }

                EnterNode(nextNode);
                return true;
            }

            // If this is an end node, end the dialogue
            if (currentNode.IsEndNode)
            {
                EndDialogue();
                return true;
            }

            // Otherwise, player needs to select a choice
            return false;
        }

        /// <summary>
        /// Get the available choices for the current node.
        /// </summary>
        public List<DialogueOption> GetAvailableChoices()
        {
            if (!_isInDialogue || _currentState == null)
            {
                return new List<DialogueOption>();
            }

            return _currentState.Tree.GetAvailableChoices(
                _currentState.CurrentNode,
                c => CheckCondition(_currentState.NpcId, c)
            );
        }

        /// <summary>
        /// End the current dialogue.
        /// </summary>
        public void EndDialogue()
        {
            if (!_isInDialogue)
            {
                return;
            }

            var npcId = _currentState?.NpcId;
            Log($"Ending dialogue with {npcId}");

            _isInDialogue = false;
            _currentState = null;

            OnDialogueEnded?.Invoke(npcId);
        }

        /// <summary>
        /// Force end the dialogue (for interruptions).
        /// </summary>
        public void ForceEndDialogue()
        {
            EndDialogue();
        }

        /// <summary>
        /// Navigate back in the dialogue history.
        /// </summary>
        public bool GoBack()
        {
            if (!_isInDialogue || _currentState == null)
            {
                return false;
            }

            if (_currentState.History.Count == 0)
            {
                return false;
            }

            var previousNodeId = _currentState.History[_currentState.History.Count - 1];
            _currentState.History.RemoveAt(_currentState.History.Count - 1);

            var previousNode = _currentState.Tree.GetNode(previousNodeId);
            if (previousNode == null)
            {
                return false;
            }

            _currentState.CurrentNode = previousNode;

            OnNodeEntered?.Invoke(new DialogueEventArgs
            {
                NpcId = _currentState.NpcId,
                Node = previousNode,
                AvailableChoices = GetAvailableChoices()
            });

            return true;
        }

        /// <summary>
        /// Set a conversation flag (local to this dialogue session).
        /// </summary>
        public void SetConversationFlag(string flagId, bool value = true)
        {
            if (_currentState != null)
            {
                _currentState.ConversationFlags[flagId] = value;
            }
        }

        /// <summary>
        /// Check a conversation flag.
        /// </summary>
        public bool GetConversationFlag(string flagId)
        {
            if (_currentState == null)
            {
                return false;
            }

            return _currentState.ConversationFlags.TryGetValue(flagId, out var value) && value;
        }

        private void EnterNode(DialogueNode node)
        {
            // Add current node to history before moving
            if (_currentState.CurrentNode != null)
            {
                _currentState.History.Add(_currentState.CurrentNode.id);
            }

            _currentState.CurrentNode = node;

            Log($"Entering node: {node.id}");

            // Apply on-enter effects
            if (node.onEnterEffects != null)
            {
                foreach (var effect in node.onEnterEffects)
                {
                    ApplyEffect(effect);
                }
            }

            // Fire node entered event
            OnNodeEntered?.Invoke(new DialogueEventArgs
            {
                NpcId = _currentState.NpcId,
                Node = node,
                AvailableChoices = GetAvailableChoices()
            });
        }

        private bool CheckCondition(string npcId, DialogueCondition condition)
        {
            // Check conversation-local flags first
            if (condition.type == ConditionType.FlagSet)
            {
                if (_currentState?.ConversationFlags.TryGetValue(condition.target, out var flagValue) == true)
                {
                    return flagValue;
                }
            }
            else if (condition.type == ConditionType.FlagNotSet)
            {
                if (_currentState?.ConversationFlags.TryGetValue(condition.target, out var flagValue) == true)
                {
                    return !flagValue;
                }
            }

            // Delegate to external condition checker
            if (_conditionChecker != null)
            {
                return _conditionChecker(npcId, condition);
            }

            // Default: condition not met
            LogWarning($"No condition checker registered for condition: {condition.type}");
            return false;
        }

        private void ApplyEffect(DialogueEffect effect)
        {
            Log($"Applying effect: {effect}");

            // Handle conversation-local flags
            if (effect.type == DialogueEffectType.SetFlag)
            {
                SetConversationFlag(effect.target, true);
            }
            else if (effect.type == DialogueEffectType.ClearFlag)
            {
                SetConversationFlag(effect.target, false);
            }

            // Fire effect event
            OnEffectTriggered?.Invoke(new EffectEventArgs
            {
                Effect = effect,
                NpcId = _currentState?.NpcId
            });

            // Delegate to external effect handler
            _effectHandler?.Invoke(_currentState?.NpcId, effect);
        }

        private void Log(string message)
        {
            if (_logDebugInfo)
            {
                Debug.Log($"[DialogueManager] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[DialogueManager] {message}");
        }

        private void LogError(string message)
        {
            Debug.LogError($"[DialogueManager] {message}");
        }
    }
}

using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Dialogue
{
    /// <summary>
    /// JSON data structures for importing dialogue from exported TypeScript files.
    /// </summary>
    [Serializable]
    public class JsonDialogueCondition
    {
        public string type;
        public string target;
        public int value;
        public string stringValue;
    }

    [Serializable]
    public class JsonDialogueEffect
    {
        public string type;
        public string target;
        public int value;
        public string stringValue;
    }

    [Serializable]
    public class JsonDialogueChoice
    {
        public string text;
        public string nextNodeId;
        public List<JsonDialogueCondition> conditions;
        public List<JsonDialogueEffect> effects;
        public List<string> tags;
        public string hint;
    }

    [Serializable]
    public class JsonDialogueNode
    {
        public string id;
        public string text;
        public string speaker;
        public string expression;
        public List<JsonDialogueCondition> conditions;
        public List<JsonDialogueChoice> choices;
        public string nextNodeId;
        public float choiceDelay;
        public List<JsonDialogueEffect> onEnterEffects;
        public List<string> tags;
    }

    [Serializable]
    public class JsonDialogueEntryPoint
    {
        public string nodeId;
        public List<JsonDialogueCondition> conditions;
        public int priority;
    }

    [Serializable]
    public class JsonDialogueTree
    {
        public string id;
        public string name;
        public string description;
        public List<JsonDialogueEntryPoint> entryPoints;
        public List<JsonDialogueNode> nodes;
        public List<string> tags;
    }

    /// <summary>
    /// Utility for importing dialogue trees from JSON files.
    /// Converts exported TypeScript dialogue data to Unity ScriptableObjects.
    /// </summary>
    public static class DialogueImporter
    {
        /// <summary>
        /// Load a dialogue tree from a JSON text asset
        /// </summary>
        public static DialogueTree ImportFromJson(TextAsset jsonAsset)
        {
            if (jsonAsset == null)
            {
                Debug.LogError("Cannot import dialogue: TextAsset is null");
                return null;
            }

            return ImportFromJson(jsonAsset.text);
        }

        /// <summary>
        /// Load a dialogue tree from a JSON string
        /// </summary>
        public static DialogueTree ImportFromJson(string jsonText)
        {
            try
            {
                var jsonTree = JsonUtility.FromJson<JsonDialogueTree>(jsonText);
                return ConvertToDialogueTree(jsonTree);
            }
            catch (Exception e)
            {
                Debug.LogError($"Failed to import dialogue from JSON: {e.Message}");
                return null;
            }
        }

        /// <summary>
        /// Load all dialogue trees from a Resources folder path
        /// </summary>
        public static List<DialogueTree> ImportAllFromResources(string folderPath = "Data/Dialogues")
        {
            var results = new List<DialogueTree>();
            var jsonFiles = Resources.LoadAll<TextAsset>(folderPath);

            foreach (var jsonFile in jsonFiles)
            {
                var tree = ImportFromJson(jsonFile);
                if (tree != null)
                {
                    results.Add(tree);
                }
            }

            Debug.Log($"Imported {results.Count} dialogue trees from {folderPath}");
            return results;
        }

        private static DialogueTree ConvertToDialogueTree(JsonDialogueTree jsonTree)
        {
            var tree = ScriptableObject.CreateInstance<DialogueTree>();
            tree.treeId = jsonTree.id;
            tree.displayName = jsonTree.name;
            tree.description = jsonTree.description;
            tree.tags = jsonTree.tags ?? new List<string>();

            // Convert entry points
            tree.entryPoints = new List<DialogueEntryPoint>();
            if (jsonTree.entryPoints != null)
            {
                foreach (var jsonEntry in jsonTree.entryPoints)
                {
                    tree.entryPoints.Add(ConvertEntryPoint(jsonEntry));
                }
            }

            // Convert nodes
            tree.nodes = new List<DialogueNode>();
            if (jsonTree.nodes != null)
            {
                foreach (var jsonNode in jsonTree.nodes)
                {
                    tree.nodes.Add(ConvertNode(jsonNode));
                }
            }

            return tree;
        }

        private static DialogueEntryPoint ConvertEntryPoint(JsonDialogueEntryPoint jsonEntry)
        {
            var entry = new DialogueEntryPoint
            {
                nodeId = jsonEntry.nodeId,
                priority = jsonEntry.priority,
                conditions = new List<DialogueCondition>()
            };

            if (jsonEntry.conditions != null)
            {
                foreach (var jsonCond in jsonEntry.conditions)
                {
                    entry.conditions.Add(ConvertCondition(jsonCond));
                }
            }

            return entry;
        }

        private static DialogueNode ConvertNode(JsonDialogueNode jsonNode)
        {
            var node = new DialogueNode
            {
                id = jsonNode.id,
                text = jsonNode.text,
                speaker = jsonNode.speaker,
                expression = jsonNode.expression,
                nextNodeId = jsonNode.nextNodeId,
                choiceDelay = jsonNode.choiceDelay,
                conditions = new List<DialogueCondition>(),
                choices = new List<DialogueOption>(),
                onEnterEffects = new List<DialogueEffect>(),
                tags = jsonNode.tags ?? new List<string>()
            };

            // Convert conditions
            if (jsonNode.conditions != null)
            {
                foreach (var jsonCond in jsonNode.conditions)
                {
                    node.conditions.Add(ConvertCondition(jsonCond));
                }
            }

            // Convert choices
            if (jsonNode.choices != null)
            {
                foreach (var jsonChoice in jsonNode.choices)
                {
                    node.choices.Add(ConvertChoice(jsonChoice));
                }
            }

            // Convert on-enter effects
            if (jsonNode.onEnterEffects != null)
            {
                foreach (var jsonEffect in jsonNode.onEnterEffects)
                {
                    node.onEnterEffects.Add(ConvertEffect(jsonEffect));
                }
            }

            return node;
        }

        private static DialogueOption ConvertChoice(JsonDialogueChoice jsonChoice)
        {
            var option = new DialogueOption
            {
                text = jsonChoice.text,
                nextNodeId = jsonChoice.nextNodeId,
                hint = jsonChoice.hint,
                conditions = new List<DialogueCondition>(),
                effects = new List<DialogueEffect>(),
                tags = jsonChoice.tags ?? new List<string>()
            };

            // Convert conditions
            if (jsonChoice.conditions != null)
            {
                foreach (var jsonCond in jsonChoice.conditions)
                {
                    option.conditions.Add(ConvertCondition(jsonCond));
                }
            }

            // Convert effects
            if (jsonChoice.effects != null)
            {
                foreach (var jsonEffect in jsonChoice.effects)
                {
                    option.effects.Add(ConvertEffect(jsonEffect));
                }
            }

            return option;
        }

        private static DialogueCondition ConvertCondition(JsonDialogueCondition jsonCond)
        {
            var condition = new DialogueCondition
            {
                target = jsonCond.target,
                value = jsonCond.value,
                stringValue = jsonCond.stringValue
            };

            // Parse condition type from string
            condition.type = ParseConditionType(jsonCond.type);

            return condition;
        }

        private static DialogueEffect ConvertEffect(JsonDialogueEffect jsonEffect)
        {
            var effect = new DialogueEffect
            {
                target = jsonEffect.target,
                value = jsonEffect.value,
                stringValue = jsonEffect.stringValue
            };

            // Parse effect type from string
            effect.type = ParseEffectType(jsonEffect.type);

            return effect;
        }

        private static ConditionType ParseConditionType(string typeString)
        {
            if (string.IsNullOrEmpty(typeString))
            {
                return ConditionType.FlagSet;
            }

            // Handle both PascalCase and snake_case
            var normalized = typeString.Replace("_", "").ToLowerInvariant();

            return normalized switch
            {
                "questactive" or "quest_active" => ConditionType.QuestActive,
                "questcomplete" or "quest_complete" => ConditionType.QuestComplete,
                "questnotstarted" or "quest_not_started" => ConditionType.QuestNotStarted,
                "hasitem" or "has_item" => ConditionType.HasItem,
                "lacksitem" or "lacks_item" => ConditionType.LacksItem,
                "reputationgte" or "reputation_gte" => ConditionType.ReputationGte,
                "reputationlte" or "reputation_lte" => ConditionType.ReputationLte,
                "goldgte" or "gold_gte" => ConditionType.GoldGte,
                "talkedto" or "talked_to" => ConditionType.TalkedTo,
                "nottalkedto" or "not_talked_to" => ConditionType.NotTalkedTo,
                "timeofday" or "time_of_day" => ConditionType.TimeOfDay,
                "flagset" or "flag_set" => ConditionType.FlagSet,
                "flagnotset" or "flag_not_set" => ConditionType.FlagNotSet,
                "firstmeeting" or "first_meeting" => ConditionType.FirstMeeting,
                "returnvisit" or "return_visit" => ConditionType.ReturnVisit,
                _ => ConditionType.FlagSet
            };
        }

        private static DialogueEffectType ParseEffectType(string typeString)
        {
            if (string.IsNullOrEmpty(typeString))
            {
                return DialogueEffectType.SetFlag;
            }

            // Handle both PascalCase and snake_case
            var normalized = typeString.Replace("_", "").ToLowerInvariant();

            return normalized switch
            {
                "startquest" or "start_quest" => DialogueEffectType.StartQuest,
                "completequest" or "complete_quest" => DialogueEffectType.CompleteQuest,
                "advancequest" or "advance_quest" => DialogueEffectType.AdvanceQuest,
                "giveitem" or "give_item" => DialogueEffectType.GiveItem,
                "takeitem" or "take_item" => DialogueEffectType.TakeItem,
                "givegold" or "give_gold" => DialogueEffectType.GiveGold,
                "takegold" or "take_gold" => DialogueEffectType.TakeGold,
                "changereputation" or "change_reputation" => DialogueEffectType.ChangeReputation,
                "setflag" or "set_flag" => DialogueEffectType.SetFlag,
                "clearflag" or "clear_flag" => DialogueEffectType.ClearFlag,
                "unlocklocation" or "unlock_location" => DialogueEffectType.UnlockLocation,
                "changenpcstate" or "change_npc_state" => DialogueEffectType.ChangeNpcState,
                "triggerevent" or "trigger_event" => DialogueEffectType.TriggerEvent,
                "openshop" or "open_shop" => DialogueEffectType.OpenShop,
                _ => DialogueEffectType.SetFlag
            };
        }
    }
}

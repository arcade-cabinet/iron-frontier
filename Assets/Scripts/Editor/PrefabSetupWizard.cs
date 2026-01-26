// =============================================================================
// PrefabSetupWizard.cs - Editor Tool for Creating Prefabs
// Iron Frontier - Unity 6
// =============================================================================

#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.AI;
using TMPro;
using IronFrontier.Player;
using IronFrontier.AI;
using IronFrontier.UI;
using IronFrontier.VFX;

namespace IronFrontier.Editor
{
    /// <summary>
    /// Editor wizard for creating game prefabs with proper component setup.
    /// </summary>
    public class PrefabSetupWizard : EditorWindow
    {
        private const string PREFAB_ROOT = "Assets/Resources/Prefabs";

        [MenuItem("Iron Frontier/Prefab Setup Wizard")]
        public static void ShowWindow()
        {
            GetWindow<PrefabSetupWizard>("Prefab Setup Wizard");
        }

        private void OnGUI()
        {
            GUILayout.Label("Iron Frontier Prefab Setup", EditorStyles.boldLabel);
            EditorGUILayout.Space();

            GUILayout.Label("Character Prefabs", EditorStyles.boldLabel);

            if (GUILayout.Button("Create Player Prefab"))
            {
                CreatePlayerPrefab();
            }

            if (GUILayout.Button("Create NPC Prefab"))
            {
                CreateNPCPrefab();
            }

            EditorGUILayout.Space();
            GUILayout.Label("UI Prefabs", EditorStyles.boldLabel);

            if (GUILayout.Button("Create Damage Popup Prefab"))
            {
                CreateDamagePopupPrefab();
            }

            if (GUILayout.Button("Create Interaction Prompt Prefab"))
            {
                CreateInteractionPromptPrefab();
            }

            if (GUILayout.Button("Create Quest Marker Prefab"))
            {
                CreateQuestMarkerPrefab();
            }

            if (GUILayout.Button("Create Name Plate Prefab"))
            {
                CreateNamePlatePrefab();
            }

            EditorGUILayout.Space();
            GUILayout.Label("VFX Prefabs", EditorStyles.boldLabel);

            if (GUILayout.Button("Create Hit Effect Prefab"))
            {
                CreateHitEffectPrefab();
            }

            if (GUILayout.Button("Create Level Up Effect Prefab"))
            {
                CreateLevelUpEffectPrefab();
            }

            if (GUILayout.Button("Create Dust Cloud Prefab"))
            {
                CreateDustCloudPrefab();
            }

            EditorGUILayout.Space();
            GUILayout.Label("Batch Operations", EditorStyles.boldLabel);

            if (GUILayout.Button("Create All Prefabs"))
            {
                CreateAllPrefabs();
            }

            if (GUILayout.Button("Create Prefab Directories"))
            {
                CreatePrefabDirectories();
            }
        }

        #region Directory Setup

        private static void CreatePrefabDirectories()
        {
            string[] directories = new string[]
            {
                $"{PREFAB_ROOT}/Characters",
                $"{PREFAB_ROOT}/UI",
                $"{PREFAB_ROOT}/VFX",
                $"{PREFAB_ROOT}/Props",
                $"{PREFAB_ROOT}/Environment",
                $"{PREFAB_ROOT}/Combat"
            };

            foreach (var dir in directories)
            {
                if (!Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                    Debug.Log($"Created directory: {dir}");
                }
            }

            AssetDatabase.Refresh();
            Debug.Log("Prefab directories created successfully.");
        }

        private static void EnsureDirectoryExists(string path)
        {
            string dir = Path.GetDirectoryName(path);
            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }
        }

        #endregion

        #region Character Prefabs

        private static void CreatePlayerPrefab()
        {
            string path = $"{PREFAB_ROOT}/Characters/PlayerPrefab.prefab";
            EnsureDirectoryExists(path);

            // Create root object
            GameObject root = new GameObject("PlayerPrefab");

            // Add CharacterController
            CharacterController cc = root.AddComponent<CharacterController>();
            cc.height = 1.8f;
            cc.radius = 0.3f;
            cc.center = new Vector3(0f, 0.9f, 0f);

            // Add PlayerController
            root.AddComponent<PlayerController>();

            // Add Animator
            Animator animator = root.AddComponent<Animator>();

            // Create Model child (placeholder)
            GameObject model = new GameObject("Model");
            model.transform.SetParent(root.transform);
            model.transform.localPosition = Vector3.zero;

            // Add capsule as placeholder mesh
            GameObject capsule = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            capsule.name = "Placeholder";
            capsule.transform.SetParent(model.transform);
            capsule.transform.localPosition = new Vector3(0f, 0.9f, 0f);
            Object.DestroyImmediate(capsule.GetComponent<CapsuleCollider>());

            // Create Interaction Trigger
            GameObject trigger = new GameObject("InteractionTrigger");
            trigger.transform.SetParent(root.transform);
            trigger.transform.localPosition = new Vector3(0f, 1f, 0.5f);

            SphereCollider triggerCollider = trigger.AddComponent<SphereCollider>();
            triggerCollider.isTrigger = true;
            triggerCollider.radius = 1.5f;

            trigger.AddComponent<InteractionTrigger>();

            // Save prefab
            PrefabUtility.SaveAsPrefabAsset(root, path);
            Object.DestroyImmediate(root);

            Debug.Log($"Created Player prefab at: {path}");
        }

        private static void CreateNPCPrefab()
        {
            string path = $"{PREFAB_ROOT}/Characters/NPCPrefab.prefab";
            EnsureDirectoryExists(path);

            // Create root object
            GameObject root = new GameObject("NPCPrefab");

            // Add NavMeshAgent
            NavMeshAgent agent = root.AddComponent<NavMeshAgent>();
            agent.speed = 3.5f;
            agent.angularSpeed = 360f;
            agent.acceleration = 8f;
            agent.stoppingDistance = 0.5f;

            // Add AI components
            root.AddComponent<AIController>();
            root.AddComponent<NPCBehavior>();
            root.AddComponent<PerceptionSystem>();

            // Add Animator
            Animator animator = root.AddComponent<Animator>();

            // Add Capsule Collider
            CapsuleCollider collider = root.AddComponent<CapsuleCollider>();
            collider.height = 1.8f;
            collider.radius = 0.3f;
            collider.center = new Vector3(0f, 0.9f, 0f);

            // Create Model child (placeholder)
            GameObject model = new GameObject("Model");
            model.transform.SetParent(root.transform);
            model.transform.localPosition = Vector3.zero;

            // Add capsule as placeholder mesh
            GameObject capsule = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            capsule.name = "Placeholder";
            capsule.transform.SetParent(model.transform);
            capsule.transform.localPosition = new Vector3(0f, 0.9f, 0f);
            Object.DestroyImmediate(capsule.GetComponent<CapsuleCollider>());

            // Create Interaction Trigger
            GameObject trigger = new GameObject("InteractionTrigger");
            trigger.transform.SetParent(root.transform);
            trigger.transform.localPosition = Vector3.zero;

            SphereCollider triggerCollider = trigger.AddComponent<SphereCollider>();
            triggerCollider.isTrigger = true;
            triggerCollider.radius = 2f;
            trigger.tag = "Interactable";

            // Create Name Plate Anchor
            GameObject namePlateAnchor = new GameObject("NamePlateAnchor");
            namePlateAnchor.transform.SetParent(root.transform);
            namePlateAnchor.transform.localPosition = new Vector3(0f, 2.5f, 0f);

            // Save prefab
            PrefabUtility.SaveAsPrefabAsset(root, path);
            Object.DestroyImmediate(root);

            Debug.Log($"Created NPC prefab at: {path}");
        }

        #endregion

        #region UI Prefabs

        private static void CreateDamagePopupPrefab()
        {
            string path = $"{PREFAB_ROOT}/UI/DamagePopup.prefab";
            EnsureDirectoryExists(path);

            GameObject root = new GameObject("DamagePopup");

            // Add TextMeshPro
            TextMeshPro tmp = root.AddComponent<TextMeshPro>();
            tmp.fontSize = 36;
            tmp.fontStyle = FontStyles.Bold;
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.color = Color.white;
            tmp.text = "100";

            // Add DamagePopup component
            root.AddComponent<DamagePopup>();

            // Save prefab
            PrefabUtility.SaveAsPrefabAsset(root, path);
            Object.DestroyImmediate(root);

            Debug.Log($"Created Damage Popup prefab at: {path}");
        }

        private static void CreateInteractionPromptPrefab()
        {
            string path = $"{PREFAB_ROOT}/UI/InteractionPrompt.prefab";
            EnsureDirectoryExists(path);

            GameObject root = new GameObject("InteractionPrompt");

            // Add TextMeshPro
            TextMeshPro tmp = root.AddComponent<TextMeshPro>();
            tmp.fontSize = 24;
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.color = Color.white;
            tmp.text = "Press E to Interact";

            // Add InteractionPrompt component
            root.AddComponent<InteractionPrompt>();

            // Save prefab
            PrefabUtility.SaveAsPrefabAsset(root, path);
            Object.DestroyImmediate(root);

            Debug.Log($"Created Interaction Prompt prefab at: {path}");
        }

        private static void CreateQuestMarkerPrefab()
        {
            string path = $"{PREFAB_ROOT}/UI/QuestMarker.prefab";
            EnsureDirectoryExists(path);

            GameObject root = new GameObject("QuestMarker");

            // Create icon
            GameObject icon = new GameObject("Icon");
            icon.transform.SetParent(root.transform);
            icon.transform.localPosition = Vector3.zero;

            SpriteRenderer sr = icon.AddComponent<SpriteRenderer>();
            sr.color = new Color(1f, 0.84f, 0f); // Gold

            // Create distance text
            GameObject distanceObj = new GameObject("DistanceText");
            distanceObj.transform.SetParent(root.transform);
            distanceObj.transform.localPosition = new Vector3(0f, -0.5f, 0f);

            TextMeshPro distanceText = distanceObj.AddComponent<TextMeshPro>();
            distanceText.fontSize = 18;
            distanceText.alignment = TextAlignmentOptions.Center;
            distanceText.color = Color.white;
            distanceText.text = "0m";

            // Add QuestMarker component
            root.AddComponent<QuestMarker>();

            // Save prefab
            PrefabUtility.SaveAsPrefabAsset(root, path);
            Object.DestroyImmediate(root);

            Debug.Log($"Created Quest Marker prefab at: {path}");
        }

        private static void CreateNamePlatePrefab()
        {
            string path = $"{PREFAB_ROOT}/UI/NamePlate.prefab";
            EnsureDirectoryExists(path);

            GameObject root = new GameObject("NamePlate");

            // Create name text
            GameObject nameObj = new GameObject("NameText");
            nameObj.transform.SetParent(root.transform);
            nameObj.transform.localPosition = Vector3.zero;

            TextMeshPro nameText = nameObj.AddComponent<TextMeshPro>();
            nameText.fontSize = 24;
            nameText.fontStyle = FontStyles.Bold;
            nameText.alignment = TextAlignmentOptions.Center;
            nameText.color = Color.white;
            nameText.text = "NPC Name";

            // Create title text
            GameObject titleObj = new GameObject("TitleText");
            titleObj.transform.SetParent(root.transform);
            titleObj.transform.localPosition = new Vector3(0f, -0.3f, 0f);

            TextMeshPro titleText = titleObj.AddComponent<TextMeshPro>();
            titleText.fontSize = 16;
            titleText.alignment = TextAlignmentOptions.Center;
            titleText.color = new Color(0.8f, 0.8f, 0.8f);
            titleText.text = "<Title>";
            titleObj.SetActive(false);

            // Create health bar background
            GameObject healthBg = new GameObject("HealthBarBg");
            healthBg.transform.SetParent(root.transform);
            healthBg.transform.localPosition = new Vector3(0f, -0.5f, 0f);
            healthBg.transform.localScale = new Vector3(1f, 0.1f, 1f);

            SpriteRenderer bgSr = healthBg.AddComponent<SpriteRenderer>();
            bgSr.color = new Color(0.2f, 0.2f, 0.2f, 0.8f);

            // Create health bar fill
            GameObject healthFill = new GameObject("HealthBarFill");
            healthFill.transform.SetParent(root.transform);
            healthFill.transform.localPosition = new Vector3(0f, -0.5f, -0.01f);
            healthFill.transform.localScale = new Vector3(1f, 0.1f, 1f);

            SpriteRenderer fillSr = healthFill.AddComponent<SpriteRenderer>();
            fillSr.color = new Color(0f, 0.8f, 0f);

            // Add NamePlate component
            root.AddComponent<NamePlate>();

            // Save prefab
            PrefabUtility.SaveAsPrefabAsset(root, path);
            Object.DestroyImmediate(root);

            Debug.Log($"Created Name Plate prefab at: {path}");
        }

        #endregion

        #region VFX Prefabs

        private static void CreateHitEffectPrefab()
        {
            string path = $"{PREFAB_ROOT}/VFX/HitEffect.prefab";
            EnsureDirectoryExists(path);

            GameObject root = new GameObject("HitEffect");

            // Add main particle system
            ParticleSystem ps = root.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.duration = 0.5f;
            main.loop = false;
            main.startLifetime = 0.3f;
            main.startSpeed = 5f;
            main.startSize = 0.2f;
            main.startColor = Color.white;
            main.maxParticles = 20;

            var emission = ps.emission;
            emission.rateOverTime = 0;
            emission.SetBursts(new ParticleSystem.Burst[] { new ParticleSystem.Burst(0f, 15) });

            var shape = ps.shape;
            shape.shapeType = ParticleSystemShapeType.Sphere;
            shape.radius = 0.1f;

            // Add HitEffect component
            root.AddComponent<HitEffect>();

            // Add AudioSource
            root.AddComponent<AudioSource>();

            // Save prefab
            PrefabUtility.SaveAsPrefabAsset(root, path);
            Object.DestroyImmediate(root);

            Debug.Log($"Created Hit Effect prefab at: {path}");
        }

        private static void CreateLevelUpEffectPrefab()
        {
            string path = $"{PREFAB_ROOT}/VFX/LevelUpEffect.prefab";
            EnsureDirectoryExists(path);

            GameObject root = new GameObject("LevelUpEffect");

            // Add main particle system (column of light)
            ParticleSystem ps = root.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.duration = 3f;
            main.loop = false;
            main.startLifetime = 2f;
            main.startSpeed = 3f;
            main.startSize = 0.3f;
            main.startColor = new Color(1f, 0.9f, 0.4f);
            main.maxParticles = 100;

            var emission = ps.emission;
            emission.rateOverTime = 30;

            var shape = ps.shape;
            shape.shapeType = ParticleSystemShapeType.Cone;
            shape.angle = 5f;
            shape.radius = 0.5f;

            // Add light
            GameObject lightObj = new GameObject("Light");
            lightObj.transform.SetParent(root.transform);
            lightObj.transform.localPosition = new Vector3(0f, 1f, 0f);

            Light light = lightObj.AddComponent<Light>();
            light.type = LightType.Point;
            light.color = new Color(1f, 0.9f, 0.4f);
            light.intensity = 0f;
            light.range = 5f;

            // Add level text
            GameObject textObj = new GameObject("LevelText");
            textObj.transform.SetParent(root.transform);
            textObj.transform.localPosition = new Vector3(0f, 2f, 0f);

            TextMeshPro tmp = textObj.AddComponent<TextMeshPro>();
            tmp.fontSize = 48;
            tmp.fontStyle = FontStyles.Bold;
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.color = new Color(1f, 0.84f, 0f);
            tmp.text = "LEVEL UP!";

            // Add LevelUpEffect component
            root.AddComponent<LevelUpEffect>();

            // Add AudioSource
            root.AddComponent<AudioSource>();

            // Save prefab
            PrefabUtility.SaveAsPrefabAsset(root, path);
            Object.DestroyImmediate(root);

            Debug.Log($"Created Level Up Effect prefab at: {path}");
        }

        private static void CreateDustCloudPrefab()
        {
            string path = $"{PREFAB_ROOT}/VFX/DustCloud.prefab";
            EnsureDirectoryExists(path);

            GameObject root = new GameObject("DustCloud");

            // Add particle system
            ParticleSystem ps = root.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.duration = 1f;
            main.loop = false;
            main.startLifetime = 0.8f;
            main.startSpeed = 1f;
            main.startSize = 0.5f;
            main.startColor = new Color(0.6f, 0.5f, 0.4f, 0.5f);
            main.maxParticles = 30;
            main.simulationSpace = ParticleSystemSimulationSpace.World;

            var emission = ps.emission;
            emission.rateOverTime = 0;
            emission.SetBursts(new ParticleSystem.Burst[] { new ParticleSystem.Burst(0f, 10) });

            var shape = ps.shape;
            shape.shapeType = ParticleSystemShapeType.Hemisphere;
            shape.radius = 0.3f;

            var sizeOverLifetime = ps.sizeOverLifetime;
            sizeOverLifetime.enabled = true;
            sizeOverLifetime.size = new ParticleSystem.MinMaxCurve(1f, AnimationCurve.Linear(0f, 1f, 1f, 2f));

            var colorOverLifetime = ps.colorOverLifetime;
            colorOverLifetime.enabled = true;
            Gradient gradient = new Gradient();
            gradient.SetKeys(
                new GradientColorKey[] {
                    new GradientColorKey(Color.white, 0f),
                    new GradientColorKey(Color.white, 1f)
                },
                new GradientAlphaKey[] {
                    new GradientAlphaKey(0.5f, 0f),
                    new GradientAlphaKey(0f, 1f)
                }
            );
            colorOverLifetime.color = gradient;

            // Add DustCloud component
            root.AddComponent<DustCloud>();

            // Add AudioSource
            root.AddComponent<AudioSource>();

            // Save prefab
            PrefabUtility.SaveAsPrefabAsset(root, path);
            Object.DestroyImmediate(root);

            Debug.Log($"Created Dust Cloud prefab at: {path}");
        }

        #endregion

        #region Batch Operations

        private static void CreateAllPrefabs()
        {
            CreatePrefabDirectories();

            // Characters
            CreatePlayerPrefab();
            CreateNPCPrefab();

            // UI
            CreateDamagePopupPrefab();
            CreateInteractionPromptPrefab();
            CreateQuestMarkerPrefab();
            CreateNamePlatePrefab();

            // VFX
            CreateHitEffectPrefab();
            CreateLevelUpEffectPrefab();
            CreateDustCloudPrefab();

            AssetDatabase.Refresh();
            Debug.Log("All prefabs created successfully!");
        }

        #endregion
    }
}
#endif

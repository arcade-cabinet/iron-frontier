using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;
using System;
using System.IO;
using System.Linq;

namespace IronFrontier.Editor
{
    /// <summary>
    /// Build automation script for headless CI/CD builds.
    /// Usage: Unity -batchmode -quit -projectPath . -executeMethod IronFrontier.Editor.BuildScript.BuildiOS -logFile -
    /// </summary>
    public static class BuildScript
    {
        private static readonly string[] GameScenes = new[]
        {
            "Assets/Scenes/MainMenu.unity",
            "Assets/Scenes/Loading.unity",
            "Assets/Scenes/Overworld.unity",
            "Assets/Scenes/Town.unity",
            "Assets/Scenes/Combat.unity"
        };

        private static string GetBuildPath(string platform)
        {
            string buildDir = Path.Combine(Application.dataPath, "..", "Builds", platform);
            Directory.CreateDirectory(buildDir);
            return buildDir;
        }

        [MenuItem("Build/Build iOS (Development)")]
        public static void BuildiOS()
        {
            BuildiOSInternal(false);
        }

        [MenuItem("Build/Build iOS (Release)")]
        public static void BuildiOSRelease()
        {
            BuildiOSInternal(true);
        }

        private static void BuildiOSInternal(bool isRelease)
        {
            Debug.Log($"[BuildScript] Starting iOS build (Release: {isRelease})");

            string buildPath = Path.Combine(GetBuildPath("iOS"), "IronFrontier");

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = GetValidScenes(),
                locationPathName = buildPath,
                target = BuildTarget.iOS,
                options = isRelease
                    ? BuildOptions.None
                    : BuildOptions.Development | BuildOptions.AllowDebugging
            };

            // Set iOS-specific settings
            PlayerSettings.iOS.appleEnableAutomaticSigning = true;
            PlayerSettings.iOS.appleDeveloperTeamID = System.Environment.GetEnvironmentVariable("APPLE_TEAM_ID") ?? "";
            PlayerSettings.iOS.targetDevice = iOSTargetDevice.iPhoneAndiPad;
            PlayerSettings.iOS.targetOSVersionString = "15.0";
            // Enable simulator support for development builds
            PlayerSettings.iOS.sdkVersion = isRelease ? iOSSdkVersion.DeviceSDK : iOSSdkVersion.SimulatorSDK;

            Build(options);
        }

        [MenuItem("Build/Build Android (Development)")]
        public static void BuildAndroid()
        {
            BuildAndroidInternal(false);
        }

        [MenuItem("Build/Build Android (Release)")]
        public static void BuildAndroidRelease()
        {
            BuildAndroidInternal(true);
        }

        private static void BuildAndroidInternal(bool isRelease)
        {
            Debug.Log($"[BuildScript] Starting Android build (Release: {isRelease})");

            string buildPath = Path.Combine(GetBuildPath("Android"), "IronFrontier.apk");

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = GetValidScenes(),
                locationPathName = buildPath,
                target = BuildTarget.Android,
                options = isRelease
                    ? BuildOptions.None
                    : BuildOptions.Development | BuildOptions.AllowDebugging
            };

            // Set Android-specific settings
            PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel26;
            PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevel34;

            Build(options);
        }

        [MenuItem("Build/Build WebGL (Development)")]
        public static void BuildWebGL()
        {
            BuildWebGLInternal(false);
        }

        [MenuItem("Build/Build WebGL (Release)")]
        public static void BuildWebGLRelease()
        {
            BuildWebGLInternal(true);
        }

        private static void BuildWebGLInternal(bool isRelease)
        {
            Debug.Log($"[BuildScript] Starting WebGL build (Release: {isRelease})");

            string buildPath = Path.Combine(GetBuildPath("WebGL"), "IronFrontier");

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = GetValidScenes(),
                locationPathName = buildPath,
                target = BuildTarget.WebGL,
                options = isRelease
                    ? BuildOptions.None
                    : BuildOptions.Development | BuildOptions.AllowDebugging
            };

            Build(options);
        }

        [MenuItem("Build/Build macOS (Development)")]
        public static void BuildMacOS()
        {
            Debug.Log("[BuildScript] Starting macOS build");

            string buildPath = Path.Combine(GetBuildPath("macOS"), "IronFrontier.app");

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = GetValidScenes(),
                locationPathName = buildPath,
                target = BuildTarget.StandaloneOSX,
                options = BuildOptions.Development | BuildOptions.AllowDebugging
            };

            Build(options);
        }

        private static string[] GetValidScenes()
        {
            // Filter to only scenes that exist
            var validScenes = GameScenes
                .Where(scene => File.Exists(Path.Combine(Application.dataPath, "..", scene)))
                .ToArray();

            if (validScenes.Length == 0)
            {
                Debug.LogError("[BuildScript] No valid scenes found! Using default scenes from build settings.");
                return EditorBuildSettings.scenes
                    .Where(s => s.enabled)
                    .Select(s => s.path)
                    .ToArray();
            }

            Debug.Log($"[BuildScript] Building with {validScenes.Length} scenes: {string.Join(", ", validScenes)}");
            return validScenes;
        }

        private static void Build(BuildPlayerOptions options)
        {
            Debug.Log($"[BuildScript] Building to: {options.locationPathName}");
            Debug.Log($"[BuildScript] Target: {options.target}");
            Debug.Log($"[BuildScript] Options: {options.options}");

            BuildReport report = BuildPipeline.BuildPlayer(options);
            BuildSummary summary = report.summary;

            if (summary.result == BuildResult.Succeeded)
            {
                Debug.Log($"[BuildScript] Build succeeded: {summary.totalSize} bytes");
                Debug.Log($"[BuildScript] Build time: {summary.totalTime}");
                Debug.Log($"[BuildScript] Output: {summary.outputPath}");

                // Exit with success code for CI
                if (Application.isBatchMode)
                {
                    EditorApplication.Exit(0);
                }
            }
            else
            {
                Debug.LogError($"[BuildScript] Build failed: {summary.result}");

                foreach (var step in report.steps)
                {
                    foreach (var message in step.messages)
                    {
                        if (message.type == LogType.Error || message.type == LogType.Exception)
                        {
                            Debug.LogError($"[BuildScript] {message.content}");
                        }
                    }
                }

                // Exit with error code for CI
                if (Application.isBatchMode)
                {
                    EditorApplication.Exit(1);
                }
            }
        }
    }
}

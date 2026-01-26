/**
 * R3FCanvas - Main React Three Fiber Canvas Component
 *
 * Provides the core 3D rendering canvas with:
 * - WebGL/WebGPU detection and fallback
 * - Proper React Suspense boundaries
 * - Performance-optimized defaults
 * - Resize handling
 * - Debug mode with stats
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Stats, Preload, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import {
  ACESFilmicToneMapping,
  LinearToneMapping,
  PCFSoftShadowMap,
  BasicShadowMap,
  VSMShadowMap,
  Color,
  Fog,
} from 'three';

import type { RootState } from '@react-three/fiber';
import type {
  R3FCanvasProps,
  SceneConfig,
  CameraConfig,
  PerformanceConfig,
  RendererInfo,
  RendererCapabilities,
  RendererType,
} from './types';

import {
  DEFAULT_SCENE_CONFIG,
  DEFAULT_CAMERA_CONFIG,
  DEFAULT_PERFORMANCE_CONFIG,
} from './types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect WebGPU support in the browser
 */
async function detectWebGPU(): Promise<boolean> {
  if (!('gpu' in navigator)) {
    return false;
  }
  try {
    const adapter = await (navigator as Navigator & { gpu: { requestAdapter: () => Promise<unknown> } }).gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

/**
 * Get renderer capabilities from the WebGL context
 */
function getRendererCapabilities(gl: WebGLRenderingContext | WebGL2RenderingContext): RendererCapabilities {
  const isWebGL2 = 'WebGL2RenderingContext' in window && gl instanceof WebGL2RenderingContext;
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

  return {
    type: 'webgl' as RendererType,
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxAnisotropy: (() => {
      const ext = gl.getExtension('EXT_texture_filter_anisotropic');
      return ext ? gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
    })(),
    supportsFloatTextures: isWebGL2 || gl.getExtension('OES_texture_float') !== null,
    supportsCompressedTextures: gl.getExtension('WEBGL_compressed_texture_s3tc') !== null,
    supportsInstancing: isWebGL2 || gl.getExtension('ANGLE_instanced_arrays') !== null,
    supportsShadowMaps: true,
  };
}

// ============================================================================
// SHADOW MAP TYPE MAPPING
// ============================================================================

const SHADOW_MAP_TYPES = {
  basic: BasicShadowMap,
  soft: PCFSoftShadowMap,
  vsm: VSMShadowMap,
} as const;

// ============================================================================
// SCENE SETUP COMPONENT
// ============================================================================

interface SceneSetupProps {
  sceneConfig: SceneConfig;
  onReady?: (state: RootState) => void;
  onRendererInfo?: (info: RendererInfo) => void;
}

function SceneSetup({ sceneConfig, onReady, onRendererInfo }: SceneSetupProps) {
  const state = useThree();
  const { gl, scene, camera } = state;
  const hasCalledReady = useRef(false);

  // Configure renderer and scene on mount
  useEffect(() => {
    // Configure tone mapping
    if (sceneConfig.toneMapping) {
      gl.toneMapping = ACESFilmicToneMapping;
      gl.toneMappingExposure = sceneConfig.exposure;
    } else {
      gl.toneMapping = LinearToneMapping;
    }

    // Configure shadows
    gl.shadowMap.enabled = sceneConfig.shadows;
    gl.shadowMap.type = SHADOW_MAP_TYPES[sceneConfig.shadowType];

    // Configure background
    if (sceneConfig.background !== null) {
      scene.background = new Color(sceneConfig.background);
    } else {
      scene.background = null;
    }

    // Configure fog
    if (sceneConfig.fog && sceneConfig.fogConfig) {
      scene.fog = new Fog(
        sceneConfig.fogConfig.color as number,
        sceneConfig.fogConfig.near,
        sceneConfig.fogConfig.far
      );
    } else {
      scene.fog = null;
    }

    // Configure environment intensity (Three.js r155+)
    if ('environmentIntensity' in scene) {
      (scene as typeof scene & { environmentIntensity: number }).environmentIntensity =
        sceneConfig.environmentIntensity;
    }
  }, [gl, scene, sceneConfig]);

  // Report renderer info and call onReady
  useEffect(() => {
    if (hasCalledReady.current) return;

    const context = gl.getContext();
    if (context) {
      const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
      const capabilities = getRendererCapabilities(context);

      const info: RendererInfo = {
        renderer: 'webgl',
        vendor: debugInfo
          ? context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
          : 'Unknown',
        version: context.getParameter(context.VERSION),
        capabilities,
      };

      onRendererInfo?.(info);
    }

    onReady?.(state);
    hasCalledReady.current = true;
  }, [gl, state, onReady, onRendererInfo]);

  return null;
}

// ============================================================================
// PERFORMANCE MONITOR COMPONENT
// ============================================================================

interface PerformanceMonitorProps {
  config: PerformanceConfig;
  onWarning?: (fps: number, drawCalls: number) => void;
}

function PerformanceMonitor({ config, onWarning }: PerformanceMonitorProps) {
  const { gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const lastWarning = useRef(0);

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    const elapsed = now - lastTime.current;

    // Check performance every second
    if (elapsed >= 1000) {
      const fps = (frameCount.current * 1000) / elapsed;
      const drawCalls = gl.info.render.calls;

      // Warn if FPS drops below 80% of target or draw calls exceed limit
      const shouldWarn =
        fps < config.targetFps * 0.8 || drawCalls > config.maxDrawCalls;

      if (shouldWarn && now - lastWarning.current > 5000) {
        onWarning?.(fps, drawCalls);
        lastWarning.current = now;
      }

      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return null;
}

// ============================================================================
// LOADING FALLBACK COMPONENT
// ============================================================================

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#666666" wireframe />
    </mesh>
  );
}

// ============================================================================
// MAIN R3F CANVAS COMPONENT
// ============================================================================

export function R3FCanvas({
  sceneConfig: sceneConfigOverrides,
  cameraConfig: cameraConfigOverrides,
  performanceConfig: performanceConfigOverrides,
  debug = false,
  forceRenderer,
  onReady,
  onRendererInfo,
  onPerformanceWarning,
  children,
  className,
  style,
}: R3FCanvasProps) {
  const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Merge configs with defaults
  const sceneConfig = useMemo<SceneConfig>(
    () => ({ ...DEFAULT_SCENE_CONFIG, ...sceneConfigOverrides }),
    [sceneConfigOverrides]
  );

  const cameraConfig = useMemo<CameraConfig>(
    () => ({ ...DEFAULT_CAMERA_CONFIG, ...cameraConfigOverrides }) as CameraConfig,
    [cameraConfigOverrides]
  );

  const performanceConfig = useMemo<PerformanceConfig>(
    () => ({ ...DEFAULT_PERFORMANCE_CONFIG, ...performanceConfigOverrides }),
    [performanceConfigOverrides]
  );

  // Detect WebGPU support on mount
  useEffect(() => {
    if (forceRenderer) {
      setWebGPUSupported(forceRenderer === 'webgpu');
      return;
    }

    detectWebGPU().then(setWebGPUSupported);
  }, [forceRenderer]);

  // Compute pixel ratio
  const pixelRatio = useMemo(() => {
    if (sceneConfig.pixelRatio === 'auto') {
      // Clamp device pixel ratio to avoid performance issues on high-DPI displays
      return Math.min(window.devicePixelRatio, 2);
    }
    return sceneConfig.pixelRatio;
  }, [sceneConfig.pixelRatio]);

  // Camera props based on config type
  const cameraProps = useMemo(() => {
    const baseProps = {
      near: cameraConfig.near,
      far: cameraConfig.far,
      position: cameraConfig.position as [number, number, number],
    };

    if (cameraConfig.type === 'perspective') {
      return {
        ...baseProps,
        fov: cameraConfig.fov,
      };
    } else {
      return {
        ...baseProps,
        zoom: cameraConfig.zoom,
        orthographic: true,
      };
    }
  }, [cameraConfig]);

  // Handle resize
  const handleCreated = useCallback(
    (state: RootState) => {
      // Set initial camera look-at
      state.camera.lookAt(...cameraConfig.lookAt);
    },
    [cameraConfig.lookAt]
  );

  // Don't render until we've detected GPU capabilities
  if (webGPUSupported === null) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          color: '#666',
          ...style,
        }}
      >
        Initializing renderer...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      <Canvas
        shadows={sceneConfig.shadows}
        dpr={pixelRatio}
        camera={cameraProps}
        gl={{
          antialias: sceneConfig.antialias,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          alpha: sceneConfig.background === null,
        }}
        onCreated={handleCreated}
        // Enable R3F's performance optimizations
        performance={{
          min: 0.5,
          max: 1,
          debounce: 200,
        }}
        // Ensure proper resize handling
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
      >
        {/* Scene configuration */}
        <SceneSetup
          sceneConfig={sceneConfig}
          onReady={onReady}
          onRendererInfo={onRendererInfo}
        />

        {/* Performance monitoring */}
        {onPerformanceWarning && (
          <PerformanceMonitor
            config={performanceConfig}
            onWarning={onPerformanceWarning}
          />
        )}

        {/* Adaptive optimizations */}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        {/* Preload assets */}
        <Preload all />

        {/* Debug stats overlay */}
        {debug && <Stats />}

        {/* Scene content with Suspense boundary */}
        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
      </Canvas>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default R3FCanvas;

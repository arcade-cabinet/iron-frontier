import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color4, Color3 } from '@babylonjs/core/Maths/math.color';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { HDRCubeTexture } from '@babylonjs/core/Materials/Textures/hdrCubeTexture';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline';
import { DynamicTerrain } from '../../engine/extensions/babylon.dynamicTerrain_modular';
import { Atmosphere } from '@babylonjs/addons/atmosphere';
import { RandomEffector, MatrixCloner } from 'bp-cloner';
import { createNoise2D } from 'simplex-noise';

import '@babylonjs/loaders/glTF';

@Component({
  selector: 'app-lookdev',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lookdev.page.html',
  styleUrls: ['./lookdev.page.scss'],
})
export class LookdevPage implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private engine: Engine | null = null;
  private scene: Scene | null = null;
  private terrain: DynamicTerrain | null = null;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.engine = new Engine(this.canvasRef.nativeElement, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });
      this.scene = this.createScene(this.engine);

      this.engine.runRenderLoop(() => {
        this.scene?.render();
      });

      window.addEventListener('resize', this.handleResize);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.scene?.dispose();
    this.engine?.dispose();
    this.scene = null;
    this.engine = null;
  }

  private handleResize = () => {
    this.engine?.resize();
  };

  private createScene(engine: Engine): Scene {
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.02, 0.02, 0.03, 1);
    scene.fogMode = Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.0028;
    scene.fogColor = new Color3(0.08, 0.07, 0.06);

    const camera = new ArcRotateCamera(
      'lookdev-camera',
      -Math.PI / 2,
      Math.PI / 3.2,
      55,
      new Vector3(0, 5, 0),
      scene,
    );
    camera.attachControl(this.canvasRef.nativeElement, true);
    camera.lowerRadiusLimit = 24;
    camera.upperRadiusLimit = 90;
    camera.wheelPrecision = 40;
    camera.panningSensibility = 60;

    const sun = new DirectionalLight('sun', new Vector3(-0.4, -1, -0.2), scene);
    sun.position = new Vector3(35, 60, 20);
    sun.intensity = 2.8;

    const skyFill = new HemisphericLight('skyFill', new Vector3(0, 1, 0), scene);
    skyFill.intensity = 0.45;
    skyFill.diffuse = new Color3(0.6, 0.55, 0.5);
    skyFill.groundColor = new Color3(0.2, 0.17, 0.14);

    const shadowGenerator = new ShadowGenerator(2048, sun);
    shadowGenerator.bias = 0.00015;
    shadowGenerator.normalBias = 0.02;
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    const hdrTexture = new HDRCubeTexture(
      '/assets/lookdev/ambientcg/DayEnvironmentHDRI008_1K_HDR.exr',
      scene,
      256,
      false,
      true,
      false,
    );
    scene.environmentTexture = hdrTexture;
    scene.environmentIntensity = 1.1;
    scene.createDefaultSkybox(hdrTexture, true, 220, 0.18);

    const pipeline = new DefaultRenderingPipeline('lookdev-pipeline', true, scene, [camera]);
    pipeline.samples = 4;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.toneMappingType = 1;
    pipeline.imageProcessing.exposure = 1.05;
    pipeline.fxaaEnabled = true;

    if (Atmosphere.IsSupported(engine)) {
      const atmosphere = new Atmosphere('lookdev-atmosphere', scene, [sun]);
      atmosphere.exposure = 1.1;
      atmosphere.multiScatteringIntensity = 0.9;
    }

    this.createDynamicTerrain(scene, camera, shadowGenerator);
    void this.loadWesternTown(scene, shadowGenerator);
    void this.scatterProps(scene);
    void this.loadSetDressing(scene, shadowGenerator);
    void this.loadHeroCharacter(scene, shadowGenerator);

    return scene;
  }

  private createDynamicTerrain(scene: Scene, camera: ArcRotateCamera, shadowGenerator: ShadowGenerator): void {
    const mapSubX = 160;
    const mapSubZ = 160;
    const mapData = new Float32Array((mapSubX + 1) * (mapSubZ + 1) * 3);

    const noise2D = createNoise2D();
    const scale = 0.03;

    for (let z = 0; z <= mapSubZ; z += 1) {
      for (let x = 0; x <= mapSubX; x += 1) {
        const idx = 3 * (x + z * (mapSubX + 1));
        const nx = x * scale;
        const nz = z * scale;
        const height = noise2D(nx, nz) * 1.6 + noise2D(nx * 2.4, nz * 2.4) * 0.45;
        mapData[idx] = x - mapSubX / 2;
        mapData[idx + 1] = height;
        mapData[idx + 2] = z - mapSubZ / 2;
      }
    }

    const terrain = new DynamicTerrain(
      'lookdev-terrain',
      {
        mapData,
        mapSubX,
        mapSubZ,
        terrainSub: 120,
        camera,
      },
      scene,
    );

    const groundMaterial = new PBRMaterial('terrain-pbr', scene);
    const albedo = new Texture('/assets/lookdev/ambientcg/Ground037_1K-JPG_Color.jpg', scene);
    albedo.uScale = 6;
    albedo.vScale = 6;
    const normal = new Texture('/assets/lookdev/ambientcg/Ground037_1K-JPG_NormalGL.jpg', scene);
    normal.uScale = 6;
    normal.vScale = 6;
    groundMaterial.albedoTexture = albedo;
    groundMaterial.bumpTexture = normal;
    groundMaterial.metallic = 0.0;
    groundMaterial.roughness = 1.0;
    groundMaterial.environmentIntensity = 1.2;

    // Roughness texture application is deferred; keep a constant roughness for stability.

    terrain.mesh.material = groundMaterial;
    terrain.mesh.receiveShadows = true;

    const groundPlane = MeshBuilder.CreateGround('ground-decal-plane', { width: 200, height: 200 }, scene);
    groundPlane.position.y = -0.15;
    groundPlane.isVisible = false;

    shadowGenerator.addShadowCaster(terrain.mesh);
    this.terrain = terrain;
  }

  private getTerrainHeight(x: number, z: number): number {
    if (!this.terrain) return 0;
    return this.terrain.getHeightFromMap(x, z);
  }

  private async loadWesternTown(scene: Scene, shadowGenerator: ShadowGenerator): Promise<void> {
    const result = await SceneLoader.ImportMeshAsync('', '/assets/models/western/', 'western-town-optimized.glb', scene);
    const rootNode = result.meshes[0];
    const meshes = result.meshes.filter((mesh) => mesh.getClassName() === 'Mesh');
    if (meshes.length === 0) return;

    const bounds = rootNode.getHierarchyBoundingVectors(true);
    const center = bounds.min.add(bounds.max).scale(0.5);
    const minY = bounds.min.y;
    const groundHeight = this.getTerrainHeight(0, 0);
    const yShift = groundHeight - minY;

    rootNode.position = new Vector3(-center.x, yShift, -center.z);

    meshes.forEach((mesh) => {
      mesh.receiveShadows = true;
      shadowGenerator.addShadowCaster(mesh as any);
    });
  }

  private async loadSetDressing(scene: Scene, shadowGenerator: ShadowGenerator): Promise<void> {
    await this.placeProp(scene, shadowGenerator, '/assets/models/structures/', 'watertower.glb', new Vector3(-18, 0, -12), 1.15, -0.2);
    await this.placeProp(scene, shadowGenerator, '/assets/models/structures/', 'well.glb', new Vector3(6, 0, 8), 1.2, 0.1);
    await this.placeProp(scene, shadowGenerator, '/assets/models/vehicles/', 'westerncart.glb', new Vector3(-4, 0, 14), 1.1, 1.4);
    await this.placeProp(scene, shadowGenerator, '/assets/models/structures/', 'postsign.glb', new Vector3(9, 0, -6), 1.0, 0.3);
    await this.placeProp(scene, shadowGenerator, '/assets/models/structures/', 'fence.glb', new Vector3(16, 0, 10), 1.4, -0.4);
    await this.placeProp(scene, shadowGenerator, '/assets/models/containers/', 'westernbarrel.glb', new Vector3(-6, 0, 6), 1.4, 0.2);
    await this.placeProp(scene, shadowGenerator, '/assets/models/containers/', 'crate.glb', new Vector3(-8, 0, 7.5), 1.3, -0.2);
  }

  private async placeProp(
    scene: Scene,
    shadowGenerator: ShadowGenerator,
    root: string,
    file: string,
    position: Vector3,
    scale: number,
    rotationY: number,
  ): Promise<void> {
    const result = await SceneLoader.ImportMeshAsync('', root, file, scene);
    const rootNode = result.meshes[0];
    const meshes = result.meshes.filter((mesh) => mesh.getClassName() === 'Mesh');
    if (meshes.length === 0) return;

    const bounds = rootNode.getHierarchyBoundingVectors(true);
    const minY = bounds.min.y;
    const y = this.getTerrainHeight(position.x, position.z) - minY;
    rootNode.position = new Vector3(position.x, y, position.z);
    rootNode.rotation.y = rotationY;
    rootNode.scaling.setAll(scale);
    meshes.forEach((mesh) => {
      mesh.receiveShadows = true;
      shadowGenerator.addShadowCaster(mesh as any);
    });
  }

  private async scatterProps(scene: Scene): Promise<void> {
    const cactusA = await SceneLoader.ImportMeshAsync('', '/assets/models/nature/', 'cactus1.glb', scene);
    const cactusB = await SceneLoader.ImportMeshAsync('', '/assets/models/nature/', 'cactus_short.glb', scene);
    const cactusC = await SceneLoader.ImportMeshAsync('', '/assets/models/nature/', 'cactus_tall.glb', scene);
    const rock = await SceneLoader.ImportMeshAsync('', '/assets/models/nature/', 'rock_largeA.glb', scene);
    const stump = await SceneLoader.ImportMeshAsync('', '/assets/models/nature/', 'stump.glb', scene);

    const sources = [
      cactusA.meshes.find((mesh) => mesh.name !== '__root__'),
      cactusB.meshes.find((mesh) => mesh.name !== '__root__'),
      cactusC.meshes.find((mesh) => mesh.name !== '__root__'),
      rock.meshes.find((mesh) => mesh.name !== '__root__'),
      stump.meshes.find((mesh) => mesh.name !== '__root__'),
    ].filter(Boolean) as any[];

    if (sources.length === 0) return;

    sources.forEach((mesh) => mesh.setEnabled(false));

    const cloner = new MatrixCloner(sources, scene, {
      mcount: { x: 9, y: 1, z: 9 },
      size: { x: 34, y: 1, z: 34 },
    });

    cloner.root!.position = new Vector3(8, 0.1, 10);

    const random = new RandomEffector();
    random.strength = 1;
    random.position = { x: 2, y: 0.3, z: 2 };
    random.rotation = { x: 0, y: 360, z: 0 };
    random.scale = { x: 0.45, y: 0.45, z: 0.45 };
    cloner.addEffector(random, 1);
  }

  private async loadHeroCharacter(scene: Scene, shadowGenerator: ShadowGenerator): Promise<void> {
    const hero = await SceneLoader.ImportMeshAsync('', '/assets/models/characters/', 'man_adventurer.gltf', scene);
    const root = hero.meshes[0];
    root.name = 'hero-character';
    const bounds = root.getHierarchyBoundingVectors(true);
    const minY = bounds.min.y;
    const y = this.getTerrainHeight(2, 6) - minY;
    root.position = new Vector3(2, y, 6);
    root.scaling.setAll(1.4);

    hero.meshes.forEach((mesh) => {
      if (mesh.getClassName() === 'Mesh') {
        mesh.receiveShadows = true;
        shadowGenerator.addShadowCaster(mesh as any);
      }
    });
  }
}

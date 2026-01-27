import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from '@babylonjs/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class GamePage implements AfterViewInit, OnDestroy {
  @ViewChild('renderCanvas', { static: true })
  private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

  private engine?: Engine;
  private scene?: Scene;
  private readonly handleResize = () => this.engine?.resize();

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const engine = new Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });
      const scene = new Scene(engine);
      scene.clearColor = new Color4(0.05, 0.05, 0.07, 1);

      const camera = new ArcRotateCamera(
        'camera',
        Math.PI / 2,
        Math.PI / 3,
        8,
        Vector3.Zero(),
        scene,
      );
      camera.attachControl(canvas, true);
      camera.lowerRadiusLimit = 3;
      camera.upperRadiusLimit = 25;

      new HemisphericLight('light', new Vector3(0, 1, 0), scene);
      MeshBuilder.CreateGround('ground', { width: 10, height: 10 }, scene);

      engine.runRenderLoop(() => scene.render());
      window.addEventListener('resize', this.handleResize);

      this.engine = engine;
      this.scene = scene;
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.scene?.dispose();
    this.engine?.dispose();
  }
}

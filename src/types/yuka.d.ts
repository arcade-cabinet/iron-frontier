declare module 'yuka' {
  export class EntityManager {
    add(entity: any): this;
    update(delta: number): this;
  }

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    distanceTo(vector: Vector3): number;
  }

  export class Path {
    loop: boolean;
    clear(): this;
    add(waypoint: Vector3): this;
    current(): Vector3;
    finished(): boolean;
    advance(): this;
  }

  export class FollowPathBehavior {
    path: Path;
    nextWaypointDistance: number;
    constructor(path?: Path, nextWaypointDistance?: number);
  }

  export class ArriveBehavior {}

  export class Vehicle {
    position: Vector3;
    velocity: Vector3;
    maxSpeed: number;
    maxForce: number;
    steering: { add: (behavior: any) => any; clear: () => any };
    setRenderComponent(renderComponent: any, callback: any): this;
  }
}

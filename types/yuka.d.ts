declare module 'yuka' {
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    multiplyScalar(s: number): this;
    distanceTo(v: Vector3): number;
    squaredDistanceTo(v: Vector3): number;
    length(): number;
    normalize(): this;
    clone(): Vector3;
  }

  export class GameEntity {
    name: string;
    active: boolean;
    position: Vector3;
    rotation: Quaternion;
    boundingRadius: number;
    maxTurnRate: number;
    canActivateTrigger: boolean;
    uuid: string;
    update(delta: number): this;
  }

  export class MovingEntity extends GameEntity {
    velocity: Vector3;
    maxSpeed: number;
    mass: number;
  }

  export class Vehicle extends MovingEntity {
    maxForce: number;
    steering: SteeringManager;
    smoother: Smoother | null;
    constructor();
    update(delta: number): this;
    setRenderComponent(renderComponent: unknown, callback: unknown): this;
  }

  export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
  }

  export class SteeringManager {
    add(behavior: SteeringBehavior): this;
    remove(behavior: SteeringBehavior): this;
    clear(): this;
  }

  export class SteeringBehavior {
    active: boolean;
    weight: number;
  }

  export class SeekBehavior extends SteeringBehavior {
    target: Vector3;
    constructor(target?: Vector3);
  }

  export class FleeBehavior extends SteeringBehavior {
    target: Vector3;
    panicDistance: number;
    constructor(target?: Vector3, panicDistance?: number);
  }

  export class ArriveBehavior extends SteeringBehavior {
    target: Vector3;
    deceleration: number;
    tolerance: number;
    constructor(target?: Vector3, deceleration?: number, tolerance?: number);
  }

  export class EvadeBehavior extends SteeringBehavior {
    pursuer: MovingEntity | null;
    panicDistance: number;
    predictionFactor: number;
    constructor(pursuer?: MovingEntity, panicDistance?: number, predictionFactor?: number);
  }

  export class WanderBehavior extends SteeringBehavior {
    radius: number;
    distance: number;
    jitter: number;
    constructor(radius?: number, distance?: number, jitter?: number);
  }

  export class FollowPathBehavior extends SteeringBehavior {
    path: Path;
    nextWaypointDistance: number;
    constructor(path?: Path, nextWaypointDistance?: number);
  }

  export class PursuitBehavior extends SteeringBehavior {
    evader: MovingEntity | null;
    constructor(evader?: MovingEntity);
  }

  export class ObstacleAvoidanceBehavior extends SteeringBehavior {
    brakingWeight: number;
    dBoxMinLength: number;
    constructor();
  }

  export class EntityManager {
    entities: GameEntity[];
    add(entity: GameEntity): this;
    remove(entity: GameEntity): this;
    clear(): this;
    update(delta: number): this;
  }

  export class Path {
    loop: boolean;
    add(point: Vector3): this;
    clear(): this;
    advance(): this;
    current(): Vector3;
    finished(): boolean;
  }

  export class Smoother {
    constructor(count: number);
  }

  export class Time {
    update(): this;
    getDelta(): number;
    getElapsed(): number;
  }

  export class StateMachine {
    owner: GameEntity;
    constructor(owner: GameEntity);
    currentState: State | null;
    globalState: State | null;
    previousState: State | null;
    changeTo(state: State): this;
    revert(): this;
    update(): this;
  }

  export class State {
    enter(owner: GameEntity): void;
    execute(owner: GameEntity): void;
    exit(owner: GameEntity): void;
  }
}

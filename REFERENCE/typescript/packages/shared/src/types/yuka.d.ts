/**
 * Type declarations for YukaJS
 *
 * Yuka is a JavaScript library for developing Game AI.
 * These declarations cover the main classes used in Iron Frontier.
 *
 * @see https://mugen87.github.io/yuka/docs/
 */

declare module 'yuka' {
  // ============================================================================
  // Math
  // ============================================================================

  export class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x?: number, y?: number, z?: number);

    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    clone(): Vector3;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    multiplyScalar(s: number): this;
    divideScalar(s: number): this;
    normalize(): this;
    length(): number;
    lengthSq(): number;
    distanceTo(v: Vector3): number;
    distanceToSquared(v: Vector3): number;
    dot(v: Vector3): number;
    cross(v: Vector3): this;
    equals(v: Vector3): boolean;
    applyMatrix4(m: Matrix4): this;
    applyQuaternion(q: Quaternion): this;
  }

  export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x?: number, y?: number, z?: number, w?: number);

    set(x: number, y: number, z: number, w: number): this;
    copy(q: Quaternion): this;
    clone(): Quaternion;
    multiply(q: Quaternion): this;
    normalize(): this;
    slerp(q: Quaternion, t: number): this;
  }

  export class Matrix4 {
    elements: Float32Array;

    constructor();

    set(...elements: number[]): this;
    identity(): this;
    copy(m: Matrix4): this;
    clone(): Matrix4;
    multiply(m: Matrix4): this;
    extractRotation(m: Matrix4): this;
    lookAt(eye: Vector3, target: Vector3, up: Vector3): this;
    compose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
    decompose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
  }

  // ============================================================================
  // Core
  // ============================================================================

  export class Time {
    static now(): number;
    getDelta(): number;
    getElapsed(): number;
    update(): this;
  }

  export interface GameEntityOptions {
    name?: string;
    active?: boolean;
  }

  export class GameEntity {
    name: string;
    active: boolean;
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    forward: Vector3;
    up: Vector3;
    boundingRadius: number;
    manager: EntityManager | null;

    constructor();

    start(): this;
    update(delta: number): this;
    dispose(): this;
    lookAt(target: Vector3): this;
    getDirection(result: Vector3): Vector3;
    rotateTo(target: Vector3, t: number, tolerance?: number): boolean;
    sendMessage(
      receiver: GameEntity,
      message: string,
      delay?: number,
      data?: any
    ): this;
    handleMessage(telegram: Telegram): boolean;
    toJSON(): object;
    fromJSON(json: object): this;
    resolveReferences(entities: Map<string, GameEntity>): this;
  }

  export class MovingEntity extends GameEntity {
    velocity: Vector3;
    maxSpeed: number;

    constructor();

    getSpeed(): number;
    getSpeedSquared(): number;
  }

  export class EntityManager {
    entities: GameEntity[];

    constructor();

    add(entity: GameEntity): this;
    remove(entity: GameEntity): this;
    clear(): this;
    update(delta: number): this;
    sendMessage(
      sender: GameEntity,
      receiver: GameEntity,
      message: string,
      delay?: number,
      data?: any
    ): this;
  }

  export class Telegram {
    sender: GameEntity;
    receiver: GameEntity;
    message: string;
    delay: number;
    data: any;
  }

  // ============================================================================
  // Steering
  // ============================================================================

  export class Vehicle extends MovingEntity {
    mass: number;
    maxForce: number;
    steering: SteeringManager;
    smoother: Smoother | null;

    constructor();

    update(delta: number): this;
  }

  export class SteeringManager {
    vehicle: Vehicle;
    behaviors: SteeringBehavior[];

    constructor(vehicle: Vehicle);

    add(behavior: SteeringBehavior): this;
    remove(behavior: SteeringBehavior): this;
    clear(): this;
    calculate(delta: number, optionalTarget?: Vector3): Vector3;
  }

  export class SteeringBehavior {
    active: boolean;
    weight: number;

    constructor();

    calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3;
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

  export class PursuitBehavior extends SteeringBehavior {
    evader: Vehicle | null;
    predictionFactor: number;

    constructor(evader?: Vehicle | null, predictionFactor?: number);
  }

  export class EvadeBehavior extends SteeringBehavior {
    pursuer: Vehicle | null;
    predictionFactor: number;
    panicDistance: number;

    constructor(
      pursuer?: Vehicle | null,
      predictionFactor?: number,
      panicDistance?: number
    );
  }

  export class WanderBehavior extends SteeringBehavior {
    radius: number;
    distance: number;
    jitter: number;

    constructor(radius?: number, distance?: number, jitter?: number);
  }

  export class FollowPathBehavior extends SteeringBehavior {
    path: Path | null;
    nextWaypointDistance: number;

    constructor(path?: Path | null, nextWaypointDistance?: number);
  }

  export class AlignmentBehavior extends SteeringBehavior {
    constructor();
  }

  export class CohesionBehavior extends SteeringBehavior {
    constructor();
  }

  export class SeparationBehavior extends SteeringBehavior {
    constructor();
  }

  export class ObstacleAvoidanceBehavior extends SteeringBehavior {
    obstacles: GameEntity[];
    dBoxMinLength: number;
    brakingWeight: number;

    constructor(obstacles?: GameEntity[]);
  }

  export class InterposeBehavior extends SteeringBehavior {
    entity1: Vehicle | null;
    entity2: Vehicle | null;
    deceleration: number;

    constructor(
      entity1?: Vehicle | null,
      entity2?: Vehicle | null,
      deceleration?: number
    );
  }

  export class OffsetPursuitBehavior extends SteeringBehavior {
    leader: Vehicle | null;
    offset: Vector3;

    constructor(leader?: Vehicle | null, offset?: Vector3);
  }

  export class Path {
    loop: boolean;

    constructor();

    add(point: Vector3): this;
    clear(): this;
    current(): Vector3;
    advance(): this;
    finished(): boolean;
  }

  export class Smoother {
    count: number;
    history: Vector3[];

    constructor(count?: number);

    calculate(value: Vector3, average?: Vector3): Vector3;
  }

  // ============================================================================
  // Finite State Machine
  // ============================================================================

  export class State<T> {
    name: string;

    constructor();

    enter(entity: T): void;
    execute(entity: T, delta?: number): void;
    exit(entity: T): void;
  }

  export class StateMachine<T> {
    owner: T;
    currentState: State<T> | null;
    previousState: State<T> | null;
    globalState: State<T> | null;
    states: Map<string, State<T>>;

    constructor(owner: T);

    add(name: string, state: State<T>): this;
    remove(name: string): this;
    get(name: string): State<T> | undefined;
    changeTo(name: string): this;
    revertToPreviousState(): this;
    in(name: string): boolean;
    update(delta: number): this;
    handleMessage(telegram: Telegram): boolean;
  }

  // ============================================================================
  // Goal-Driven Agent Behavior
  // ============================================================================

  export class Goal<T> {
    owner: T | null;
    status: string;

    constructor(owner?: T | null);

    activate(): void;
    execute(): void;
    terminate(): void;
    handleMessage(telegram: Telegram): boolean;
    active(): boolean;
    inactive(): boolean;
    completed(): boolean;
    failed(): boolean;
  }

  export class CompositeGoal<T> extends Goal<T> {
    subgoals: Goal<T>[];

    constructor(owner?: T | null);

    addSubgoal(goal: Goal<T>): this;
    clearSubgoals(): this;
    currentSubgoal(): Goal<T> | null;
    executeSubgoals(): string;
    hasSubgoals(): boolean;
  }

  export class GoalEvaluator<T> {
    characterBias: number;

    constructor(characterBias?: number);

    calculateDesirability(owner: T): number;
    setGoal(owner: T): void;
  }

  export class Think<T> extends CompositeGoal<T> {
    evaluators: GoalEvaluator<T>[];

    constructor(owner?: T | null);

    addEvaluator(evaluator: GoalEvaluator<T>): this;
    removeEvaluator(evaluator: GoalEvaluator<T>): this;
    arbitrate(): this;
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  export class NavMesh {
    regions: Polygon[];
    graph: Graph;

    constructor();

    fromPolygons(polygons: Polygon[]): this;
    getClosestRegion(point: Vector3): Polygon | null;
    getRandomRegion(): Polygon | null;
    clampMovement(
      currentRegion: Polygon,
      startPosition: Vector3,
      endPosition: Vector3,
      clampPosition: Vector3
    ): Polygon;
    findPath(from: Vector3, to: Vector3): Vector3[];
    clear(): this;
  }

  export class Polygon {
    vertices: Vector3[];
    plane: Plane;
    centroid: Vector3;

    constructor();

    fromContour(vertices: Vector3[]): this;
    contains(point: Vector3, epsilon?: number): boolean;
  }

  export class Plane {
    normal: Vector3;
    constant: number;

    constructor(normal?: Vector3, constant?: number);

    set(normal: Vector3, constant: number): this;
    fromNormalAndCoplanarPoint(normal: Vector3, point: Vector3): this;
    distanceToPoint(point: Vector3): number;
    projectPoint(point: Vector3, result: Vector3): Vector3;
  }

  // ============================================================================
  // Graph
  // ============================================================================

  export class Graph {
    nodes: Map<number, Node>;
    edges: Map<number, Edge[]>;
    digraph: boolean;

    constructor();

    addNode(node: Node): this;
    addEdge(edge: Edge): this;
    getNode(index: number): Node | undefined;
    getEdgesOfNode(index: number): Edge[];
    getNodeCount(): number;
    getEdgeCount(): number;
    clear(): this;
  }

  export class Node {
    index: number;

    constructor(index?: number);
  }

  export class Edge {
    from: number;
    to: number;
    cost: number;

    constructor(from?: number, to?: number, cost?: number);
  }

  export class AStar {
    graph: Graph;
    source: number;
    target: number;
    found: boolean;

    constructor(graph?: Graph, source?: number, target?: number);

    search(): this;
    getPath(): number[];
    getSearchTree(): Edge[];
    clear(): this;
  }

  // ============================================================================
  // Perception
  // ============================================================================

  export class MemorySystem {
    owner: GameEntity;
    records: MemoryRecord[];
    memorySpan: number;

    constructor(owner?: GameEntity);

    getValidMemoryRecords(currentTime: number): MemoryRecord[];
    createRecord(entity: GameEntity): MemoryRecord;
    getRecord(entity: GameEntity): MemoryRecord | null;
    hasRecord(entity: GameEntity): boolean;
    deleteRecord(entity: GameEntity): this;
    clear(): this;
  }

  export class MemoryRecord {
    entity: GameEntity | null;
    timeBecameVisible: number;
    timeLastSensed: number;
    lastSensedPosition: Vector3;
    visible: boolean;

    constructor(entity?: GameEntity | null);
  }

  export class Vision {
    owner: GameEntity;
    fieldOfView: number;
    range: number;
    obstacles: GameEntity[];

    constructor(owner?: GameEntity);

    addObstacle(obstacle: GameEntity): this;
    removeObstacle(obstacle: GameEntity): this;
    visible(target: Vector3): boolean;
  }

  // ============================================================================
  // Partitioning
  // ============================================================================

  export class CellSpacePartitioning {
    cells: Cell[];
    width: number;
    height: number;
    depth: number;
    cellsX: number;
    cellsY: number;
    cellsZ: number;

    constructor(
      width: number,
      height: number,
      depth: number,
      cellsX: number,
      cellsY: number,
      cellsZ: number
    );

    addEntity(entity: GameEntity): this;
    updateEntity(entity: GameEntity): this;
    removeEntity(entity: GameEntity): this;
    makeEmpty(): this;
    query(
      position: Vector3,
      radius: number,
      result: GameEntity[]
    ): GameEntity[];
  }

  export class Cell {
    aabb: AABB;
    entries: GameEntity[];

    constructor(aabb?: AABB);

    add(entry: GameEntity): this;
    remove(entry: GameEntity): this;
    makeEmpty(): this;
  }

  export class AABB {
    min: Vector3;
    max: Vector3;

    constructor(min?: Vector3, max?: Vector3);

    set(min: Vector3, max: Vector3): this;
    fromCenterAndSize(center: Vector3, size: Vector3): this;
    containsPoint(point: Vector3): boolean;
    intersectsAABB(aabb: AABB): boolean;
    intersectsSphere(center: Vector3, radius: number): boolean;
  }

  // ============================================================================
  // Triggers
  // ============================================================================

  export class TriggerRegion {
    constructor();

    touching(entity: GameEntity): boolean;
  }

  export class SphericalTriggerRegion extends TriggerRegion {
    position: Vector3;
    radius: number;

    constructor(position?: Vector3, radius?: number);
  }

  export class RectangularTriggerRegion extends TriggerRegion {
    size: Vector3;
    position: Vector3;

    constructor(size?: Vector3, position?: Vector3);
  }

  export class Trigger extends GameEntity {
    region: TriggerRegion;

    constructor(region?: TriggerRegion);

    check(entity: GameEntity): void;
    execute(entity: GameEntity): void;
  }
}

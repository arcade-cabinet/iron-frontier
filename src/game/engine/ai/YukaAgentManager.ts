import type { Object3D } from 'three';
import {
  ArriveBehavior,
  EntityManager,
  FollowPathBehavior,
  Path,
  Vector3 as YukaVector3,
  Vehicle,
} from 'yuka';

export interface YukaAgentConfig {
  id: string;
  position: { x: number; y: number; z: number };
  maxSpeed: number;
  renderComponent?: Object3D;
  onSync?: (entity: Vehicle, renderComponent: Object3D) => void;
}

export interface YukaPathOptions {
  loop?: boolean;
  waypointTolerance?: number;
  arrivalDistance?: number;
  onArrive?: () => void;
}

interface AgentState {
  vehicle: Vehicle;
  followPath: FollowPathBehavior;
  path: Path;
  arrivalDistance: number;
  onArrive?: () => void;
  arrived: boolean;
}

export class YukaAgentManager {
  private readonly entityManager = new EntityManager();
  private readonly agents = new Map<string, AgentState>();

  createAgent(config: YukaAgentConfig): Vehicle {
    const vehicle = new Vehicle();
    vehicle.position.set(config.position.x, config.position.y, config.position.z);
    vehicle.maxSpeed = config.maxSpeed;
    vehicle.maxForce = config.maxSpeed * 4;

    const followPath = new FollowPathBehavior(new Path(), 0.4);
    const state: AgentState = {
      vehicle,
      followPath,
      path: followPath.path,
      arrivalDistance: 0.15,
      arrived: false,
    };

    if (config.renderComponent && config.onSync) {
      vehicle.setRenderComponent(config.renderComponent, config.onSync);
    }

    vehicle.steering.add(followPath);
    this.entityManager.add(vehicle);
    this.agents.set(config.id, state);

    return vehicle;
  }

  setAgentPosition(id: string, position: { x: number; y: number; z: number }): void {
    const agent = this.agents.get(id);
    if (!agent) return;
    agent.vehicle.position.set(position.x, position.y, position.z);
  }

  setPath(id: string, waypoints: Array<{ x: number; y: number; z: number }>, options: YukaPathOptions = {}): void {
    const agent = this.agents.get(id);
    if (!agent) return;

    const { loop = false, waypointTolerance = 0.35, arrivalDistance = 0.15, onArrive } = options;

    agent.path.clear();
    for (const point of waypoints) {
      agent.path.add(new YukaVector3(point.x, point.y, point.z));
    }

    agent.path.loop = loop;
    agent.followPath.nextWaypointDistance = waypointTolerance;
    agent.arrivalDistance = arrivalDistance;
    agent.onArrive = onArrive;
    agent.arrived = false;
  }

  update(deltaSeconds: number): void {
    if (this.agents.size === 0) return;
    this.entityManager.update(deltaSeconds);

    for (const agent of this.agents.values()) {
      if (agent.arrived) {
        continue;
      }

      const target = agent.path.current();
      if (!target) {
        continue;
      }
      const distance = target.distanceTo(agent.vehicle.position);

      if (agent.path.finished() && distance <= agent.arrivalDistance) {
        agent.arrived = true;
        agent.vehicle.velocity.set(0, 0, 0);
        agent.onArrive?.();
      }
    }
  }

  getAgent(id: string): Vehicle | null {
    return this.agents.get(id)?.vehicle ?? null;
  }
}

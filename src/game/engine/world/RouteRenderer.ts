// RouteRenderer — Barrel re-export preserving the original import path.

export type { RouteSegment, RouteEndpoints } from './routeTypes';

export { buildRoute, buildAllRoutes, collectRouteFlattenZones } from './routeBuilder';

export { buildInternalRoadMesh } from './roadGeometry';

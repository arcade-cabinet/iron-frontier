// heightfieldMesh — Builds a THREE.Mesh from heightfield data for raycasting.

import * as THREE from 'three';

import type { HeightfieldCollider } from './colliderTypes';

/**
 * Build a THREE.Mesh from a HeightfieldCollider for raycasting.
 *
 * The resulting PlaneGeometry has its vertices displaced according to
 * the heightmap data and is positioned at the collider's world origin.
 */
export function buildHeightfieldMesh(hf: HeightfieldCollider): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(
    hf.width,
    hf.depth,
    hf.xSegments - 1,
    hf.zSegments - 1,
  );

  geometry.rotateX(-Math.PI / 2);

  const posAttr = geometry.getAttribute('position');
  for (let iz = 0; iz < hf.zSegments; iz++) {
    for (let ix = 0; ix < hf.xSegments; ix++) {
      const vertexIndex = iz * hf.xSegments + ix;
      if (vertexIndex < posAttr.count) {
        posAttr.setY(vertexIndex, hf.heights[vertexIndex]);
      }
    }
  }

  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const material = new THREE.MeshBasicMaterial({ visible: false });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.copy(hf.origin);
  mesh.position.x += hf.width / 2;
  mesh.position.z += hf.depth / 2;
  mesh.updateMatrixWorld(true);

  return mesh;
}

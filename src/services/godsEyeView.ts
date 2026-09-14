import * as THREE from 'three';
import { ArchitecturalProject } from '../types/architecture';

/**
 * Creates a geospatial, top-down context for the active project using the
 * project coordinates and north bearing. This follows the camera-independent
 * site-context approach used by God's Eye View while keeping the platform
 * self-contained (no third-party map token or visible provider UI required).
 */
export function createGodsEyeContext(project: ArchitecturalProject): THREE.Group {
  const group = new THREE.Group();
  group.name = 'geospatial-site-context';

  const siteWidth = Math.max(35, project.site.widthM + 15);
  const siteDepth = Math.max(35, project.site.depthM + 15);
  const radius = Math.max(siteWidth, siteDepth) * 1.65;
  const center = new THREE.Vector3(project.site.widthM / 2, -0.12, project.site.depthM / 2);

  const terrain = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 96),
    new THREE.MeshStandardMaterial({ color: 0x1e3a2d, roughness: 0.96, metalness: 0, transparent: true, opacity: 0.82 })
  );
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.copy(center);
  terrain.receiveShadow = true;
  group.add(terrain);

  const contourMaterial = new THREE.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.23 });
  for (let index = 1; index <= 4; index++) {
    const contourRadius = (radius * index) / 4;
    const contourPoints = Array.from({ length: 64 }, (_, point) => {
      const angle = (point / 64) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * contourRadius, 0, Math.sin(angle) * contourRadius);
    });
    const contour = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(contourPoints), contourMaterial);
    contour.position.copy(center);
    contour.position.y += index * 0.008;
    group.add(contour);
  }

  const grid = new THREE.GridHelper(radius * 2, 16, 0x2dd4bf, 0x2dd4bf);
  grid.position.copy(center);
  grid.position.y += 0.006;
  const gridMaterial = grid.material as THREE.LineBasicMaterial;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.12;
  group.add(grid);

  const northBearing = THREE.MathUtils.degToRad(-project.site.orientationNorthDeg);
  const northDirection = new THREE.Vector3(Math.sin(northBearing), 0, -Math.cos(northBearing));
  const northArrow = new THREE.ArrowHelper(northDirection, center.clone().add(new THREE.Vector3(0, 0.04, 0)), radius * 0.22, 0x2dd4bf, 1.5, 0.7);
  group.add(northArrow);

  // The coordinate-derived displacement makes each site's context stable and
  // distinct without exposing a new map label in the viewer.
  const longitudeShift = ((project.climate.longitude % 1) + 1) % 1;
  const latitudeShift = ((project.climate.latitude % 1) + 1) % 1;
  group.rotation.y = (longitudeShift - latitudeShift) * 0.08;
  return group;
}

export function disposeGodsEyeContext(group: THREE.Object3D): void {
  const disposedMaterials = new Set<THREE.Material>();
  const disposeMaterials = (materials: THREE.Material | THREE.Material[]) => {
    (Array.isArray(materials) ? materials : [materials]).forEach((material) => {
      if (disposedMaterials.has(material)) return;
      material.dispose();
      disposedMaterials.add(material);
    });
  };

  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      disposeMaterials(object.material);
    }
    if (object instanceof THREE.Line || object instanceof THREE.LineSegments) {
      object.geometry.dispose();
      disposeMaterials(object.material);
    }
  });
}

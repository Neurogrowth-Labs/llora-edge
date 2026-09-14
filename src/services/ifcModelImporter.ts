import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class IfcImportError extends Error {}

/** Loads an IFC through the platform's IfcOpenShell conversion endpoint into Three.js. */
export async function importIfcModel(file: File): Promise<THREE.Group> {
  if (!file.name.toLowerCase().endsWith('.ifc')) {
    throw new IfcImportError('Select an IFC file.');
  }

  const response = await fetch('/api/ifc/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name),
    },
    body: file,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new IfcImportError(payload?.error || 'Unable to import IFC model.');
  }

  const glb = await response.arrayBuffer();
  const gltf = await new GLTFLoader().parseAsync(glb, '');
  const model = gltf.scene;
  model.name = `IFC:${file.name}`;
  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  return model;
}

export function disposeImportedModel(model: THREE.Object3D): void {
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
}

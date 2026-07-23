"use client";

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import { frameStyle, sizeSpec, type FrameOptions } from "./frame-options";

export type FramedModel = { glb: string; usdz: string; cleanup: () => void };

/**
 * Builds a true-to-scale framed picture as a 3D model (meters) from a photo and
 * the chosen frame options, then exports it as GLB (Android/WebXR) and USDZ
 * (iOS Quick Look) object URLs for <model-viewer>.
 *
 * Geometry faces +Z (the viewer / room); the back sits against the wall.
 */
export async function buildFramedModel(imageUrl: string, options: FrameOptions): Promise<FramedModel> {
  const f = frameStyle(options.frame);
  const spec = sizeSpec(options.size);
  const W = spec.w; // metres, outer width
  const H = spec.h; // metres, outer height
  const fw = Math.max(0.03, Math.min(W, H) * 0.09); // moulding width
  const depth = 0.032; // 3.2 cm deep frame
  const matW = fw * 0.5; // white mat border
  const innerW = W - 2 * fw;
  const innerH = H - 2 * fw;
  const imgW = innerW - 2 * matW;
  const imgH = innerH - 2 * matW;

  // texture
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const texture = await loader.loadAsync(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [texture];
  const add = (m: THREE.Mesh) => {
    group.add(m);
    disposables.push(m.geometry, m.material as THREE.Material);
  };

  // frame moulding (4 bars)
  const woodish = options.frame === "wood" || options.frame === "walnut";
  const frameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(f.hex),
    roughness: woodish ? 0.68 : options.frame === "black" ? 0.4 : 0.5,
    metalness: 0,
  });
  const bar = (w: number, h: number, x: number, y: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), frameMat);
    mesh.position.set(x, y, 0);
    group.add(mesh);
    disposables.push(mesh.geometry);
    return mesh;
  };
  bar(W, fw, 0, H / 2 - fw / 2); // top
  bar(W, fw, 0, -(H / 2 - fw / 2)); // bottom
  bar(fw, H - 2 * fw, -(W / 2 - fw / 2), 0); // left
  bar(fw, H - 2 * fw, W / 2 - fw / 2, 0); // right
  disposables.push(frameMat);

  // white mat board (recessed)
  const matBoard = new THREE.Mesh(
    new THREE.PlaneGeometry(innerW, innerH),
    new THREE.MeshStandardMaterial({ color: 0xf7f5ef, roughness: 0.9, metalness: 0 }),
  );
  matBoard.position.z = depth / 2 - 0.008;
  add(matBoard);

  // the photo
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(imgW, imgH),
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: options.glass ? 0.28 : 0.72, // glass = subtle sheen
      metalness: 0,
    }),
  );
  photo.position.z = depth / 2 - 0.007;
  add(photo);

  // dark backing so it isn't see-through at grazing angles
  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(innerW + 0.01, innerH + 0.01, depth * 0.5),
    new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 1, metalness: 0 }),
  );
  backing.position.z = -depth * 0.2;
  add(backing);

  // export both formats
  const glbBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    new GLTFExporter().parse(
      group,
      (result) => resolve(result as ArrayBuffer),
      (err) => reject(err),
      { binary: true },
    );
  });
  const glb = URL.createObjectURL(new Blob([glbBuffer], { type: "model/gltf-binary" }));

  const usdzBytes = await new USDZExporter().parseAsync(group);
  const usdz = URL.createObjectURL(
    new Blob([usdzBytes as BlobPart], { type: "model/vnd.usdz+zip" }),
  );

  const cleanup = () => {
    URL.revokeObjectURL(glb);
    URL.revokeObjectURL(usdz);
    for (const d of disposables) d.dispose();
  };

  return { glb, usdz, cleanup };
}

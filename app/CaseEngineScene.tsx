"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import {
  Box3,
  Group,
  LinearFilter,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
  Texture,
  Vector3,
} from "three";

const MODEL_PATH = "/assets/models/DVD-14-2.glb";
const COVER_PATH = "/assets/covers/visuel_0.jpeg";
const GAMEPAD_DEADZONE = 0.14;
const overlayStyle = {
  position: "fixed",
  right: 20,
  bottom: 18,
  display: "grid",
  gap: 3,
  color: "rgba(255, 255, 255, 0.88)",
  fontSize: 13,
  lineHeight: 1.25,
  letterSpacing: 0,
  pointerEvents: "none",
  textAlign: "right",
  textShadow: "0 1px 12px rgba(0, 0, 0, 0.85)",
} as const;

function applyDeadzone(value: number) {
  const magnitude = Math.abs(value);

  if (magnitude < GAMEPAD_DEADZONE) {
    return 0;
  }

  return Math.sign(value) * ((magnitude - GAMEPAD_DEADZONE) / (1 - GAMEPAD_DEADZONE));
}

function prepareCoverTexture(texture: Texture) {
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
}

function isCoverMaterial(material: MeshStandardMaterial, mesh: Object3D) {
  const materialName = material.name.toLowerCase();
  const meshName = mesh.name.toLowerCase();

  return materialName.includes("jaquette") || materialName.includes("cover") || meshName.includes("jaquette");
}

function DvdCase() {
  const groupRef = useRef<Group>(null);
  const velocity = useRef({ x: 0, y: 0 });
  const gltf = useGLTF(MODEL_PATH);
  const coverTexture = useTexture(COVER_PATH);

  const scene = useMemo(() => {
    prepareCoverTexture(coverTexture);

    const clonedScene = gltf.scene.clone(true);

    clonedScene.traverse((object) => {
      const mesh = object as Mesh;

      if (!mesh.isMesh) {
        return;
      }

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const clonedMaterials = materials.map((material) => {
        const clonedMaterial = material.clone() as MeshStandardMaterial;

        if (isCoverMaterial(clonedMaterial, mesh)) {
          const previousMap = clonedMaterial.map;
          clonedMaterial.map = coverTexture;
          clonedMaterial.map.channel = previousMap?.channel ?? 1;
          clonedMaterial.needsUpdate = true;
        }

        return clonedMaterial;
      });

      mesh.material = Array.isArray(mesh.material) ? clonedMaterials : clonedMaterials[0];
    });

    const bounds = new Box3().setFromObject(clonedScene);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z);

    clonedScene.position.sub(center);

    if (maxAxis > 0) {
      clonedScene.scale.setScalar(3.2 / maxAxis);
    }

    return clonedScene;
  }, [coverTexture, gltf.scene]);

  useFrame((_, delta) => {
    const gamepads = navigator.getGamepads?.() ?? [];
    const gamepad = Array.from(gamepads).find(Boolean);
    const stickX = applyDeadzone(gamepad?.axes[0] ?? 0);
    const stickY = applyDeadzone(gamepad?.axes[1] ?? 0);
    const targetY = stickX * 1.8;
    const targetX = stickY * 1.2;

    velocity.current.y = MathUtils.damp(velocity.current.y, targetY, 9, delta);
    velocity.current.x = MathUtils.damp(velocity.current.x, targetX, 9, delta);

    if (groupRef.current) {
      groupRef.current.rotation.y += velocity.current.y * delta;
      groupRef.current.rotation.x = MathUtils.clamp(
        groupRef.current.rotation.x + velocity.current.x * delta,
        -0.55,
        0.55,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

type CaseEngineSceneProps = {
  onLogout?: () => void;
};

const logoutButtonStyle = {
  position: "fixed",
  top: 18,
  right: 20,
  zIndex: 2,
  border: "1px solid rgba(141, 198, 255, 0.46)",
  borderRadius: 8,
  padding: "8px 13px",
  background: "rgba(4, 8, 20, 0.62)",
  color: "rgba(255, 255, 255, 0.82)",
  cursor: "pointer",
  fontSize: 12,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  backdropFilter: "blur(14px)",
} as const;

export default function CaseEngineScene({ onLogout }: CaseEngineSceneProps) {
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#000000",
      }}
    >
      <Canvas
        camera={{ position: [0, 0.25, 5], fov: 42, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", background: "#000000" }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3.5, 4, 4]} intensity={2.1} />
        <directionalLight position={[-4, 1.5, 3]} intensity={0.65} color="#b8d7ff" />
        <Suspense fallback={null}>
          <DvdCase />
        </Suspense>
        <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} minDistance={2.2} maxDistance={8} />
      </Canvas>
      <div style={overlayStyle} aria-label="PC Cover Flow V2 Case Engine Prototype">
        <strong style={{ fontSize: 14, fontWeight: 650 }}>PC Cover Flow V2</strong>
        <span style={{ color: "rgba(255, 255, 255, 0.62)" }}>Case Engine Prototype</span>
      </div>
      {onLogout ? (
        <button type="button" onClick={onLogout} style={logoutButtonStyle}>
          Logout
        </button>
      ) : null}
    </main>
  );
}

useGLTF.preload(MODEL_PATH);
useTexture.preload(COVER_PATH);

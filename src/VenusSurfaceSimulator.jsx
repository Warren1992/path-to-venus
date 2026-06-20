import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";


function VenusTerrain() {
  const meshRef = useRef();

  const [colorMap, normalMap, roughnessMap] = useLoader(THREE.TextureLoader, [
    "/textures/venus_basecolor.jpg",
    "/textures/venus_normal.jpg",
    "/textures/venus_roughness.jpg",
  ]);

  colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;

  colorMap.repeat.set(18, 18);
  normalMap.repeat.set(18, 18);
  roughnessMap.repeat.set(18, 18);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(220, 220, 220, 220);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      const height =
        Math.sin(x * 0.03) * 1.2 +
        Math.cos(z * 0.025) * 1.0 +
        Math.sin((x + z) * 0.015) * 2.4 +
        Math.random() * 0.12;

      pos.setY(i, height);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
  
function Rock({ position, scale }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#3f321f" roughness={1} />
    </mesh>
  );
}

function VenusRocks() {
  const rocks = useMemo(() => {
    return Array.from({ length: 85 }, (_, i) => {
      const x = (Math.random() - 0.5) * 190;
      const z = (Math.random() - 0.5) * 190;
      const s = 0.5 + Math.random() * 2.8;
      return {
        id: i,
        position: [x, 0.7, z],
        scale: [s * 1.2, s * 0.7, s],
      };
    });
  }, []);

  return rocks.map((rock) => <Rock key={rock.id} {...rock} />);
}

function Astronaut({ positionRef }) {
  const group = useRef();
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());
  const { scene } = useGLTF("/models/Astronaut.glb");

  useEffect(() => {
    const down = (e) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e) => (keys.current[e.key.toLowerCase()] = false);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;

    const speed = 8;
    const direction = new THREE.Vector3(0, 0, 0);

    if (keys.current.w || keys.current.arrowup) direction.z -= 1;
    if (keys.current.s || keys.current.arrowdown) direction.z += 1;
    if (keys.current.a || keys.current.arrowleft) direction.x -= 1;
    if (keys.current.d || keys.current.arrowright) direction.x += 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();
      velocity.current.lerp(direction.multiplyScalar(speed), 0.18);
      group.current.rotation.y = Math.atan2(velocity.current.x, velocity.current.z);
    } else {
      velocity.current.lerp(new THREE.Vector3(0, 0, 0), 0.12);
    }

    group.current.position.x += velocity.current.x * delta;
    group.current.position.z += velocity.current.z * delta;
    group.current.position.y = 0;

    positionRef.current.copy(group.current.position);
  });

return (
  <group ref={group} position={[0, 0, 8]}>
    <primitive
      object={scene}
      scale={2.2}
      position={[0, -1.8, 0]}
      rotation={[0, Math.PI, 0]}
    />
  </group>
);
}

function CameraControls({ targetRef }) {
  const controlsRef = useRef();

  useFrame(() => {
    if (!controlsRef.current || !targetRef.current) return;
    controlsRef.current.target.lerp(
      new THREE.Vector3(
        targetRef.current.x,
        targetRef.current.y + 1,
        targetRef.current.z
      ),
      0.08
    );
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={4}
      maxDistance={45}
      maxPolarAngle={Math.PI / 2.05}
    />
  );
}

function VenusAtmosphere() {
  return (
    <>
      <color attach="background" args={["#d8a94a"]} />
        <fog attach="fog" args={["#c89b3f", 6, 45]} />

      <ambientLight intensity={1.7} color="#ffb36b" />

      <directionalLight
        position={[8, 16, 4]}
        intensity={2.4}
        color="#ffcc88"
        castShadow
      />

      <pointLight position={[-10, 8, -10]} intensity={1.8} color="#ff7a2f" />

      <mesh position={[0, 35, -60]}>
        <sphereGeometry args={[28, 32, 32]} />
        <meshBasicMaterial color="#ffc46b" transparent opacity={0.18} />
      </mesh>
    </>
  );
}

function HUD() {
  return (
    <div className="pointer-events-none absolute left-4 top-4 max-w-sm rounded-2xl border border-orange-200/20 bg-black/45 p-4 text-orange-50 shadow-2xl backdrop-blur-sm">
      <div className="text-sm uppercase tracking-[0.35em] text-orange-200/80">Path to Venus</div>
      <h1 className="mt-1 text-2xl font-bold">Venus Surface Simulator</h1>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-orange-950/40 p-2">Temp: 867°F</div>
        <div className="rounded-xl bg-orange-950/40 p-2">Pressure: 92 bar</div>
        <div className="rounded-xl bg-orange-950/40 p-2">Atmosphere: CO₂</div>
        <div className="rounded-xl bg-orange-950/40 p-2">Visibility: Low</div>
      </div>
      <p className="mt-3 text-sm text-orange-100/85">Move with WASD or arrow keys. Record cinematic footage with OBS.</p>
    </div>
  );
}

export default function VenusSurfaceSimulator() {
  const astronautPosition = useRef(new THREE.Vector3(0, 2.1, 8));

  return (
    <div className="relative mt-[100vh] h-screen w-full overflow-hidden bg-black">
      <Canvas
        shadows
        camera={{ position: [12, 8, 18], fov: 55 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight
        position={[10, 20, 10]}
        intensity={2.5}
        castShadow
        />
        <Suspense fallback={null}>
          <VenusAtmosphere />
          <VenusTerrain />
          <VenusRocks />
          <Astronaut positionRef={astronautPosition} />
          <CameraControls targetRef={astronautPosition} />
        </Suspense>
      </Canvas>
      <HUD />
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-2xl border border-orange-100/15 bg-black/40 px-4 py-3 text-sm text-orange-50/80 backdrop-blur-sm">
        Prototype footage mode • Build 001
      </div>
    </div>
  );
}

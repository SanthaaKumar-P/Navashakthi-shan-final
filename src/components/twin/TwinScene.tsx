import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function Artifact({ src, shape, spinning }: { src: string; shape: "cylinder" | "panel"; spinning: boolean }) {
  const tex = useLoader(THREE.TextureLoader, src);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.x = shape === "cylinder" ? 2 : 1;

  const group = useRef<THREE.Group>(null);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    if (spinning && group.current) group.current.rotation.y += dt * 0.5;
  });

  return (
    <group ref={group}>
      {shape === "cylinder" ? (
        <>
          <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.95, 0.75, 1.7, 64, 1, false]} />
            <meshStandardMaterial map={tex} roughness={0.45} metalness={0.12} />
          </mesh>
          <mesh castShadow position={[0, 1.02, 0]}>
            <torusGeometry args={[0.9, 0.09, 20, 64]} />
            <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh castShadow position={[0, -0.88, 0]}>
            <cylinderGeometry args={[0.78, 0.86, 0.12, 64]} />
            <meshStandardMaterial color="#3A2C22" roughness={0.6} />
          </mesh>
        </>
      ) : (
        <RoundedBox args={[1.9, 1.9, 0.22]} radius={0.09} smoothness={6} castShadow receiveShadow>
          <meshStandardMaterial map={tex} roughness={0.5} metalness={0.1} />
        </RoundedBox>
      )}
    </group>
  );
}

export default function TwinScene({
  src,
  shape = "cylinder",
  spinning = true,
}: {
  src: string;
  shape?: "cylinder" | "panel";
  spinning?: boolean;
}) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.1, 4.2], fov: 42 }}>
      <color attach="background" args={["#f6efe4"]} />
      <fog attach="fog" args={["#f6efe4", 7, 16]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Suspense fallback={null}>
        <Artifact src={src} shape={shape} spinning={spinning} />
        <Environment>
          <Lightformer intensity={2.2} position={[0, 4, 2]} scale={[8, 8, 1]} />
          <Lightformer intensity={1.1} color="#0B5D50" position={[-5, 1, -2]} rotation-y={Math.PI / 2} scale={[14, 3, 1]} />
          <Lightformer intensity={0.9} color="#C65D35" position={[5, 1, -2]} rotation-y={-Math.PI / 2} scale={[14, 3, 1]} />
        </Environment>
      </Suspense>
      <ContactShadows position={[0, -1.02, 0]} opacity={0.45} scale={9} blur={2.6} far={4} />
      <OrbitControls
        enablePan={false}
        minDistance={2.6}
        maxDistance={6.5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        makeDefault
      />
    </Canvas>
  );
}

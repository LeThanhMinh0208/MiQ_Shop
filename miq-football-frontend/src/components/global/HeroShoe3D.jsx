import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds, Environment } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';

const MODEL_URL = '/models/boot1.glb';

const BootMesh = () => {
  const { scene } = useGLTF(MODEL_URL);
  // ~45° Y rotation gives a side-facing 3/4 profile view; user can adjust if boot1.glb
  // has a different default orientation.
  return <primitive object={scene} rotation={[0, Math.PI / 4, 0]} />;
};

const HeroShoe3D = () => {
  const shouldReduce = useReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', cursor: 'grab' }}
      camera={{ position: [0, 0.4, 3.2], fov: 50 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); });
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={2.5} />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} />
      <hemisphereLight args={['#c8d8f0', '#0c0810', 0.55]} />

      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
      </Suspense>

      <Suspense fallback={null}>
        <Bounds fit clip observe damping={0} margin={1.1}>
          <BootMesh />
        </Bounds>
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={!shouldReduce}
        autoRotateSpeed={1.8}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.65}
      />
    </Canvas>
  );
};

export default HeroShoe3D;

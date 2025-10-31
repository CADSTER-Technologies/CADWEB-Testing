import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

function LoadingSpinner() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00E1FF" wireframe />
    </mesh>
  );
}

function Model3D({ modelPath }: { modelPath: string }) {
  const gltf = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={gltf.scene} scale={2} />
    </group>
  );
}

interface ModelViewerProps {
  modelPath?: string;
  title: string;
  description: string;
}

export default function ModelViewer({ 
  modelPath = '/geometries/heart.gltf',
  title,
  description 
}: ModelViewerProps) {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-navy via-graphite to-navy overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-4 text-glow-cyan">
            {title}
          </h2>
          <p className="text-lg md:text-xl font-inter text-white/70 max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        <div className="relative h-[600px] glass-morphism rounded-2xl overflow-hidden">
          <CanvasErrorBoundary>
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
              <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={1} />
              
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#00E1FF" />
              <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.5} color="#7A00FF" />
              <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

              <Suspense fallback={<LoadingSpinner />}>
                <Model3D modelPath={modelPath} />
                <Environment preset="city" />
              </Suspense>
            </Canvas>
          </CanvasErrorBoundary>

          <div className="absolute top-4 right-4 glass-morphism rounded-lg px-4 py-2">
            <p className="text-white/90 font-inter text-sm">Interactive 3D Model - Drag to rotate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              title: 'Real-time Preview',
              description: 'View your CAD models in immersive 3D before manufacturing',
            },
            {
              title: 'Format Support',
              description: 'GLB, GLTF, STEP, IGES, and all major CAD formats supported',
            },
            {
              title: 'Web Integration',
              description: 'Seamlessly embed 3D models in web applications and portals',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-morphism rounded-xl p-6 hover:neon-glow-purple transition-all"
            >
              <h3 className="text-xl font-orbitron font-bold text-cyan mb-3">{feature.title}</h3>
              <p className="text-white/70 font-inter">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

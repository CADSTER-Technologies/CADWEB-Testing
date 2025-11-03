import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Center, OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

// Loading spinner component
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
      <torusGeometry args={[1, 0.4, 16, 32]} />
      <meshStandardMaterial color="#00E1FF" wireframe />
    </mesh>
  );
}

// 3D CADSTER text component with proper 3D appearance
function CadsterText3D() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth oscillating rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      // Floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        {/* Main text */}
        <Text
          fontSize={1.8}
          maxWidth={10}
          lineHeight={1}
          letterSpacing={0.15}
          textAlign="center"
          font="/fonts/Orbitron-Bold.woff" // Try local first
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#001a1a"
        >

          CADSTER
          <meshStandardMaterial
            color="#00E1FF"
            metalness={0.9}
            roughness={0.1}
            emissive="#00E1FF"
            emissiveIntensity={0.5}
          />
        </Text>

        {/* Shadow/depth layer behind */}
        <Text
          fontSize={1.8}
          maxWidth={10}
          lineHeight={1}
          letterSpacing={0.15}
          textAlign="center"
          font="/fonts/Orbitron-Bold.woff" // Try local first
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#001a1a"
        >

          CADSTER
          <meshStandardMaterial
            color="#7A00FF"
            metalness={0.7}
            roughness={0.3}
            emissive="#7A00FF"
            emissiveIntensity={0.3}
          />
        </Text>
      </Center>
    </group>
  );
}

interface ModelViewerProps {
  title: string;
  description: string;
}

export default function ModelViewer({ title, description }: ModelViewerProps) {
  return (
    <section id="model-viewer" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow-cyan">
            {title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="aspect-video bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden shadow-2xl">
            <CanvasErrorBoundary fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 text-glow-cyan font-bold">CADSTER</div>
                  <p className="text-muted-foreground">3D visualization loading...</p>
                </div>
              </div>
            }>
              <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
                <OrbitControls
                  enableZoom={true}
                  enablePan={false}
                  minDistance={5}
                  maxDistance={12}
                  autoRotate={false}
                  enableDamping
                  dampingFactor={0.05}
                />

                {/* Lighting setup */}
                <ambientLight intensity={0.4} />
                <spotLight
                  position={[10, 10, 10]}
                  angle={0.3}
                  penumbra={1}
                  intensity={1.5}
                  castShadow
                />
                <pointLight position={[-10, -5, -10]} intensity={0.8} color="#7A00FF" />
                <pointLight position={[5, 5, 5]} intensity={0.6} color="#00E1FF" />

                <Suspense fallback={<LoadingSpinner />}>
                  <CadsterText3D />
                  <Environment preset="city" />
                </Suspense>
              </Canvas>
            </CanvasErrorBoundary>

            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                Interactive 3D Model - Drag to rotate
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-lg bg-card/30 backdrop-blur-sm border border-border/50"
            >
              <h3 className="text-xl font-semibold mb-3 text-primary">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

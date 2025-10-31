import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function CADWireframe() {
  const meshRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const vertices: number[] = [];
    const size = 3;
    const divisions = 20;

    for (let i = 0; i <= divisions; i++) {
      const t = (i / divisions) * Math.PI * 2;
      const x = Math.cos(t) * size;
      const y = Math.sin(t) * size;
      vertices.push(x, y, 2, x, y, -2);
      
      const x2 = Math.cos(t) * (size * 0.5);
      const y2 = Math.sin(t) * (size * 0.5);
      vertices.push(x2, y2, 2, x2, y2, -2);
    }

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      vertices.push(0, 0, 2, x, y, 2);
      vertices.push(0, 0, -2, x, y, -2);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geom;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      meshRef.current.rotation.y += 0.005;
    }
    if (linesRef.current) {
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      <lineSegments ref={linesRef} geometry={geometry}>
        <lineBasicMaterial color="#00E1FF" transparent opacity={0.8} />
      </lineSegments>
      
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 4, 3]} />
        <meshBasicMaterial color="#7A00FF" wireframe opacity={0.3} transparent />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[2.5, 0]} />
        <meshBasicMaterial color="#00E1FF" wireframe opacity={0.4} transparent />
      </mesh>

      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 4;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#00E1FF" />
          </mesh>
        );
      })}
    </group>
  );
}

export default function HeroSection() {
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-navy via-graphite to-navy">
      <div className="absolute inset-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00E1FF" />
          <pointLight position={[-10, -10, 10]} intensity={0.5} color="#7A00FF" />
          <CADWireframe />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/50 to-navy" />

      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-orbitron font-bold mb-6 text-glow-cyan"
          >
            Engineering the Future of{' '}
            <span className="bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
              Design Automation
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl font-inter text-white/80 mb-8 max-w-3xl mx-auto"
          >
            CAD / PLM Automation • Customization • 3D Visualization • AR / VR Solutions
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="px-8 py-4 bg-gradient-to-r from-cyan to-purple rounded-lg text-white font-inter font-semibold text-lg neon-glow-cyan hover:scale-105 transition-transform">
              Explore Solutions
            </button>
            <button className="px-8 py-4 glass-morphism rounded-lg text-white font-inter font-semibold text-lg hover:neon-glow-purple hover:scale-105 transition-all">
              Watch Demo
            </button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-cyan rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-cyan rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}

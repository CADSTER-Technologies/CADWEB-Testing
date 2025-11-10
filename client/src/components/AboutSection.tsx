import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { useIsMobile } from '../hooks/use-is-mobile';


function HolographicGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const isMobile = useIsMobile();
  // Tiny: memoized matchMedia so it tracks with viewport changes
  const tiny = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return false;
    return window.matchMedia('(max-width: 359px)').matches;
  }, [isMobile]);

  // Use tiny in particleCount selection
  const particleCount = tiny ? 350 : isMobile ? 500 : 1000;
  // Memoize the geometry so it isn't recreated every render
  const particles = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2 + Math.random() * 0.5;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [particleCount]);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.002;
    if (particlesRef.current) particlesRef.current.rotation.y -= 0.001;
  });
  return (
    <group ref={groupRef}>
      <Sphere args={[2, 32, 32]}>
        <meshBasicMaterial color="#00E1FF" wireframe opacity={0.3} transparent />
      </Sphere>

      <points ref={particlesRef} geometry={particles}>
        <pointsMaterial
          size={tiny ? 0.016 : isMobile ? 0.018 : 0.02}
          color="#00E1FF"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {!tiny &&
        [...Array(6)].map((_, i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
            <torusGeometry args={[2, 0.01, 16, 100]} />
            <meshBasicMaterial color="#7A00FF" transparent opacity={0.35} />
          </mesh>
        ))}
    </group>
  );
}

export default function AboutSection() {
  const isMobile = useIsMobile();
  return (
    <section id="about" className="relative py-20 md:py-32 bg-gradient-to-b from-navy via-graphite to-navy overflow-hidden" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6 text-glow-cyan">
              About <span className="text-purple">Cadster</span> Technologies
            </h2>
            <p className="text-lg md:text-xl font-inter text-white/80 mb-6 leading-relaxed">
              Founded in 2023, Cadster Technologies stands at the forefront of CAD/PLM automation , AI
              and digital engineering innovation. We transform complex design workflows into streamlined,
              intelligent processes.
            </p>
            <p className="text-lg md:text-xl font-inter text-white/80 mb-6 leading-relaxed">
              Our expertise spans advanced CAD customization, PLM integration, 3D visualization,
              and cutting-edge AR/VR. We empower engineering teams to push boundaries
              and accelerate innovation.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { number: '50+', label: 'Projects Delivered' },
                { number: '98%', label: 'Client Satisfaction' },
                { number: '2023', label: 'Year Founded' },
                { number: '24 / 7', label: 'Support Available' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-morphism p-4 rounded-lg text-center"
                >
                  <div className="text-3xl font-orbitron font-bold text-cyan">{stat.number}</div>
                  <div className="text-sm font-inter text-white/60 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
           className={isMobile ? 'h-[440px]' : 'h-[400px] md:h-[600px]'}
          >
            <CanvasErrorBoundary>
              <Canvas
                dpr={[1, 1.75]}
                gl={{ antialias: false, powerPreference: 'low-power' }}
                style={{ width: '100%', height: '100%' }}
                camera={{ position: [0, 0, isMobile ? 9 : 8], fov: isMobile ? 50 : 50 }}
              >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} color="#00E1FF" intensity={1} />
                <pointLight position={[-10, -10, -10]} color="#7A00FF" intensity={0.5} />
                <HolographicGlobe />
              </Canvas>
            </CanvasErrorBoundary>
          </motion.div>
        </div>
      </div>
    </section>

  );
}

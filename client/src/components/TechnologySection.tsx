import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import ImageLogo from './ImageLogo';

function FloatingTechIcons() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  const positions = [
    [3, 2, 0],
    [-3, 2, 0],
    [3, -2, 0],
    [-3, -2, 0],
    [0, 3, 0],
    [0, -3, 0],
    [2, 0, 2],
    [-2, 0, 2],
  ];


  return (
    <group ref={groupRef}>
      {positions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#00E1FF' : '#7A00FF'}
            emissive={i % 2 === 0 ? '#00E1FF' : '#7A00FF'}
            emissiveIntensity={0.5}
            wireframe
          />
        </mesh>
      ))}
      <mesh>
        <torusGeometry args={[4, 0.05, 16, 100]} />
        <meshStandardMaterial color="#00E1FF" emissive="#00E1FF" emissiveIntensity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4, 0.05, 16, 100]} />
        <meshStandardMaterial color="#7A00FF" emissive="#7A00FF" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// HD transparent PNG metadata (files in /public/logos/)
const logoMeta: Record<string, { src: string; aspect: number }> = {
  Creo: { src: '/logo/creo.png', aspect: 851 / 512 },
  SolidWorks: { src: '/logo/solidworks.png', aspect: 903 / 512 },
  AutoCAD: { src: '/logo/autocad.png', aspect: 512 / 512 },
  Revit: { src: '/logo/revit.png', aspect: 512 / 512 },
  Windchill: { src: '/logo/windchill.png', aspect: 512 / 512 },
  Inventor: { src: '/logo/inventor.png', aspect: 512 / 512 },
  Unity: { src: '/logo/unity.png', aspect: 581 / 512 },
  'Unreal Engine': { src: '/logo/unreal.png', aspect: 983 / 512 },
};

export default function TechnologySection() {
  const technologies: Array<{ name: keyof typeof logoMeta; color: string }> = [
    { name: 'Creo', color: 'from-cyan to-blue-400' },
    { name: 'SolidWorks', color: 'from-red-500 to-red-600' },
    { name: 'AutoCAD', color: 'from-red-600 to-red-700' },
    { name: 'Revit', color: 'from-blue-500 to-blue-600' },
    { name: 'Windchill', color: 'from-purple to-purple-600' },
    { name: 'Inventor', color: 'from-yellow-500 to-orange-500' },
    { name: 'Unity', color: 'from-gray-700 to-gray-900' },
    { name: 'Unreal Engine', color: 'from-cyan to-purple' },
  ];

  return (
    <section
      id="technology"
      className="relative py-20 md:py-32 bg-gradient-to-b from-navy via-graphite to-navy overflow-hidden"
    >
      <div className="absolute inset-0 opacity-30">
        <CanvasErrorBoundary>
          <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} color="#00E1FF" intensity={1} />
            <pointLight position={[-10, -10, 10]} color="#7A00FF" intensity={0.8} />
            <FloatingTechIcons />
          </Canvas>
        </CanvasErrorBoundary>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-4 text-glow-purple">
            Technology <span className="text-cyan">Stack</span>
          </h2>
          <p className="text-lg md:text-xl font-inter text-white/70 max-w-2xl mx-auto">
            Industry-leading tools and platforms we master
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 to-purple/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative glass-morphism rounded-xl p-6 flex flex-col items-center justify-center h-40 hover:neon-glow-cyan transition-all cursor-pointer">
                {/* Crisp PNG logo */}
                <ImageLogo
                  src={logoMeta[tech.name].src}
                  alt={`${tech.name} logo`}
                  height={84}
                  aspect={logoMeta[tech.name].aspect}
                />
                <h3 className="text-lg font-orbitron font-bold text-white group-hover:text-cyan transition-colors mt-2">                  {tech.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 relative"
        >
          <div className="glass-morphism rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-4">
              Continuous Innovation
            </h3>
            <p className="text-lg font-inter text-white/70 max-w-3xl mx-auto">
              We stay at the cutting edge of CAD/PLM technology, continuously expanding our
              expertise with the latest tools and methodologies to deliver future-proof solutions.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

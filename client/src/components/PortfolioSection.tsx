import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import * as THREE from 'three';

function Rotating3DCard({ index }: { index: number }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.3;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3 + index) * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime + index * 2) * 0.2;
    }
  });

  return (
    <group ref={meshRef} position={[(index - 1.5) * 2, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshStandardMaterial
          color={index === 0 ? '#00E1FF' : '#7A00FF'}
          wireframe
          opacity={0.6}
          transparent
        />
      </mesh>
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[0.8, 0.05, 16, 100]} />
        <meshStandardMaterial color="#00E1FF" emissive="#00E1FF" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export default function PortfolioSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const projects = [
    {
      title: 'Automotive Assembly Configurator',
      category: '3D Visualization',
      description: 'Interactive 3D configurator for automotive assembly line optimization with real-time collision detection.',
      tech: ['SolidWorks', 'Unity', 'WebGL'],
    },
    {
      title: 'PLM Integration Suite',
      category: 'Workflow Automation',
      description: 'Enterprise-wide PLM integration connecting Windchill with legacy CAD systems across 15 departments.',
      tech: ['Windchill', 'Creo', 'API Integration'],
    },
    {
      title: 'AR Product Visualization',
      category: 'AR/VR Solutions',
      description: 'Augmented reality product visualization app for industrial equipment with interactive annotations.',
      tech: ['Unity', 'ARCore', 'AutoCAD'],
    },
    {
      title: 'BIM Data Migration',
      category: 'Data Migration',
      description: 'Large-scale BIM data migration from legacy formats to Revit with automated quality checks.',
      tech: ['Revit', 'AutoCAD', 'Python'],
    },
  ];

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  return (
    <section id="portfolio" className="relative py-20 md:py-32 bg-gradient-to-b from-navy via-graphite to-navy overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-4 text-glow-cyan">
            Featured <span className="text-purple">Projects</span>
          </h2>
          <p className="text-lg md:text-xl font-inter text-white/70 max-w-2xl mx-auto">
            Delivering innovative solutions across industries
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-48 -mt-12">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} color="#00E1FF" intensity={1} />
              <pointLight position={[-10, -10, 10]} color="#7A00FF" intensity={0.5} />
              {[0, 1, 2, 3].map((i) => (
                <Rotating3DCard key={i} index={i} />
              ))}
            </Canvas>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100, rotateY: 45 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -100, rotateY: -45 }}
              transition={{ duration: 0.5 }}
              className="glass-morphism rounded-2xl p-8 md:p-12 min-h-[400px] relative overflow-hidden mt-32"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan/20 to-purple/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan/20 to-purple/20 rounded-full mb-4">
                  <span className="text-cyan font-inter text-sm">{projects[currentIndex].category}</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-4">
                  {projects[currentIndex].title}
                </h3>

                <p className="text-lg md:text-xl font-inter text-white/80 mb-6 max-w-3xl">
                  {projects[currentIndex].description}
                </p>

                <div className="flex flex-wrap gap-3">
                  {projects[currentIndex].tech.map((tech, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 glass-morphism rounded-lg text-white/90 font-inter text-sm border border-cyan/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevProject}
              className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center text-cyan hover:neon-glow-cyan transition-all"
            >
              <FiChevronLeft className="text-2xl" />
            </button>

            <div className="flex gap-2">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-cyan w-8 neon-glow-cyan'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextProject}
              className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center text-cyan hover:neon-glow-cyan transition-all"
            >
              <FiChevronRight className="text-2xl" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

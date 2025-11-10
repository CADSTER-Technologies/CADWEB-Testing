import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { FiSettings, FiZap, FiBox, FiEye, FiDatabase, FiCpu } from 'react-icons/fi';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

function FloatingCard3D({ isHovered }: { isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = isHovered ? Math.PI / 6 : 0;
      meshRef.current.rotation.y += isHovered ? 0.02 : 0.005;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 0.3]} />
      <meshStandardMaterial
        color="#00E1FF"
        wireframe
        opacity={isHovered ? 0.8 : 0.4}
        transparent
      />
    </mesh>
  );
}

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function ServiceCard({ icon, title, description, index }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 to-purple/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative h-full glass-morphism rounded-xl p-6 hover:neon-glow-cyan transition-all duration-300 cursor-pointer">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-30">
          <CanvasErrorBoundary>
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} color="#00E1FF" />
              <FloatingCard3D isHovered={isHovered} />
            </Canvas>
          </CanvasErrorBoundary>
        </div>

        <div className="relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan to-purple rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <div className="text-white text-2xl">{icon}</div>
          </div>

          <h3 className="text-2xl font-orbitron font-bold text-white mb-3 group-hover:text-cyan transition-colors">
            {title}
          </h3>

          <p className="text-white/70 font-inter leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const services = [
    {
      icon: <FiSettings />,
      title: 'CAD/PLM Customization',
      description: 'Tailored CAD and PLM solutions to streamline your design workflows and boost productivity.',
    },
    {
      icon: <FiZap />,
      title: 'Workflow Automation',
      description: 'Intelligent automation of repetitive tasks, reducing manual effort and accelerating delivery.',
    },
    {
      icon: <FiBox />,
      title: '3D Configurators',
      description: 'Interactive 3D product configurators enabling real-time customization and visualization.',
    },
    {
      icon: <FiEye />,
      title: 'AR/VR Visualization',
      description: 'Immersive augmented and virtual reality experiences for design review and collaboration.',
    },
    {
      icon: <FiDatabase />,
      title: 'CAD Data Migration',
      description: 'Seamless migration of legacy CAD data to modern platforms with data integrity assurance.',
    },
    {
      icon: <FiCpu />,
      title: 'AI',
      description:
        'Harness the power of AI to optimize design workflows, predict errors & automate complex tasks for smarter, faster innovation.',
    },

  ];

  return (
    <section id="services" className="relative py-20 md:py-32 bg-gradient-to-b from-navy via-graphite to-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-4 text-glow-purple">
            Our <span className="text-cyan">Services</span>
          </h2>
          <p className="text-lg md:text-xl font-inter text-white/70 max-w-2xl mx-auto">
            Comprehensive solutions for modern engineering challenges
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/*import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

function FloatingTestimonialSpheres() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 4 + Math.sin(i) * 0.5;
        const height = Math.cos(i * 2) * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              height,
              Math.sin(angle) * radius
            ]}
          >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#00E1FF' : i % 3 === 1 ? '#7A00FF' : '#FFFFFF'}
              emissive={i % 3 === 0 ? '#00E1FF' : i % 3 === 1 ? '#7A00FF' : '#FFFFFF'}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
      {[...Array(3)].map((_, i) => (
        <mesh key={`ring-${i}`} rotation={[0, (i * Math.PI) / 3, 0]}>
          <torusGeometry args={[4, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#00E1FF"
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: '',
      role: '',
      company: '',
      content: 'Cadster Technologies transformed our CAD workflow, reducing design iteration time by 60%. Their expertise in automation is unmatched.',
      rating: 5,
    },
    {
      name: '',
      role: '',
      company: '',
      content: 'The AR visualization solution they developed revolutionized our product demonstrations. Outstanding technical capability and support.',
      rating: 5,
    },
    {
      name: '',
      role: '',
      company: '',
      content: 'Professional, innovative, and reliable. The PLM integration was seamless and delivered ahead of schedule with zero downtime.',
      rating: 5,
    },
  ];

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-navy via-graphite to-navy overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <CanvasErrorBoundary>
          <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} color="#00E1FF" intensity={1} />
            <pointLight position={[-10, -10, -10]} color="#7A00FF" intensity={0.8} />
            <FloatingTestimonialSpheres />
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
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-4 text-glow-cyan">
            Client <span className="text-purple">Testimonials</span>
          </h2>
          <p className="text-lg md:text-xl font-inter text-white/70 max-w-2xl mx-auto">
            Trusted by industry leaders across India
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 to-purple/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative glass-morphism rounded-xl p-6 h-full hover:neon-glow-purple transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-white/80 font-inter mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="mt-auto">
                  <h4 className="text-white font-orbitron font-bold">{testimonial.name}</h4>
                  <p className="text-cyan text-sm font-inter">{testimonial.role}</p>
                  <p className="text-white/50 text-sm font-inter">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}*/

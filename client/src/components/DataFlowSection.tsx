import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

function DataNode({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0, 0]} scale={1.2}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial color={color} wireframe opacity={0.3} transparent />
      </mesh>
    </group>
  );
}

function DataFlow() {
  const particlesRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.Line>(null);

  const nodes = useMemo(() => [
    { position: [-4, 1, 0] as [number, number, number], color: '#00E1FF', label: 'CAD Input' },
    { position: [-2, -0.5, 0.5] as [number, number, number], color: '#7A00FF', label: 'Process' },
    { position: [0, 1.5, -0.5] as [number, number, number], color: '#00E1FF', label: 'PLM' },
    { position: [2, -0.5, 0.5] as [number, number, number], color: '#7A00FF', label: 'Automation' },
    { position: [4, 1, 0] as [number, number, number], color: '#00E1FF', label: 'Output' },
  ], []);

  const connectionPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      points.push(new THREE.Vector3(...nodes[i].position));
      points.push(new THREE.Vector3(...nodes[i + 1].position));
    }
    return points;
  }, [nodes]);

  const particleCount = 200;
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const nodeIndex = Math.floor(t * (nodes.length - 1));
      const localT = (t * (nodes.length - 1)) % 1;
      
      const start = nodes[nodeIndex].position;
      const end = nodes[Math.min(nodeIndex + 1, nodes.length - 1)].position;
      
      positions[i * 3] = start[0] + (end[0] - start[0]) * localT;
      positions[i * 3 + 1] = start[1] + (end[1] - start[1]) * localT;
      positions[i * 3 + 2] = start[2] + (end[2] - start[2]) * localT;
    }
    return positions;
  }, [nodes]);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < particleCount; i++) {
        const t = ((i / particleCount) + time * 0.1) % 1;
        const nodeIndex = Math.floor(t * (nodes.length - 1));
        const localT = (t * (nodes.length - 1)) % 1;
        
        const start = nodes[nodeIndex].position;
        const end = nodes[Math.min(nodeIndex + 1, nodes.length - 1)].position;
        
        positions[i * 3] = start[0] + (end[0] - start[0]) * localT;
        positions[i * 3 + 1] = start[1] + (end[1] - start[1]) * localT + Math.sin(time + i * 0.1) * 0.1;
        positions[i * 3 + 2] = start[2] + (end[2] - start[2]) * localT;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

  return (
    <group>
      {nodes.map((node, index) => (
        <DataNode key={index} {...node} />
      ))}
      
      {connectionPoints.map((_, index) => {
        if (index % 2 === 0 && index + 1 < connectionPoints.length) {
          return (
            <line key={index}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    ...connectionPoints[index].toArray(),
                    ...connectionPoints[index + 1].toArray()
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#00E1FF" opacity={0.3} transparent />
            </line>
          );
        }
        return null;
      })}

      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.05}
          color="#00E1FF"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export default function DataFlowSection() {
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
            Automation <span className="text-purple">Workflow</span>
          </h2>
          <p className="text-lg md:text-xl font-inter text-white/70 max-w-2xl mx-auto">
            Seamless data flow from CAD to PLM with intelligent automation
          </p>
        </motion.div>

        <div className="relative h-[500px] glass-morphism rounded-2xl overflow-hidden">
          <CanvasErrorBoundary>
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} color="#00E1FF" intensity={1} />
              <pointLight position={[-10, -10, 10]} color="#7A00FF" intensity={0.8} />
              <DataFlow />
            </Canvas>
          </CanvasErrorBoundary>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4 flex-wrap">
            {['CAD Input', 'Process', 'PLM Integration', 'Automation', 'Output'].map((label, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="px-4 py-2 glass-morphism rounded-lg"
              >
                <span className="text-white/90 font-inter text-sm">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              title: 'Real-time Processing',
              description: 'Instantaneous data transformation and validation across your entire engineering stack',
            },
            {
              title: 'Intelligent Routing',
              description: 'Smart workflow orchestration that adapts to your team\'s unique processes',
            },
            {
              title: 'End-to-End Visibility',
              description: 'Complete transparency from initial design to final manufacturing output',
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

import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import { FiX, FiMaximize, FiRefreshCw } from 'react-icons/fi';
import * as THREE from 'three';

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
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#00E1FF" wireframe />
    </mesh>
  );
}

function ARVRModel({ modelPath }: { modelPath: string }) {
  const gltf = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);

  return (
    <group ref={modelRef}>
      <primitive object={gltf.scene} scale={1.5} />
    </group>
  );
}

interface ARVRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  modelPath?: string;
}

export function ARVRModal({ isOpen, onClose, title, modelPath = '/geometries/heart.gltf' }: ARVRModalProps) {
  const [viewMode, setViewMode] = useState<'3d' | 'ar' | 'vr'>('3d');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-6xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-morphism rounded-2xl overflow-hidden h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h3 className="text-2xl font-orbitron font-bold text-white">{title}</h3>
                  <p className="text-sm text-white/70 font-inter mt-1">Interactive 3D/AR/VR Preview</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex gap-1 glass-morphism rounded-lg p-1">
                    {(['3d', 'ar', 'vr'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-4 py-2 rounded font-inter text-sm uppercase transition-all ${
                          viewMode === mode
                            ? 'bg-gradient-to-r from-cyan to-purple text-white'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={onClose}
                    className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center text-white hover:neon-glow-cyan transition-all"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              <div className="relative flex-1 bg-gradient-to-b from-navy/50 to-graphite/50">
                {viewMode === '3d' && (
                  <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                    <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={2} />
                    
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} color="#00E1FF" />
                    <spotLight position={[-10, -10, -10]} angle={0.3} penumbra={1} intensity={0.5} color="#7A00FF" />
                    <pointLight position={[0, 5, 0]} intensity={0.5} />

                    <Suspense fallback={<LoadingSpinner />}>
                      <ARVRModel modelPath={modelPath} />
                    </Suspense>

                    <gridHelper args={[10, 10, '#00E1FF', '#7A00FF']} position={[0, -2, 0]} />
                  </Canvas>
                )}

                {viewMode === 'ar' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center glass-morphism p-8 rounded-xl max-w-md">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan to-purple flex items-center justify-center">
                        <FiMaximize className="text-3xl text-white" />
                      </div>
                      <h4 className="text-2xl font-orbitron font-bold text-white mb-3">AR Preview</h4>
                      <p className="text-white/70 font-inter mb-6">
                        View this model in augmented reality using your mobile device. 
                        Scan the QR code or use the AR Quick Look feature on iOS.
                      </p>
                      <div className="glass-morphism rounded-lg p-8 mb-4">
                        <div className="w-48 h-48 mx-auto bg-white/10 rounded-lg flex items-center justify-center">
                          <span className="text-white/50 font-inter text-sm">QR Code Placeholder</span>
                        </div>
                      </div>
                      <button className="px-6 py-3 bg-gradient-to-r from-cyan to-purple rounded-lg text-white font-inter font-semibold neon-glow-cyan hover:scale-105 transition-transform">
                        Launch AR on Mobile
                      </button>
                    </div>
                  </div>
                )}

                {viewMode === 'vr' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center glass-morphism p-8 rounded-xl max-w-md">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan to-purple flex items-center justify-center">
                        <FiRefreshCw className="text-3xl text-white" />
                      </div>
                      <h4 className="text-2xl font-orbitron font-bold text-white mb-3">VR Experience</h4>
                      <p className="text-white/70 font-inter mb-6">
                        Immerse yourself in virtual reality to explore this model at scale. 
                        Connect your VR headset to begin.
                      </p>
                      <ul className="text-left text-white/70 font-inter space-y-2 mb-6">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan"></span>
                          Meta Quest / Quest 2 Compatible
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple"></span>
                          HTC Vive / Valve Index Support
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan"></span>
                          WebXR Browser Required
                        </li>
                      </ul>
                      <button className="px-6 py-3 bg-gradient-to-r from-cyan to-purple rounded-lg text-white font-inter font-semibold neon-glow-cyan hover:scale-105 transition-transform">
                        Enter VR Mode
                      </button>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 glass-morphism rounded-lg px-4 py-2">
                  <p className="text-white/90 font-inter text-sm">
                    {viewMode === '3d' && 'Drag to rotate • Scroll to zoom'}
                    {viewMode === 'ar' && 'Augmented Reality Mode'}
                    {viewMode === 'vr' && 'Virtual Reality Mode'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

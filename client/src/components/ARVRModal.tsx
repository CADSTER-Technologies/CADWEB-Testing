import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { OrbitControls, PerspectiveCamera, Center, Text3D, Environment } from '@react-three/drei';
import { FiX, FiMaximize, FiRefreshCw, FiUpload } from 'react-icons/fi';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

//
// 🔹 Loading Spinner
//
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

//
// 🔹 3D Metallic "CADSTER" Text
//
function CadsterText3D() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.3;
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.25;
    }
  });

  // Shaders for D and T
  const dShader = useMemo(() => ({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        vec3 leftColor = vec3(0.4, 0.0, 0.0);   // dark red
        vec3 rightColor = vec3(0.0, 0.4, 0.0);  // dark green
        vec3 baseColor = mix(leftColor, rightColor, vUv.x);
        // mirror reflection highlight
        float reflection = abs(sin(vUv.y * 6.2831)) * 0.15;
        gl_FragColor = vec4(baseColor + reflection, 1.0);
      }
    `,
  }), []);

  const tShader = useMemo(() => ({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        vec3 start = vec3(0.0, 0.5, 0.0);
        vec3 end = vec3(0.0, 0.0, 0.6);
        vec3 baseColor = mix(start, end, vUv.x);
        // subtle metallic reflection
        float mirror = abs(sin(vUv.y * 10.0)) * 0.1;
        gl_FragColor = vec4(baseColor + mirror, 1.0);
      }
    `,
  }), []);

  const materials = useMemo(() => {
    const common = { metalness: 1.0, roughness: 0.05, envMapIntensity: 1.5 };
    return {
      red: new THREE.MeshStandardMaterial({ color: '#C00000', ...common }),
      green: new THREE.MeshStandardMaterial({ color: '#00AA00', ...common }),
      blue: new THREE.MeshStandardMaterial({ color: '#0044FF', ...common }),
      dShader: new THREE.ShaderMaterial({ ...dShader }),
      tShader: new THREE.ShaderMaterial({ ...tShader }),
    };
  }, [dShader, tShader]);

  return (
    <group ref={groupRef}>
      <Environment preset="city" background={false} />
      <Center>
        <Text3D font="/fonts/helvetiker_regular.typeface.json" size={1} height={0.35} bevelEnabled bevelThickness={0.03} bevelSize={0.03}>
          C
          <primitive object={materials.red} attach="material" />
        </Text3D>

        <Text3D position={[0.9, 0, 0]} font="/fonts/helvetiker_regular.typeface.json" size={1} height={0.35} bevelEnabled bevelThickness={0.03} bevelSize={0.03}>
          A
          <primitive object={materials.red} attach="material" />
        </Text3D>

        <Text3D position={[1.8, 0, 0]} font="/fonts/helvetiker_regular.typeface.json" size={1} height={0.35} bevelEnabled bevelThickness={0.03} bevelSize={0.03}>
          D
          <primitive object={materials.dShader} attach="material" />
        </Text3D>

        <Text3D position={[2.7, 0, 0]} font="/fonts/helvetiker_regular.typeface.json" size={1} height={0.35} bevelEnabled bevelThickness={0.03} bevelSize={0.03}>
          S
          <primitive object={materials.green} attach="material" />
        </Text3D>

        <Text3D position={[3.6, 0, 0]} font="/fonts/helvetiker_regular.typeface.json" size={1} height={0.35} bevelEnabled bevelThickness={0.03} bevelSize={0.03}>
          T
          <primitive object={materials.tShader} attach="material" />
        </Text3D>

        <Text3D position={[4.5, 0, 0]} font="/fonts/helvetiker_regular.typeface.json" size={1} height={0.35} bevelEnabled bevelThickness={0.03} bevelSize={0.03}>
          E
          <primitive object={materials.blue} attach="material" />
        </Text3D>

        <Text3D position={[5.4, 0, 0]} font="/fonts/helvetiker_regular.typeface.json" size={1} height={0.35} bevelEnabled bevelThickness={0.03} bevelSize={0.03}>
          R
          <primitive object={materials.blue} attach="material" />
        </Text3D>
      </Center>
    </group>
  );
}

//
// 🔹 User Imported GLTF Model
//
function ImportedModel({ file }: { file: File }) {
  const [object, setObject] = useState<THREE.Object3D | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!file) return;

    const loader = new GLTFLoader();
    const reader = new FileReader();
    let currentObject: THREE.Object3D | null = null;

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      loader.parse(arrayBuffer, '', (gltf: GLTF) => {
        // Remove previous object
        if (currentObject) {
          scene.remove(currentObject);
          currentObject.traverse((child) => {
            if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
            if ((child as THREE.Mesh).material) {
              const material = (child as THREE.Mesh).material as THREE.Material;
              material.dispose();
            }
          });
        }

        // Add new one
        currentObject = gltf.scene;
        currentObject.scale.set(1, 1, 1);
        scene.add(currentObject);
        setObject(currentObject);
      });
    };

    reader.readAsArrayBuffer(file);

    // Cleanup when component unmounts or file changes
    return () => {
      if (currentObject) {
        scene.remove(currentObject);
        currentObject.traverse((child) => {
          if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
          if ((child as THREE.Mesh).material) {
            const material = (child as THREE.Mesh).material as THREE.Material;
            material.dispose();
          }
        });
      }
    };
  }, [file, scene]);

  return object ? <primitive object={object} /> : null;
}

//
// 🔹 Main ARVR Modal
//
interface ARVRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function ARVRModal({ isOpen, onClose, title }: ARVRModalProps) {
  const [viewMode, setViewMode] = useState<'3d' | 'ar' | 'vr'>('3d');
  const [importedFile, setImportedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImportedFile(e.target.files[0]);
  };

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
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h3 className="text-2xl font-orbitron font-bold text-white">{title}</h3>
                  <p className="text-sm text-white/70 font-inter mt-1">Interactive 3D / AR / VR Preview</p>
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

                  <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-gradient-to-r from-cyan to-purple text-white rounded-lg hover:scale-105 transition-transform">
                    <FiUpload />
                    <span className="text-sm font-inter">Import Model</span>
                    <input type="file" accept=".gltf,.glb" onChange={handleFileChange} className="hidden" />
                  </label>

                  <button
                    onClick={onClose}
                    className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center text-white hover:neon-glow-cyan transition-all"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="relative flex-1 bg-gradient-to-b from-navy/50 to-graphite/50">
                {/* 3D View */}
                {viewMode === '3d' && (
                  <CanvasErrorBoundary>
                    <Canvas>
                      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
                      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={1.5} />

                      <ambientLight intensity={0.6} />
                      <spotLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
                      <pointLight position={[0, 5, 5]} intensity={0.6} />

                      <Suspense fallback={<LoadingSpinner />}>
                        {importedFile ? <ImportedModel file={importedFile} /> : <CadsterText3D />}
                      </Suspense>

                      <gridHelper args={[10, 10, '#00E1FF', '#7A00FF']} position={[0, -2, 0]} />
                    </Canvas>
                  </CanvasErrorBoundary>
                )}

                {/* AR View */}
                {viewMode === 'ar' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center glass-morphism p-8 rounded-xl max-w-md">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan to-purple flex items-center justify-center">
                        <FiMaximize className="text-3xl text-white" />
                      </div>
                      <h4 className="text-2xl font-orbitron font-bold text-white mb-3">AR Preview</h4>
                      <p className="text-white/70 font-inter mb-6">
                        View this model in augmented reality using your mobile device.
                      </p>
                      <button className="px-6 py-3 bg-gradient-to-r from-cyan to-purple rounded-lg text-white font-inter font-semibold neon-glow-cyan hover:scale-105 transition-transform">
                        Launch AR on Mobile
                      </button>
                    </div>
                  </div>
                )}

                {/* VR View */}
                {viewMode === 'vr' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center glass-morphism p-8 rounded-xl max-w-md">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan to-purple flex items-center justify-center">
                        <FiRefreshCw className="text-3xl text-white" />
                      </div>
                      <h4 className="text-2xl font-orbitron font-bold text-white mb-3">VR Experience</h4>
                      <p className="text-white/70 font-inter mb-6">
                        Immerse yourself in virtual reality to explore this model at scale.
                      </p>
                      <button className="px-6 py-3 bg-gradient-to-r from-cyan to-purple rounded-lg text-white font-inter font-semibold neon-glow-cyan hover:scale-105 transition-transform">
                        Enter VR Mode
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Instruction */}
                <div className="absolute bottom-4 left-4 glass-morphism rounded-lg px-4 py-2">
                  <p className="text-white/90 font-inter text-sm">
                    {viewMode === '3d'
                      ? 'Drag to rotate • Scroll to zoom'
                      : viewMode === 'ar'
                      ? 'Augmented Reality Mode'
                      : 'Virtual Reality Mode'}
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

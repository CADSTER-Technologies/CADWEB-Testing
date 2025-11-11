import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Center, Text3D, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FiUpload, FiMaximize, FiRefreshCw } from 'react-icons/fi';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { useIsMobile } from '../hooks/use-is-mobile';


// Camera controlled by useIsMobile so logic is centralized
function ResponsiveCamera() {
  const isMobile = useIsMobile();
  return (
    <PerspectiveCamera
      makeDefault
      position={[0, 0, isMobile ? 7.5 : 6]}
      fov={isMobile ? 45 : 50}
    />
  );
}
//
// 🔹 Spinner
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
// 🔹 3D CADSTER Text
//
function CadsterText3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();
  const isMobile = useIsMobile();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.3;
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.25;
    }
  });

  const dShader = useMemo(() => ({
    vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec2 vUv; void main(){vec3 leftColor=vec3(0.4,0.0,0.0);vec3 rightColor=vec3(0.0,0.4,0.0);vec3 baseColor=mix(leftColor,rightColor,vUv.x);float reflection=abs(sin(vUv.y*6.2831))*0.15;gl_FragColor=vec4(baseColor+reflection,1.0);}`,
  }), []);

  const tShader = useMemo(() => ({
    vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec2 vUv; void main(){vec3 start=vec3(0.0,0.5,0.0);vec3 end=vec3(0.0,0.0,0.6);vec3 baseColor=mix(start,end,vUv.x);float mirror=abs(sin(vUv.y*10.0))*0.1;gl_FragColor=vec4(baseColor+mirror,1.0);}`,
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

  const letters = [
    { char: 'C', mat: 'red' },
    { char: 'A', mat: 'red' },
    { char: 'D', mat: 'dShader' },
    { char: 'S', mat: 'green' },
    { char: 'T', mat: 'tShader' },
    { char: 'E', mat: 'blue' },
    { char: 'R', mat: 'blue' },
  ];

  return (
    <group ref={groupRef} scale={isMobile ? 0.85 : 1}>
      <Environment preset="city" background={false} />
      <Center>
        {letters.map((l, i) => (
          <Text3D
            key={i}
            position={[i * 0.9, 0, 0]}
            font="/fonts/helvetiker_regular.typeface.json"
            size={isMobile ? 0.9 : 1}
            height={0.35}
            bevelEnabled
            bevelThickness={0.03}
            bevelSize={0.03}
          >
            {l.char}
            <primitive object={materials[l.mat as keyof typeof materials]} attach="material" />
          </Text3D>
        ))}
      </Center>
    </group>
  );
}

//
// 🔹 Imported Model
//
function ImportedModel({ file }: { file: File }) {
  const [object, setObject] = useState<THREE.Object3D | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!file) return;
    const loader = new GLTFLoader();
    const reader = new FileReader();
    let current: THREE.Object3D | null = null;

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      loader.parse(arrayBuffer, '', (gltf: GLTF) => {
        if (current) scene.remove(current);
        current = gltf.scene;
        // Recenter and scale to fit view
        const box = new THREE.Box3().setFromObject(current);
        const sizeVec = new THREE.Vector3();
        box.getSize(sizeVec);
        const center = new THREE.Vector3();
        box.getCenter(center);

        current.position.x -= center.x;
        current.position.y -= center.y;
        current.position.z -= center.z;

        const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
        const targetSize = 3.5; // fits well at z ~ 6–7.5 and fov 45–50
        const scale = targetSize / maxDim;
        current.scale.setScalar(scale);

        scene.add(current);
        setObject(current);
      });
    };
    reader.readAsArrayBuffer(file);

    return () => {
      if (current) scene.remove(current);
    };
  }, [file, scene]);

  return object ? <primitive object={object} /> : null;
}

//
// 🔹 Main ModelViewer
//
export default function ModelViewer() {
  const [viewMode, setViewMode] = useState<'3d' | 'ar' | 'vr'>('3d');
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const isMobile = useIsMobile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImportedFile(e.target.files[0]);
  };
  // Tiny guard for auto-rotate on very small phones
  const tiny = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return false;
    return window.matchMedia('(max-width: 379px)').matches;
  }, [isMobile]);
  return (
    <section id="model-viewer" className="relative min-h-screen py-16 sm:py-24 md:py-32 overflow-hidden bg-gradient-to-b from-navy via-graphite to-navy">
      <div className="container mx-auto px-6 relative">
        {/* Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow-cyan">
            3D CAD VISUALIZATION
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Interactive 3D / AR / VR Model Visualization and Import Capability
          </p>
        </motion.div>

        {/* Mobile-only header above card */}
        <div className="sm:hidden mb-3">
          <h3 className="text-xl font-orbitron font-bold text-white text-center">
            3D / AR / VR Model Viewer
          </h3>
          <p className="text-sm text-white/70 font-inter mt-1 text-center">
            Explore interactive CAD models
          </p>
        </div>

        {/* Main 3D/AR/VR Viewer Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header controls */}
            <div className="p-3 sm:p-4 border-b border-white/10">
              {/* Desktop header (title + subtitle left, buttons right) */}
              <div className="hidden sm:flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-orbitron font-bold text-white">
                    3D / AR / VR Model Viewer
                  </h3>
                  <p className="text-sm text-white/70 font-inter mt-1">
                    Explore interactive CAD models
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 glass-morphism rounded-lg p-1">
                    {(['3d', 'ar', 'vr'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-3 sm:px-4 py-2 rounded font-inter text-xs sm:text-sm uppercase transition-all ${viewMode === mode
                          ? 'bg-gradient-to-r from-cyan to-purple text-white'
                          : 'text-white/70 hover:text-white'
                          }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-gradient-to-r from-cyan to-purple text-white rounded-lg hover:scale-105 transition-transform text-xs sm:text-sm">
                    <FiUpload />
                    <span className="font-inter">Import Model</span>
                    <input type="file" accept=".gltf,.glb" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Mobile controls (buttons below the mobile header) */}
              <div className="sm:hidden mt-3 flex items-center justify-center gap-2 flex-wrap">
                <div className="flex gap-1 glass-morphism rounded-lg p-1">
                  {(['3d', 'ar', 'vr'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-2 rounded font-inter text-xs uppercase transition-all ${viewMode === mode
                        ? 'bg-gradient-to-r from-cyan to-purple text-white'
                        : 'text-white/70 hover:text-white'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-gradient-to-r from-cyan to-purple text-white rounded-lg hover:scale-105 transition-transform text-xs sm:text-sm">
                  <FiUpload />
                  <span className="text-sm font-inter">Import Model</span>
                  <input type="file" accept=".gltf,.glb" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* 3D Canvas */}
            <div className="relative h-[48vh] xs:h-[52vh] sm:h-[58vh] md:h-[65vh] ">
              {viewMode === '3d' && (
                <CanvasErrorBoundary>
                  <Canvas
                    dpr={[1, 1.75]}
                    gl={{ antialias: false, powerPreference: 'low-power' }}
                    style={{ width: '100%', height: '100%' }} >
                    <ResponsiveCamera />
                    {/*<PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />*/}
                    {(() => {
                      const tiny = typeof window !== "undefined" ? window.innerWidth < 380 : false;
                      return (
                        <OrbitControls
                          enableZoom
                          enablePan
                          autoRotate={!tiny}
                          autoRotateSpeed={1.2}
                        />
                      );
                    })()}
                    <ambientLight intensity={0.6} />
                    <spotLight position={[10, 10, 10]} intensity={1.2} />
                    <Suspense fallback={<LoadingSpinner />}>
                      {importedFile ? <ImportedModel file={importedFile} /> : <CadsterText3D />}
                    </Suspense>
                    <gridHelper args={[10, 10, '#00E1FF', '#7A00FF']} position={[0, -2.2, 0]} />
                  </Canvas>
                </CanvasErrorBoundary>
              )}
              {viewMode !== '3d' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center glass-morphism p-8 rounded-xl max-w-md">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan to-purple flex items-center justify-center">
                      {viewMode === 'ar' ? (
                        <FiMaximize className="text-3xl text-white" />
                      ) : (
                        <FiRefreshCw className="text-3xl text-white" />
                      )}
                    </div>
                    <h4 className="text-2xl font-orbitron font-bold text-white mb-3">
                      {viewMode === 'ar' ? 'AR Preview' : 'VR Experience'}
                    </h4>
                    <p className="text-white/70 font-inter mb-6">
                      {viewMode === 'ar'
                        ? 'View this model in augmented reality using your mobile device.'
                        : 'Immerse yourself in virtual reality to explore this model at scale.'}
                    </p>
                    <button className="px-6 py-3 bg-gradient-to-r from-cyan to-purple rounded-lg text-white font-inter font-semibold hover:scale-105 transition-transform">
                      {viewMode === 'ar' ? 'Launch AR on Mobile' : 'Enter VR Mode'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div >

        {/* Feature Cards (below viewer) */}
        < div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16" >
          {
            [
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
            ))
          }
        </div >
      </div >
    </section >
  );
}

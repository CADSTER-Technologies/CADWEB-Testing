import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Center, Text3D, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
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
// 🔹 3D "CADSTER" Text (identical to ARVRModal)
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

  // Shader for D (half red, half green + mirror reflection)
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
        float reflection = abs(sin(vUv.y * 6.2831)) * 0.15;
        gl_FragColor = vec4(baseColor + reflection, 1.0);
      }
    `,
  }), []);

  // Shader for T (blend green + blue with metallic reflection)
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
        float mirror = abs(sin(vUv.y * 10.0)) * 0.1;
        gl_FragColor = vec4(baseColor + mirror, 1.0);
      }
    `,
  }), []);

  // Define all letter materials (exact same metallic style)
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
        {/* C */}
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={1}
          height={0.35}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.03}
        >
          C
          <primitive object={materials.red} attach="material" />
        </Text3D>

        {/* A */}
        <Text3D
          position={[0.9, 0, 0]}
          font="/fonts/helvetiker_regular.typeface.json"
          size={1}
          height={0.35}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.03}
        >
          A
          <primitive object={materials.red} attach="material" />
        </Text3D>

        {/* D (half red/green + mirror) */}
        <Text3D
          position={[1.8, 0, 0]}
          font="/fonts/helvetiker_regular.typeface.json"
          size={1}
          height={0.35}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.03}
        >
          D
          <primitive object={materials.dShader} attach="material" />
        </Text3D>

        {/* S (green) */}
        <Text3D
          position={[2.7, 0, 0]}
          font="/fonts/helvetiker_regular.typeface.json"
          size={1}
          height={0.35}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.03}
        >
          S
          <primitive object={materials.green} attach="material" />
        </Text3D>

        {/* T (green-blue blend mirror) */}
        <Text3D
          position={[3.6, 0, 0]}
          font="/fonts/helvetiker_regular.typeface.json"
          size={1}
          height={0.35}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.03}
        >
          T
          <primitive object={materials.tShader} attach="material" />
        </Text3D>

        {/* E (blue) */}
        <Text3D
          position={[4.5, 0, 0]}
          font="/fonts/helvetiker_regular.typeface.json"
          size={1}
          height={0.35}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.03}
        >
          E
          <primitive object={materials.blue} attach="material" />
        </Text3D>

        {/* R (blue) */}
        <Text3D
          position={[5.4, 0, 0]}
          font="/fonts/helvetiker_regular.typeface.json"
          size={1}
          height={0.35}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.03}
        >
          R
          <primitive object={materials.blue} attach="material" />
        </Text3D>
      </Center>
    </group>
  );
}

//
// 🔹 ModelViewer Section (CADSTER text)
//
interface ModelViewerProps {
  title: string;
  description: string;
}

export default function ModelViewer({ title, description }: ModelViewerProps) {
  return (
    <section id="model-viewer" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow-cyan">
            {title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="aspect-video bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden shadow-2xl">
            <CanvasErrorBoundary
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4 text-glow-cyan font-bold">CADSTER</div>
                    <p className="text-muted-foreground">3D visualization loading...</p>
                  </div>
                </div>
              }
            >
              <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
                <OrbitControls
                  enableZoom
                  enablePan={false}
                  minDistance={5}
                  maxDistance={12}
                  enableDamping
                  dampingFactor={0.05}
                />

                {/* Lighting setup */}
                <ambientLight intensity={0.4} />
                <spotLight
                  position={[10, 10, 10]}
                  angle={0.3}
                  penumbra={1}
                  intensity={1.5}
                  castShadow
                />
                <pointLight position={[-10, -5, -10]} intensity={0.8} color="#7A00FF" />
                <pointLight position={[5, 5, 5]} intensity={0.6} color="#00E1FF" />

                <Suspense fallback={<LoadingSpinner />}>
                  <CadsterText3D />
                </Suspense>
              </Canvas>
            </CanvasErrorBoundary>

            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                Interactive 3D Text - Drag to rotate
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
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
          ))}
        </div>
      </div>
    </section>
  );
}

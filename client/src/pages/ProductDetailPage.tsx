import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { routes } from "@/routes";

// 3D + viewer deps
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  Grid,
  ContactShadows,
  Html,
  useProgress,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/* =========================
   3D HERO ORB COMPONENTS
   ========================= */

function EquatorGlow() {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#7fd2ff"),
        transparent: true,
        opacity: 0.9,
      }),
    []
  );
  return (
    <mesh>
      <torusGeometry args={[1.02, 0.008, 16, 256]} />
      <primitive attach="material" object={mat} />
    </mesh>
  );
}

function OrbShell() {
  const color = new THREE.Color("#8fa7ff");
  const metal = 0.85;
  const rough = 0.15;
  const env = 2.0;

  const base = (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color={color}
        metalness={metal}
        roughness={rough}
        envMapIntensity={env}
      />
    </mesh>
  );

  const portMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#0b1220"),
    metalness: 0.7,
    roughness: 0.35,
  });

  const ports = [
    { pos: new THREE.Vector3(0.72, 0, 0), rot: [0, 0, 0] },
    { pos: new THREE.Vector3(-0.72, 0, 0), rot: [0, 0, 0] },
    { pos: new THREE.Vector3(0, 0.62, 0.45), rot: [Math.PI / 3, 0, 0] },
    { pos: new THREE.Vector3(0, 0.62, -0.45), rot: [-Math.PI / 3, 0, 0] },
    { pos: new THREE.Vector3(0, -0.62, 0.45), rot: [Math.PI / 3, 0, Math.PI] },
    { pos: new THREE.Vector3(0, -0.62, -0.45), rot: [-Math.PI / 3, 0, Math.PI] },
  ].map((p, i) => (
    <group key={i} position={p.pos} rotation={p.rot as any}>
      <mesh>
        <torusGeometry args={[0.22, 0.06, 24, 64]} />
        <primitive attach="material" object={portMat} />
      </mesh>
    </group>
  ));

  return (
    <group>
      {base}
      {ports}
    </group>
  );
}

function Trails() {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#87b7ff"),
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  const paths = [
    { s: [1.25, 0.35, 1.0], r: [0, 0.3, 0] },
    { s: [1.15, 0.28, 1.1], r: [0.2, -0.4, 0.1] },
  ];

  return (
    <group>
      {paths.map((p, i) => (
        <mesh key={i} rotation={p.r as any} scale={p.s as any}>
          <torusGeometry args={[1.18, 0.01, 8, 256]} />
          <primitive attach="material" object={mat} />
        </mesh>
      ))}
    </group>
  );
}

function Rotator({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.2;
      ref.current.rotation.x = Math.sin(performance.now() * 0.0003) * 0.08;
    }
  });
  return <group ref={ref}>{children}</group>;
}

function HeroOrbCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 40 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <directionalLight position={[-3, -1, -2]} intensity={0.6} />
      <Environment preset="city" />
      <color attach="background" args={["#0f1430"]} />
      <Rotator>
        <OrbShell />
        <EquatorGlow />
        <Trails />
      </Rotator>
    </Canvas>
  );
}

/* =========================
   PRODUCT QUICKVIEW MODAL
   ========================= */

function ProductQuickView({
  id,
  open,
  onClose,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const titleMap: Record<string, string> = {
    "autocad-automation": "AutoCAD Automation Suite",
    "inventor-configurator": "Inventor Configurator",
    "solidworks-tools": "SolidWorks Power Tools",
    "revit-exporter": "Revit Exporter",
    "unity-viewer": "Unity Viewer",
    "unreal-twin": "Unreal Digital Twin",
  };
  const title = titleMap[id] ?? "ModelPro 3D";

  const bullets = [
    "Open GLB/GLTF instantly with studio lighting",
    "Measure, section cuts, and scene presets",
    "Share secure links with team access",
    "Screenshots and AR/VR placeholders",
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-gradient-to-b from-[#172036]/90 to-[#0b1220]/90 text-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h4 className="text-lg font-semibold">{title}</h4>
          <button className="w-9 h-9 rounded bg-white/10 hover:bg-white/15" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-xl overflow-hidden border border-white/10 bg-[#0f1430] aspect-video">
            <HeroOrbCanvas />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Live demo
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                Beta
              </span>
            </div>
            <p className="text-white/80 text-sm">
              Streamlined 3D viewer with orbit, fit, grid, and contact shadows. Designed for fast previews and team collaboration.
            </p>
            <ul className="text-sm text-white/80 space-y-1.5">
              {bullets.map((b, i) => (
                <li key={i}>• {b}</li>
              ))}
            </ul>
            <button className="mt-3 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-95">
              Start Free
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-white/10 text-white/60 text-xs">
          Tip: Press Esc or click outside to close.
        </div>
      </div>
    </div>
  );
}

/* =========================
   INTERACTIVE DEMO PANEL
   ========================= */

type DemoModel = { name: string; glbUrl: string | null };

const DEMOS: Record<string, DemoModel> = {
  "autocad-automation": { name: "AutoCAD Demo", glbUrl: null },
  "inventor-configurator": { name: "Inventor Demo", glbUrl: "/demos/inventor_part.glb" },
  "solidworks-tools": { name: "SolidWorks Demo", glbUrl: "/demos/solidworks_assembly.glb" },
  "revit-exporter": { name: "Revit Demo", glbUrl: "/demos/revit_building.glb" },
  "unity-viewer": { name: "Unity Demo", glbUrl: "/demos/unity_gear.glb" },
  "unreal-twin": { name: "Unreal Twin", glbUrl: "/demos/industrial_unit.glb" },
};

function LoaderHtml() {
  const { active, progress } = useProgress();
  return active ? (
    <Html center>
      <div className="px-3 py-1.5 rounded bg-black/70 text-white text-sm">
        Loading… {Math.round(progress)}%
      </div>
    </Html>
  ) : null;
}

function useFitTo(target: THREE.Object3D | null) {
  const { camera, controls, invalidate } = useThree() as any;
  return useCallback(() => {
    if (!target) return;
    const box = new THREE.Box3().setFromObject(target);
    const c = new THREE.Vector3();
    box.getCenter(c);
    const s = new THREE.Vector3();
    box.getSize(s);
    const maxAxis = Math.max(s.x, s.y, s.z);
    if (!maxAxis) return;
    const fitDist = maxAxis / (2 * Math.tan((camera.fov * Math.PI) / 360));
    camera.position.copy(
      c.clone().add(new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(fitDist * 1.6))
    );
    camera.near = Math.max(0.01, maxAxis / 1000);
    camera.far = Math.max(1000, fitDist * 20);
    camera.updateProjectionMatrix();
    controls?.target.copy(c);
    controls?.update();
    invalidate();
  }, [target, camera, controls, invalidate]);
}

function CityBlocks({ wireframe }: { wireframe: boolean }) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b9c0d9",
        metalness: 0.1,
        roughness: 0.9,
        wireframe,
      }),
    [wireframe]
  );
  const blocks = [
    { x: -1.8, z: -0.8, w: 0.8, d: 0.8, h: 1.2 },
    { x: -0.6, z: -0.6, w: 0.7, d: 0.7, h: 2.2 },
    { x: 0.6, z: -0.5, w: 0.7, d: 0.7, h: 1.6 },
    { x: 1.8, z: -0.8, w: 0.8, d: 0.8, h: 1.1 },
    { x: -1.2, z: 0.8, w: 0.9, d: 0.9, h: 2.8 },
    { x: 0.2, z: 0.9, w: 0.9, d: 0.9, h: 3.4 },
    { x: 1.5, z: 0.8, w: 0.7, d: 0.7, h: 2.0 },
    { x: -0.2, z: -1.8, w: 0.6, d: 0.6, h: 0.7 },
    { x: 1.0, z: 1.9, w: 0.6, d: 0.6, h: 0.8 },
  ];
  return (
    <group position={[0, -0.5, 0]}>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <primitive attach="material" object={mat} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#1b2236" metalness={0.0} roughness={1.0} />
      </mesh>
    </group>
  );
}

function GLBDemo({
  url,
  wireframe,
  onReady,
}: {
  url: string;
  wireframe: boolean;
  onReady: (o: THREE.Object3D) => void;
}) {
  const holder = useRef<THREE.Group>(null);
  useEffect(() => {
    let disposed = false;
    const loader = new GLTFLoader();
    loader.load(
      url,
      (g: GLTF) => {
        if (disposed) return;
        const obj = g.scene;
        obj.traverse((n: any) => {
          if (n.isMesh) {
            n.castShadow = true;
            n.receiveShadow = true;
            if (n.material) n.material.wireframe = wireframe;
          }
        });
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3(); box.getSize(size);
        const center = new THREE.Vector3(); box.getCenter(center);
        obj.position.sub(center);
        const maxAxis = Math.max(size.x, size.y, size.z);
        const scale = maxAxis > 0 ? 2.8 / maxAxis : 1;
        obj.scale.setScalar(scale);
        holder.current?.clear();
        holder.current?.add(obj);
        onReady(obj);
      },
      undefined,
      () => {}
    );
    return () => {
      disposed = true;
      holder.current?.clear();
    };
  }, [url, wireframe, onReady]);
  return <group ref={holder} />;
}

function InteractiveDemo({ productId }: { productId: string }) {
  const demo: DemoModel = DEMOS[productId] ?? { name: "Demo", glbUrl: null };
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<THREE.Object3D | null>(null);
  const [isFull, setIsFull] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const FitBridge = () => {
    const api = useThree() as any;
    const fitNow = useFitTo(target);
    useEffect(() => {
      const doFit = () => fitNow();
      const doReset = () => {
        api.camera.position.set(0, 0, 8);
        api.controls?.reset();
        api.invalidate();
      };
      window.addEventListener("demo-fit", doFit);
      window.addEventListener("demo-reset", doReset);
      fitNow();
      return () => {
        window.removeEventListener("demo-fit", doFit);
        window.removeEventListener("demo-reset", doReset);
      };
    }, [api, fitNow]);
    return null;
  };

  const onFit = () => window.dispatchEvent(new CustomEvent("demo-fit"));
  const onReset = () => window.dispatchEvent(new CustomEvent("demo-reset"));
  const onShot = () => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `${productId}-demo.png`;
    a.click();
  };

  const wrapClass = isFull
    ? "fixed inset-0 z-[80] p-6 bg-[#0b1220]/90 backdrop-blur"
    : "";

  return (
    <div className={wrapClass}>
      <div
        className={`rounded-2xl bg-[#141a2a] border border-white/10 overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] ${
          isFull ? "max-w-[1400px] mx-auto h-full flex flex-col" : ""
        }`}
      >
        {/* Title bar */}
        <div className="h-10 flex items-center justify-between px-3 bg-[#111726] text-white/80 border-b border-white/10">
          <div className="flex items-center gap-2">
            {!isFull && <></>}
            <span className="ml-1 text-sm">{demo.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isFull ? (
              <button
                className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white/80"
                title="Full screen"
                onClick={() => setIsFull(true)}
              >
                ▢
              </button>
            ) : (
              <button
                className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white/80"
                title="Exit full screen"
                onClick={() => setIsFull(false)}
              >
                ✖
              </button>
            )}
          </div>
        </div>

        {/* Viewer */}
        <div
          className={
            isFull ? "relative flex-1 bg-[#0b1220]" : "relative aspect-[16/9] bg-[#0b1220]"
          }
        >
          <Canvas
            onCreated={({ gl }) => (canvasRef.current = gl.domElement)}
            shadows
            camera={{ position: [0, 0, 8], fov: 50 }}
          >
            <OrbitControls enableDamping dampingFactor={0.06} minDistance={2} maxDistance={40} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[6, 8, 6]} intensity={1.3} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
            <directionalLight position={[-5, 3, -4]} intensity={0.5} />
            {showGrid && (
              <>
                <Grid position={[0, -1.5, 0]} args={[60, 60]} cellSize={0.5} cellThickness={0.4} sectionSize={5} sectionThickness={1.2} fadeDistance={60} infiniteGrid />
                <ContactShadows position={[0, -1.49, 0]} opacity={0.22} scale={20} blur={2.4} far={12} color="#000" />
              </>
            )}

            <Suspense fallback={<LoaderHtml />}>
              {DEMOS[productId]?.glbUrl ? (
                <GLBDemo url={DEMOS[productId]!.glbUrl!} wireframe={wireframe} onReady={(o) => setTarget(o)} />
              ) : (
                <group ref={(g) => g && setTarget(g)}>
                  <CityBlocks wireframe={wireframe} />
                </group>
              )}
            </Suspense>

            <GizmoHelper alignment="top-right" margin={[60, 60]}>
              <GizmoViewport axisColors={["#ff6b6b", "#6bff95", "#6bb8ff"]} labelColor="#fff" />
            </GizmoHelper>

            <FitBridge />
          </Canvas>

          {/* Bottom toolbar */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/35 backdrop-blur px-4 py-2 rounded-xl border border-white/10">
            <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white/80" onClick={onReset} title="Reset">↺</button>
            <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white/80" onClick={onFit} title="Fit">🗔</button>
            <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white/80" onClick={() => setWireframe((w) => !w)} title="Wireframe">#</button>
            <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white/80" onClick={() => setShowGrid((g) => !g)} title="Grid">▦</button>
            <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white/80" onClick={onShot} title="Screenshot">📷</button>
            {!isFull ? (
              <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white/80" title="Full screen" onClick={() => setIsFull(true)}>▢</button>
            ) : (
              <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white/80" title="Exit full screen" onClick={() => setIsFull(false)}>✖</button>
            )}
          </div>

          {/* Pager dots only in small mode */}
          {!isFull && (
            <div className="absolute bottom-3 left-6 flex items-center gap-2">
              {[1, 2, 3].map((i) => (
                <button key={i} onClick={() => setPage(i)} className={`w-2 h-2 rounded-full ${page === i ? "bg-white/80" : "bg-white/30"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Footer mimic hidden in full mode */}
        {!isFull && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-[#12182a]">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <span className="w-7 h-7 rounded bg-white/5 flex items-center justify-center">▢</span>
            </div>
            <div className="text-white/60 text-xs">Demo UI</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   PRICING (Interactive; Free default)
   ========================= */

function Check({ on = true }) {
  return (
    <span
      className={`inline-flex w-5 h-5 items-center justify-center rounded ${
        on ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/30"
      }`}
    >
      {on ? "✓" : "—"}
    </span>
  );
}

type PlanKey = "free" | "pro" | "enterprise";

const PLANS: Record<PlanKey, { name: string; price: string; cta: string; sub: string }> = {
  free: { name: "Free", price: "₹0", cta: "Start Free", sub: "Starter tools" },
  pro: { name: "Pro", price: "₹2,990", cta: "Upgrade to Pro", sub: "Teams & features" },
  enterprise: { name: "Enterprise", price: "₹9,900", cta: "Contact Sales", sub: "Full feature set" },
};

const FEATURES = [
  { key: "view_gltf", label: "View GLB/GLTF", free: true, pro: true, enterprise: true },
  { key: "orbit_zoom_pan", label: "Orbit • Zoom • Pan", free: true, pro: true, enterprise: true },
  { key: "grid_shadows", label: "Grid & Contact Shadows", free: true, pro: true, enterprise: true },
  { key: "screenshot", label: "Screenshot Export", free: false, pro: true, enterprise: true },
  { key: "sections", label: "Sections & Scenes", free: false, pro: true, enterprise: true },
  { key: "measure", label: "Measurement (beta)", free: false, pro: true, enterprise: true },
  { key: "cad_pipeline", label: "CAD Conversion Pipeline", free: false, pro: false, enterprise: true },
  { key: "sso_ac", label: "SSO & Access Control", free: false, pro: false, enterprise: true },
  { key: "sla", label: "Priority Support SLA", free: false, pro: false, enterprise: true },
];

function PricingCards() {
  const navigate = useNavigate();
  const [active, setActive] = useState<PlanKey>("free");

  const handleCTA = (k: PlanKey) => {
    if (k === "free") navigate("/signup");
    else if (k === "pro") navigate("/checkout?plan=pro");
    else navigate("/contact?topic=enterprise");
  };

  return (
    <section className="mt-12">
      <h3 className="text-white text-xl font-semibold mb-4">Plans</h3>

      {/* Selector: Free default */}
      <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 text-white/80">
        {(["free", "pro", "enterprise"] as PlanKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`px-4 py-2 rounded-md text-sm ${
              active === k ? "bg-indigo-500 text-white" : "hover:bg-white/10"
            }`}
          >
            {PLANS[k].name}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["free", "pro", "enterprise"] as PlanKey[]).map((k) => (
          <div
            key={k}
            className={`rounded-xl p-5 text-white border transition ${
              k === "enterprise"
                ? "bg-[#1a2134] border-indigo-500/50 shadow-[0_0_0_2px_rgba(99,102,241,0.35)_inset]"
                : "bg-white/5 border-white/10"
            } ${active === k ? "ring-2 ring-indigo-400/40" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="text-white/80 text-sm">{PLANS[k].name}</div>
              {k === "enterprise" && (
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Featured</span>
              )}
            </div>
            <div className="text-3xl font-bold mt-1">{PLANS[k].price}</div>
            <div className="text-white/60 text-sm mb-4">{PLANS[k].sub}</div>

            <ul className="space-y-2 text-white/80 text-sm">
              {FEATURES.map((f) => {
                const on = (f as any)[k] as boolean;
                return (
                  <li key={f.key} className="flex items-center gap-2">
                    <Check on={on} />
                    <span className={on ? "" : "text-white/40"}>{f.label}</span>
                  </li>
                );
              })}
            </ul>

            <button
              className={`mt-5 w-full px-4 py-2 rounded-lg ${
                k === "enterprise"
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-95"
                  : "bg-white/10 hover:bg-white/15"
              }`}
              onClick={() => handleCTA(k)}
            >
              {PLANS[k].cta}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-3 text-white/60 text-sm">
        Current selection: <span className="text-white">{PLANS[active].name}</span>. Start on Free and upgrade any time.
      </p>
    </section>
  );
}

/* =========================
   PAGE
   ========================= */

export default function ProductDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [quickOpen, setQuickOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0b1220]">
      {/* Top nav (dark, slim) */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="text-white font-orbitron text-xl">ModelPro 3D Viewer</div>
          <nav className="flex items-center gap-6 text-white/70">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <button className="hover:text-white">Sign In</button>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-14">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Experience 3D Like Never Before
            </h1>
            <p className="mt-4 text-white/70 text-lg">
              Universal file support, real‑time rendering, and collaboration for “{id}”.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                className="px-5 py-3 rounded-lg bg-white/10 text-white hover:bg-white/15"
                onClick={() => setQuickOpen(true)}
              >
                Learn More
              </button>
              <button
                className="px-5 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-95"
                onClick={() => navigate(routes.viewer(id))}
              >
                Try Free Demo
              </button>
            </div>

            {/* Key features row */}
            <section id="features" className="scroll-mt-24">
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">🗂️</div>
                    <div className="font-semibold">Universal File Support</div>
                  </div>
                  <div className="text-white/70 text-sm mt-2">GLB/GLTF inline; CAD via conversion pipeline.</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">⚡</div>
                    <div className="font-semibold">Real‑Time Rendering</div>
                  </div>
                  <div className="text-white/70 text-sm mt-2">Lights, shadows, grid floor, camera tools.</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">☁️</div>
                    <div className="font-semibold">Cloud Collaboration</div>
                  </div>
                  <div className="text-white/70 text-sm mt-2">Share links, AR/VR placeholders, team access.</div>
                </div>
              </div>
            </section>
          </div>

          {/* Hero visual: live 3D orb */}
          <div className="rounded-2xl bg-[#0f1430] border border-white/10 aspect-video overflow-hidden relative">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "0 0 160px 40px rgba(99,102,241,0.15) inset" }}
            />
            <HeroOrbCanvas />
          </div>
        </div>

        {/* Interactive Demo */}
        <section className="mt-12">
          <h2 className="text-white text-2xl font-semibold">Interactive Demo</h2>
          <div className="mt-4">
            <InteractiveDemo productId={id} />
          </div>
        </section>

        {/* Pricing (interactive, Free default) */}
        <section id="pricing" className="scroll-mt-24">
          <PricingCards />
        </section>

        {/* Bottom CTA bar */}
        <section className="mt-12">
          <div className="rounded-xl bg-[#141a2a] border border-white/10 p-6 flex items-center justify-between">
            <div className="text-white font-semibold">Ready to Transform Your Visuals?</div>
            <button
              className="px-5 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-95"
              onClick={() => navigate(routes.viewer(id))}
            >
              Get Started
            </button>
          </div>
        </section>
      </section>

      {/* QuickView modal */}
      <ProductQuickView id={id} open={quickOpen} onClose={() => setQuickOpen(false)} />
    </main>
  );
}

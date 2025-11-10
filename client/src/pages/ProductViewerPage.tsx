import React, {
useEffect,
useRef,
useState,
Suspense,
useMemo,
useCallback,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
OrbitControls,
Grid,
ContactShadows,
Html,
useProgress,
GizmoHelper,
GizmoViewport,
TransformControls,
} from "@react-three/drei";
import { useParams } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/* Loader */
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

/* Renderer exposure (set once, not per-frame) */
function SceneExposure({ exposure }: { exposure: number }) {
const { gl } = useThree();
useEffect(() => {
gl.toneMapping = THREE.ACESFilmicToneMapping;
(gl as any).outputColorSpace = THREE.SRGBColorSpace;
gl.toneMappingExposure = exposure;
}, [gl, exposure]);
return null;
}

/* Fit/Orient/Reset controls via events */
function FitControls({ target }: { target: THREE.Object3D | null }) {
  const { camera, controls, invalidate } = useThree() as any;
  const hasFittedRef = useRef(false);
  const previousTargetRef = useRef<THREE.Object3D | null>(null);

  const fit = useCallback(
    (pad = 1.7) => {
      if (!target) return;
      const box = new THREE.Box3().setFromObject(target);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxAxis = Math.max(size.x, size.y, size.z) || 1.0;
      const fitDist = maxAxis / (2 * Math.tan((camera.fov * Math.PI) / 360));
      camera.position.copy(
        center
          .clone()
          .add(new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(fitDist * pad))
      );
      camera.near = Math.max(0.01, maxAxis / 1000);
      camera.far = Math.max(1000, fitDist * 25);
      camera.updateProjectionMatrix();
      controls?.target.copy(center);
      controls?.update();
      invalidate();
    },
    [target, camera, controls, invalidate]
  );

  const orient = useCallback(
    (dir: string) => {
      if (!target) return;
      const box = new THREE.Box3().setFromObject(target);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxAxis = Math.max(size.x, size.y, size.z) || 1.0;
      const dist = maxAxis * 2.2;
      const map: Record<string, THREE.Vector3> = {
        N: new THREE.Vector3(0, 0, dist),
        S: new THREE.Vector3(0, 0, -dist),
        E: new THREE.Vector3(dist, 0, 0),
        W: new THREE.Vector3(-dist, 0, 0),
        TOP: new THREE.Vector3(0, dist, 0),
        ISO: new THREE.Vector3(dist, dist, dist).normalize().multiplyScalar(dist),
      };
      camera.position.copy(center.clone().add(map[dir] ?? map.ISO));
      controls?.target.copy(center);
      controls?.update();
      invalidate();
    },
    [target, camera, controls, invalidate]
  );

  const reset = useCallback(() => {
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
    controls?.target.set(0, 0, 0);
    controls?.reset();
    invalidate();
  }, [camera, controls, invalidate]);

  useEffect(() => {
    if (target && target !== previousTargetRef.current) {
      previousTargetRef.current = target;
      hasFittedRef.current = false;
    }
  }, [target]);

  useEffect(() => {
    if (target && !hasFittedRef.current) {
      hasFittedRef.current = true;
      const t = setTimeout(() => fit(), 100);
      return () => clearTimeout(t);
    }
  }, [target, fit]);

  useEffect(() => {
    const onFit = () => fit();
    const onReset = () => reset();
    const onOrient = (e: any) => orient(e.detail?.dir || "ISO");
    window.addEventListener("mv-fit", onFit);
    window.addEventListener("mv-reset", onReset);
    window.addEventListener("mv-orient", onOrient);
    return () => {
      window.removeEventListener("mv-fit", onFit);
      window.removeEventListener("mv-reset", onReset);
      window.removeEventListener("mv-orient", onOrient);
    };
  }, [fit, reset, orient]);

  return null;
}

/* Alt+Click to set zoom focus */
function ZoomFocus({ targetRoot }: { targetRoot: THREE.Object3D | null }) {
  const { camera, controls, gl, invalidate } = useThree() as any;
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  useEffect(() => {
    const el = gl.domElement as HTMLCanvasElement;
    const onPointerDown = (e: MouseEvent) => {
      if (!e.altKey || !targetRoot) return;
      const r = el.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(targetRoot, true)[0];
      if (hit) {
        controls?.target.copy(hit.point);
        controls?.update();
        invalidate();
      }
    };
    el.addEventListener("pointerdown", onPointerDown);
    return () => el.removeEventListener("pointerdown", onPointerDown);
  }, [camera, controls, gl, raycaster, ndc, targetRoot, invalidate]);
  return null;
}

/* GLTF importer */
function ImportedGLTF({
  file,
  mode,
  aoEnabled,
  colorize,
  contrast,
  onReady,
}: {
  file: File;
  mode: "pbr" | "wire" | "clay";
  aoEnabled: boolean;
  colorize: string | null;
  contrast: number;
  onReady: (o: THREE.Object3D) => void;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileKeyRef = useRef<string>("");
  const originalMaterialsRef = useRef<
    Map<THREE.Mesh, THREE.Material | THREE.Material[]>
  >(new Map());

  const clayMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b1b6c2",
        metalness: 0.0,
        roughness: 0.9,
      }),
    []
  );

  useEffect(() => {
    if (!file || !rootRef.current) return;
    const currentKey = `${file.name}-${file.size}-${file.lastModified}`;
    if (currentKey === fileKeyRef.current) return;

    fileKeyRef.current = currentKey;
    setIsLoaded(false);
    originalMaterialsRef.current.clear();

    let disposed = false;
    const loader = new GLTFLoader();
    const reader = new FileReader();

    const clearRoot = () => {
      const root = rootRef.current;
      if (!root) return;
      [...root.children].forEach((child) => {
        child.traverse((n: any) => {
          if (n.geometry) n.geometry.dispose();
          if (n.material) {
            if (Array.isArray(n.material)) {
              (n.material as THREE.Material[]).forEach((m) => m.dispose());
            } else {
              (n.material as THREE.Material | undefined)?.dispose?.();
            }
          }
        });
        root.remove(child);
      });
      originalMaterialsRef.current.clear();
    };

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      loader.parse(arrayBuffer, "", (gltf: GLTF) => {
        if (disposed || !rootRef.current) return;

        clearRoot();

        const obj = gltf.scene;

        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        obj.position.sub(center);
        const maxAxis = Math.max(size.x, size.y, size.z) || 1.0;
        obj.scale.setScalar(3 / maxAxis);

        const newBox = new THREE.Box3().setFromObject(obj);
        const minY = newBox.min.y;
        obj.position.y += -1.5 - minY;

        obj.traverse((n: any) => {
          if (!n.isMesh) return;
          n.castShadow = true;
          n.receiveShadow = true;

          if (n.material) {
            if (Array.isArray(n.material)) {
              originalMaterialsRef.current.set(
                n,
                n.material.map((m: THREE.Material) => m.clone())
              );
            } else {
              originalMaterialsRef.current.set(n, n.material.clone());
            }
          } else {
            const defaultMat = new THREE.MeshStandardMaterial({
              color: "#cfd6e4",
              metalness: 0.1,
              roughness: 0.6,
            });
            n.material = defaultMat;
            originalMaterialsRef.current.set(n, defaultMat.clone());
          }

          const applyAntiZFight = (mat: THREE.Material) => {
            mat.polygonOffset = true;
            mat.polygonOffsetFactor = 2;
            mat.polygonOffsetUnits = 2;
          };
          if (Array.isArray(n.material)) n.material.forEach(applyAntiZFight);
          else applyAntiZFight(n.material);
        });

        rootRef.current.add(obj);
        setIsLoaded(true);
        onReady(obj);
      });
    };

    reader.readAsArrayBuffer(file);
    return () => {
      disposed = true;
      clearRoot();
    };
  }, [file, onReady]);

  useEffect(() => {
    if (!isLoaded || !rootRef.current) return;
    rootRef.current.traverse((n: any) => {
      if (!n.isMesh || !n.material) return;

      const originalMaterial = originalMaterialsRef.current.get(n);
      if (!originalMaterial) return;

      const disposeMaterial = (mat: THREE.Material) => {
        if (mat && mat.dispose && originalMaterial !== mat) {
          if (Array.isArray(originalMaterial)) {
            if (!originalMaterial.includes(mat)) mat.dispose();
          } else {
            if (originalMaterial !== mat) mat.dispose();
          }
        }
      };
      if (Array.isArray(n.material)) n.material.forEach(disposeMaterial);
      else disposeMaterial(n.material);

      if (mode === "wire") {
        n.material = new THREE.MeshBasicMaterial({
          color: colorize || "#cfd6e4",
          wireframe: true,
        });
      } else if (mode === "clay") {
        const mat = clayMat.clone();
        if (colorize) mat.color = new THREE.Color(colorize);
        n.material = mat;
      } else {
        if (Array.isArray(originalMaterial)) {
          n.material = originalMaterial.map((m: THREE.Material) => {
            const cloned = m.clone();
            if (colorize && "color" in cloned) {
              (cloned as any).color = new THREE.Color(colorize);
            }
            return cloned;
          });
        } else {
          n.material = originalMaterial.clone();
          if (colorize && "color" in n.material) {
            (n.material as any).color = new THREE.Color(colorize);
          }
        }
      }

      const applyAntiZFight = (mat: THREE.Material) => {
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = 2;
        mat.polygonOffsetUnits = 2;
      };
      if (Array.isArray(n.material)) n.material.forEach(applyAntiZFight);
      else applyAntiZFight(n.material);
    });
  }, [mode, clayMat, isLoaded, colorize]);

  useEffect(() => {
    if (!isLoaded || !rootRef.current) return;
    rootRef.current.traverse((n: any) => {
      if (!n.isMesh || !n.material) return;
      const updateColor = (mat: THREE.Material) => {
        if ("color" in mat && colorize) {
          (mat as any).color = new THREE.Color(colorize);
        }
      };
      if (Array.isArray(n.material)) n.material.forEach(updateColor);
      else updateColor(n.material);
    });
  }, [colorize, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !rootRef.current) return;
    rootRef.current.traverse((n: any) => {
      if (!n.isMesh || !n.material) return;
      const updateMaterial = (mat: THREE.Material) => {
        if ("envMapIntensity" in mat) {
          (mat as any).envMapIntensity = aoEnabled ? 1.0 : 0.6;
        }
        if ("roughness" in mat && mode !== "clay") {
          (mat as any).roughness = THREE.MathUtils.clamp(
            0.6 / contrast,
            0.05,
            1.0
          );
        }
      };
      if (Array.isArray(n.material)) n.material.forEach(updateMaterial);
      else updateMaterial(n.material);
    });
  }, [aoEnabled, contrast, mode, isLoaded]);

  return <group ref={rootRef} />;
}

/* Stats + Overlays helpers */
// Axis helper at origin
function OriginAxes({ visible }: { visible: boolean }) {
  return visible ? <primitive object={new THREE.AxesHelper(1.2)} /> : null;
}
type CamBookmark = { pos: THREE.Vector3; target: THREE.Vector3; name: string };
function StatsOverlay({ target }: { target: THREE.Object3D | null }) {
  const [stats, setStats] = useState({
    objects: 0,
    verts: 0,
    edges: 0,
    faces: 0,
    tris: 0,
  });
  useEffect(() => {
    if (!target) {
      setStats({ objects: 0, verts: 0, edges: 0, faces: 0, tris: 0 });
      return;
    }
    let objects = 0,
      verts = 0,
      edges = 0,
      faces = 0,
      tris = 0;
    target.traverse((n: any) => {
      if (n.isMesh && n.geometry) {
        objects += 1;
        const pos = n.geometry.attributes?.position?.count ?? 0;
        verts += pos;
        const idxCount = n.geometry.index?.count ?? (pos ? Math.floor(pos / 3) * 3 : 0);
        tris += Math.floor(idxCount / 3);
        faces = tris;
        edges += Math.floor((faces * 3) / 2);
      }
    });
    setStats({ objects, verts, edges, faces, tris });
  }, [target]);
  return (
    <Html position={[0, 0, 0]} transform={false} zIndexRange={[100, 0]}>
      <div className="pointer-events-none select-none absolute left-3 top-3 rounded bg-black/50 px-3 py-2 text-xs text-white shadow">
        <div>Objects: {stats.objects}</div>
        <div>Vertices: {stats.verts.toLocaleString()}</div>
        <div>Edges: {stats.edges.toLocaleString()}</div>
        <div>Faces: {stats.faces.toLocaleString()}</div>
        <div>Triangles: {stats.tris.toLocaleString()}</div>
      </div>
    </Html>
  );
}

/* Page */
export default function ProductViewerPage() {
  const { id = "" } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<THREE.Object3D | null>(null);

  const [mode, setMode] = useState<"pbr" | "wire" | "clay">("pbr");
  const [aoEnabled, setAoEnabled] = useState(true);
  const [exposure, setExposure] = useState(1.1);
  const [contrast, setContrast] = useState(1.0);
  const [colorize, setColorize] = useState<string | null>(null);

  // viewer extras
  const [bgMode, setBgMode] = useState<"dark" | "light" | "transparent">("dark");
  const [autoRotate, setAutoRotate] = useState(false);

  // NEW: viewport shading + overlays + material preview
  const [vpStyle, setVpStyle] = useState<"solid" | "material" | "wire">("material");
  const [showGrid, setShowGrid] = useState(true);
  const [showGizmo, setShowGizmo] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [matPreview, setMatPreview] = useState(false);

  // bookmarks
  const [bookmarks, setBookmarks] = useState<CamBookmark[]>([]);
  const saveBookmark = (name: string) => {
    const c = (window as any).__r3f?.root?.store?.getState?.().camera;
    const ctr = (window as any).__r3f?.root?.store?.getState?.().controls;
    if (!c || !ctr) return;
    setBookmarks((b) => [
      ...b.slice(-3),
      { name, pos: c.position.clone(), target: ctr.target.clone() },
    ]);
  };
  const goBookmark = (bm: CamBookmark) => {
    const c = (window as any).__r3f?.root?.store?.getState?.().camera;
    const ctr = (window as any).__r3f?.root?.store?.getState?.().controls;
    if (!c || !ctr) return;
    c.position.copy(bm.pos);
    ctr.target.copy(bm.target);
    ctr.update();
  };

  const chip =
    "px-2.5 py-1.5 rounded-md bg-white/5 text-white/85 hover:bg-white/10 text-xs";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const takeShot = () => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `viewer-${id || "model"}.png`;
    a.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (newFile) {
      setTarget(null);
      setFile(newFile);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f18] text-white grid grid-cols-[280px_1fr_360px] grid-rows-[56px_1fr]">
      {/* Top Bar */}
      <div className="col-span-3 row-start-1 border-b border-white/10 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-white/10" />
          <div className="font-orbitron">Viewer • {id}</div>
        </div>
        <div className="flex items-center gap-2">
          <label className={`${chip} cursor-pointer`}>
            Import GLB/GLTF
            <input
              type="file"
              accept=".glb,.gltf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("mv-fit"))}
            className={chip}
          >
            Fit
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("mv-reset"))}
            className={chip}
          >
            Reset
          </button>
          <button onClick={takeShot} className={chip}>
            Screenshot
          </button>
        </div>
      </div>

      {/* Left Pane */}
      <aside className="row-start-2 border-r border-white/10 p-2 overflow-y-auto">
        <div className="text-xs uppercase text-white/50 px-1 mb-1">View</div>
        <div className="space-y-2 text-sm">
          <label className="flex items-center justify-between">
            <span>Auto-rotate</span>
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Background</span>
            <select
              value={bgMode}
              onChange={(e) => setBgMode(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded px-2 py-1"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="transparent">Transparent</option>
            </select>
          </label>
        </div>

        <div className="mt-4 text-xs uppercase text-white/50 px-1 mb-1">Orient</div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {[
            { k: "mv-orient", t: "Iso", d: "ISO" },
            { k: "mv-orient", t: "Top", d: "TOP" },
            { k: "mv-orient", t: "N", d: "N" },
            { k: "mv-orient", t: "S", d: "S" },
            { k: "mv-orient", t: "E", d: "E" },
            { k: "mv-orient", t: "W", d: "W" },
          ].map((o) => (
            <button
              key={o.t}
              onClick={() =>
                window.dispatchEvent(new CustomEvent(o.k, { detail: { dir: o.d } }))
              }
              className="h-8 rounded bg-black/40 hover:bg-black/55 border border-white/10"
            >
              {o.t}
            </button>
          ))}
        </div>
      </aside>

      {/* Viewport */}
      <main className="row-start-2 relative">
        <div
          className="absolute inset-0"
          style={{
            background:
              bgMode === "dark"
                ? "linear-gradient(to bottom, #0b1220, #0b1220)"
                : bgMode === "light"
                ? "#f4f6fa"
                : "transparent",
            backgroundImage:
              bgMode === "dark"
                ? "radial-gradient(1200px 600px at 50% 20%, rgba(59,130,246,0.10), transparent 60%)"
                : "none",
          }}
        />

        <div className="relative h-full">
          <Canvas
            onCreated={({ gl }) => (canvasRef.current = gl.domElement)}
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 0, 8], fov: 50 }}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            frameloop="demand"
          >
            <SceneExposure exposure={matPreview ? Math.max(1.25, exposure) : exposure} />
            {bgMode !== "transparent" && (
              <color
                attach="background"
                args={[bgMode === "light" ? "#f4f6fa" : "#0b1220"]}
              />
            )}
            <OrbitControls
              makeDefault
              enableZoom
              enablePan
              enableDamping
              dampingFactor={0.06}
              minDistance={0.01}
              maxDistance={1000}
              autoRotate={autoRotate}
              autoRotateSpeed={0.8}
            />
            <ambientLight intensity={matPreview ? 0.7 : 0.55} />
            <directionalLight
              position={[6, 10, 6]}
              intensity={matPreview ? 1.8 : 1.4}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <directionalLight position={[-6, 5, -4]} intensity={matPreview ? 0.9 : 0.6} />

            {showGrid && (
              <>
                <Grid
                  position={[0, -3, 0]}
                  args={[100, 100]}
                  cellSize={1}
                  cellThickness={0.5}
                  sectionSize={10}
                  sectionThickness={1.2}
                  fadeDistance={120}
                />
                <ContactShadows
                  position={[0, -2.9, 0]}
                  opacity={0.28}
                  scale={30}
                  blur={2.6}
                  far={20}
                  color="#000"
                />
              </>
            )}

            <Suspense fallback={<LoaderHtml />}>
              {!file && (
                <Html center>
                  <div className="bg-black/60 px-4 py-2 rounded-md text-white/80 text-sm">
                    Import a GLB/GLTF to begin
                  </div>
                </Html>
              )}
              {file && (
                <ImportedGLTF
                  file={file}
                  mode={vpStyle === "wire" ? "wire" : mode}
                  aoEnabled={aoEnabled}
                  colorize={vpStyle === "solid" ? "#cfd6e4" : colorize}
                  contrast={contrast}
                  onReady={setTarget}
                />
              )}
            </Suspense>

            <OriginAxes visible={showAxes} />
            {showGizmo && (
              <GizmoHelper alignment="top-right" margin={[60, 60]}>
                <GizmoViewport
                  axisColors={["#ff6b6b", "#6bff95", "#6bb8ff"]}
                  labelColor="#ffffff"
                />
              </GizmoHelper>
            )}

            <FitControls target={target} />
            <ZoomFocus targetRoot={target} />

            <StatsOverlay target={target} />
          </Canvas>

          {/* Playback strip */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#0b1220]/85 border-t border-white/10 px-3 py-2 flex items-center gap-3">
            <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10">⏮</button>
            <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10">▶</button>
            <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10">⏸</button>
            <input type="range" min={0} max={250} defaultValue={0} className="flex-1" />
            <span className="text-xs text-white/70">Start: 1</span>
            <span className="text-xs text-white/70">End: 250</span>
          </div>
        </div>

        {/* Bottom toolbar (existing) remains unchanged */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/55 backdrop-blur px-3 py-2 rounded-md border border-white/10 text-[12px]">
          <button
            onClick={() => setMode("pbr")}
            className={`px-2 py-1 rounded ${mode === "pbr" ? "bg-white/20" : "hover:bg-white/10"}`}
          >
            PBR
          </button>
          <button
            onClick={() => setMode("wire")}
            className={`px-2 py-1 rounded ${mode === "wire" ? "bg-white/20" : "hover:bg-white/10"}`}
          >
            Wire
          </button>
          <button
            onClick={() => setMode("clay")}
            className={`px-2 py-1 rounded ${mode === "clay" ? "bg-white/20" : "hover:bg-white/10"}`}
          >
            Clay
          </button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              className="accent-indigo-400"
              checked={aoEnabled}
              onChange={(e) => setAoEnabled(e.target.checked)}
            />
            <span>AO</span>
          </label>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <label className="flex items-center gap-2">
            <span>Exposure</span>
            <input
              type="range"
              min="0.5"
              max="1.8"
              step="0.01"
              value={exposure}
              onChange={(e) => setExposure(parseFloat(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-2">
            <span>Contrast</span>
            <input
              type="range"
              min="0.7"
              max="1.6"
              step="0.01"
              value={contrast}
              onChange={(e) => setContrast(parseFloat(e.target.value))}
            />
          </label>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <label className="flex items-center gap-2">
            <span>Tint</span>
            <input
              type="color"
              value={colorize ?? "#cfd6e4"}
              onChange={(e) => setColorize(e.target.value)}
            />
            <button
              className="px-2 py-1 rounded hover:bg-white/10"
              onClick={() => setColorize(null)}
            >
              Reset
            </button>
          </label>
        </div>
      </main>

      {/* Right Inspector */}
      <aside className="row-start-2 border-l border-white/10 p-3 overflow-y-auto">
        <div className="text-xs uppercase text-white/50 mb-2">Inspector</div>

        {/* Viewport Shading */}
        <div className="p-2 rounded bg-white/5 border border-white/10 mb-3">
          <div className="text-white/70 mb-2 text-sm">Viewport Shading</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setVpStyle("solid")} className={`px-2 py-1 rounded ${vpStyle === "solid" ? "bg-indigo-500/30" : "bg-black/40 hover:bg-black/55"}`}>Solid</button>
            <button onClick={() => setVpStyle("material")} className={`px-2 py-1 rounded ${vpStyle === "material" ? "bg-indigo-500/30" : "bg-black/40 hover:bg-black/55"}`}>Material</button>
            <button onClick={() => setVpStyle("wire")} className={`px-2 py-1 rounded ${vpStyle === "wire" ? "bg-indigo-500/30" : "bg-black/40 hover:bg-black/55"}`}>Wireframe</button>
          </div>
        </div>

        {/* Overlays */}
        <div className="p-2 rounded bg-white/5 border border-white/10 mb-3">
          <div className="text-white/70 mb-2 text-sm">Overlays</div>
          <label className="flex items-center justify-between text-sm mb-1">
            <span>Grid</span>
            <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between text-sm mb-1">
            <span>Gizmo</span>
            <input type="checkbox" checked={showGizmo} onChange={(e) => setShowGizmo(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Axes</span>
            <input type="checkbox" checked={showAxes} onChange={(e) => setShowAxes(e.target.checked)} />
          </label>
        </div>

        {/* Material Preview */}
        <div className="p-2 rounded bg-white/5 border border-white/10 mb-3">
          <div className="text-white/70 mb-2 text-sm">Material Preview</div>
          <label className="flex items-center justify-between text-sm">
            <span>Use Preview</span>
            <input type="checkbox" checked={matPreview} onChange={(e) => setMatPreview(e.target.checked)} />
          </label>
          <div className="text-white/50 text-xs mt-1">
            Boosts lighting/exposure for quick material check.
          </div>
        </div>

        {/* Camera Bookmarks */}
        <div className="p-2 rounded bg-white/5 border border-white/10 mb-3">
          <div className="text-white/70 mb-2 text-sm">Camera Bookmarks</div>
          <div className="flex items-center gap-2">
            {["A", "B", "C", "D"].map((n) => (
              <button key={n} className="px-2 py-1 rounded bg-black/40 hover:bg-black/55" onClick={() => saveBookmark(n)}>
                Save {n}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {bookmarks.map((b, i) => (
              <button key={i} className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-xs" onClick={() => goBookmark(b)}>
                Go {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Existing: Render */}
        <div className="p-2 rounded bg-white/5 border border-white/10 mb-3">
          <div className="text-white/70 mb-2 text-sm">Render</div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setMode("pbr")}
              className={`px-2 py-1 rounded ${mode === "pbr" ? "bg-indigo-500/30" : "bg-black/40 hover:bg-black/55"}`}
            >
              Shaded
            </button>
            <button
              onClick={() => setMode("wire")}
              className={`px-2 py-1 rounded ${mode === "wire" ? "bg-indigo-500/30" : "bg-black/40 hover:bg-black/55"}`}
            >
              Wireframe
            </button>
            <button
              onClick={() => setMode("clay")}
              className={`px-2 py-1 rounded ${mode === "clay" ? "bg-indigo-500/30" : "bg-black/40 hover:bg-black/55"}`}
            >
              Clay
            </button>
            <label className="ml-2 flex items-center gap-2 text-white/80">
              <input
                type="checkbox"
                className="accent-indigo-400"
                checked={aoEnabled}
                onChange={(e) => setAoEnabled(e.target.checked)}
              />
              Ambient Occlusion
            </label>
          </div>
        </div>

        {/* Existing: Background */}
        <div className="p-2 rounded bg-white/5 border border-white/10 mb-3">
          <div className="text-white/70 mb-2 text-sm">Background</div>
          <div className="flex items-center gap-2">
            {(["dark", "light", "transparent"] as const).map((m) => (
              <button
                key={m}
                className={`px-2 py-1 rounded ${
                  bgMode === m ? "bg-indigo-500/30" : "bg-black/40 hover:bg-black/55"
                }`}
                onClick={() => setBgMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Existing: Properties */}
        <div className="p-2 rounded bg-white/5 border border-white/10">
          <div className="text-white/70 text-sm mb-2">Properties</div>
          <ul className="text-white/80 text-sm space-y-1">
            <li className="flex items-center justify-between">
              <span>Metalness</span>
              <span>{mode === "clay" ? "0.0" : "varies"}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Roughness</span>
              <span>{mode === "clay" ? "0.9" : "varies"}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Textures</span>
              <span>{mode === "pbr" ? "on" : "off"}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>AO</span>
              <span>{aoEnabled ? "enabled" : "disabled"}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Exposure</span>
              <span>{exposure.toFixed(2)}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Contrast</span>
              <span>{contrast.toFixed(2)}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

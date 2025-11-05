import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Product = {
  id: string;
  name: string;
  logo: string;        // public path to PNG/SVG
  summary: string;
  features: string[];
  price: string;       // formatted
  badge?: string;      // e.g., "Popular"
  colorFrom?: string;  // tailwind color token for gradient
  colorTo?: string;
};

const PRODUCTS: Product[] = [
  {
    id: 'autocad-automation',
    name: 'AutoCAD Automation Suite',
    logo: '/logo/autocad.png',
    summary: 'Macros, BOM extractors, spec sheets, and batch plot.',
    features: ['Spec-driven drawings', 'Title block sync', 'Batch PDF/DWF', 'BOM CSV export'],
    price: '₹29,900',
    badge: 'Popular',
    colorFrom: 'from-red-600',
    colorTo: 'to-rose-500',
  },
  {
    id: 'inventor-configurator',
    name: 'Inventor Configurator',
    logo: '/logo/inventor.png',
    summary: 'Parametric part/assembly generator with pricing.',
    features: ['Rules + iLogic', 'Variant BOM', 'DXF/DWG output', 'Quote sheet'],
    price: '₹49,900',
    colorFrom: 'from-amber-500',
    colorTo: 'to-yellow-500',
  },
  {
    id: 'solidworks-tools',
    name: 'SolidWorks Toolkit',
    logo: '/logo/solidworks.png',
    summary: 'Design checker, property sync, and drawing packager.',
    features: ['Model checker', 'Title block mapper', 'Pack & ship ZIP', 'Excel property bridge'],
    price: '₹39,900',
    colorFrom: 'from-red-500',
    colorTo: 'to-pink-600',
  },
  {
    id: 'revit-exporter',
    name: 'Revit Exporter',
    logo: '/logo/revit.png',
    summary: 'Clean RVT to IFC/GLTF pipeline for web/digital twin.',
    features: ['IFC MVD', 'GLTF/DRACO', 'Shared coords', 'Property mapping'],
    price: '₹59,900',
    colorFrom: 'from-blue-600',
    colorTo: 'to-sky-500',
  },
  {
    id: 'unity-viewer',
    name: 'Unity Viewer',
    logo: '/logo/unity.png',
    summary: 'Embeddable 3D model viewer with AR support.',
    features: ['WebGL embed', 'AR Quick Look', 'Annotations', 'S3 streaming'],
    price: '₹24,900',
    colorFrom: 'from-zinc-500',
    colorTo: 'to-neutral-700',
  },
  {
    id: 'unreal-twin',
    name: 'Unreal Digital Twin',
    logo: '/logo/unreal.png',
    summary: 'High‑fidelity twin with live telemetry and scenes.',
    features: ['MQTT/REST live data', 'Scenes & states', 'Cinematic shots', 'KPI dashboards'],
    price: '₹99,000',
    badge: 'Pro',
    colorFrom: 'from-emerald-500',
    colorTo: 'to-cyan-500',
  },
];

export default function ProductSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="product" className="relative py-20 md:py-28 bg-gradient-to-b from-navy via-graphite to-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white">
            Products <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#e53935_0%,#43a047_45%,#1e88e5_85%,#43a047_100%)]">Catalog</span>
          </h2>
          <p className="text-white/70 font-inter mt-3">Click any card to view details and buy.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => {
            const isOpen = openId === p.id;
            return (
              <motion.div
                key={p.id}
                layout
                onClick={() => setOpenId(isOpen ? null : p.id)}
                className="relative group cursor-pointer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{ background: 'linear-gradient(135deg, rgba(0,225,255,.18), rgba(122,0,255,.18))' }} />

                <motion.div
                  layout
                  className="relative rounded-2xl glass-morphism p-6 overflow-hidden"
                >
                  {/* Header row */}
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-cyan/10 to-purple/10 flex items-center justify-center">
                      <img src={p.logo} alt={p.name} className="max-w-12 max-h-12 object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-orbitron font-bold text-lg truncate">{p.name}</h3>
                      <div className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs text-white bg-gradient-to-r ${p.colorFrom ?? 'from-cyan'} ${p.colorTo ?? 'to-purple'}`}>
                        {p.badge ?? 'Standard'}
                      </div>
                    </div>
                    <div className="ml-auto text-cyan font-orbitron font-bold">{p.price}</div>
                  </div>

                  {/* Summary (always visible) */}
                  <p className="text-white/70 font-inter mt-4">{p.summary}</p>

                  {/* Expandable details */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <ul className="space-y-2 text-white/80 font-inter">
                          {p.features.map((f) => (
                            <li key={f} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan/80" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-5 flex items-center gap-3">
                          <button
                            className={`px-4 py-2 rounded-lg text-white font-inter neon-glow-cyan bg-gradient-to-r ${p.colorFrom ?? 'from-cyan'} ${p.colorTo ?? 'to-purple'}`}
                            onClick={(e) => { e.stopPropagation(); alert(`Buying ${p.name}`); }}
                          >
                            Buy Now
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg text-cyan border border-cyan/40 hover:bg-cyan/10 font-inter"
                            onClick={(e) => { e.stopPropagation(); alert(`Requesting demo for ${p.name}`); }}
                          >
                            Request Demo
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

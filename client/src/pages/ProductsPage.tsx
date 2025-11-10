import React, { useState } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { routes } from '../routes';

type Product = {
  id: string;
  name: string;
  logo: string;
  summary: string;
  features: string[];
  price: string;
  badge?: string;
  colorFrom?: string;
  colorTo?: string;
  disabled?: boolean;
};

const PRODUCTS: Product[] = [
  {
    id: 'viewer',
    name: '3D Viewer',
    logo: '/logo/viewer.png',
    summary: 'Fast GLTF/IFC preview with orbit, fit, grid, and contact shadows.',
    features: ['GLTF/GLB support', 'Orbit + Fit view', 'Contact shadows', 'Annotations (soon)'],
    price: 'Free',
    badge: 'Ready',
    colorFrom: 'from-blue-600',
    colorTo: 'to-sky-500',
  },
  {
    id: 'comparer',
    name: 'Model Comparer',
    logo: '/logo/comparer.png',
    summary: 'Side‑by‑side or diff overlay to compare revisions.',
    features: ['Geometry diff', 'Property diff', 'Color-coded changes', 'Report export'],
    price: 'Coming soon',
    badge: 'Preview',
    colorFrom: 'from-red-600',
    colorTo: 'to-rose-500',
    disabled: true,
  },
  {
    id: 'converter',
    name: 'Format Converter',
    logo: '/logo/converter.png',
    summary: 'Convert CAD/BIM to GLTF/IFC/DRACO for web pipelines.',
    features: ['IFC/GLTF/DRACO', 'Property mapping', 'Shared coords', 'Batch convert'],
    price: 'Coming soon',
    badge: 'Preview',
    colorFrom: 'from-emerald-500',
    colorTo: 'to-cyan-500',
    disabled: true,
  },
];

export default function ProductsPage() {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleClick = (p: Product) => {
    if (p.disabled) return;
    if (p.id === 'viewer') navigate(routes.product(p.id));
  };

  return (
    <section id="product" className="relative py-20 md:py-28 bg-gradient-to-b from-navy via-graphite to-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white/90 backdrop-blur-md border border-white/20 transition transform hover:-translate-x-0.5 hover:shadow-lg shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white">
            Products <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#e53935_0%,#43a047_45%,#1e88e5_85%,#43a047_100%)]">Catalog</span>
          </h2>
          <p className="text-white/70 font-inter mt-3">Hover to preview • Click Viewer to open details</p>
        </div>

        <LayoutGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {PRODUCTS.map((p) => {
              const isHover = hoverId === p.id;
              return (
                <motion.div
                  key={p.id}
                  layout
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId((id) => (id === p.id ? null : id))}
                  onClick={() => handleClick(p)}
                  className="relative"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* aura glow — keep pointer-events none */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl blur-xl opacity-0 transition-opacity duration-500"
                    style={{
                      opacity: isHover ? 1 : 0,
                      background: 'linear-gradient(135deg, rgba(0,225,255,.18), rgba(122,0,255,.18))',
                    }}
                  />

                  <motion.div
                    layout
                    transition={{ layout: { duration: 0.25 } }}
                    className={`relative rounded-2xl glass-morphism p-6 overflow-hidden border border-white/10 ${isHover ? 'scale-[1.02]' : ''
                      } ${p.disabled ? 'cursor-default' : 'cursor-pointer'}`}
                  >
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

                    <motion.p layout className="text-white/80 font-inter mt-4">{p.summary}</motion.p>

                    <AnimatePresence initial={false}>
                      {isHover && (
                        <motion.ul
                          key="hover"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 space-y-1.5 text-white/80 font-inter"
                        >
                          {p.features.map((f) => (
                            <li key={f} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan/80" />
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
}

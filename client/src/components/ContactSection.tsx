import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";

function ParticleWave() {
  const pointsRef = useRef<THREE.Points>(null);

  const particleCount = 5000;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  useFrame((state) => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = pos[i3];
        const z = pos[i3 + 2];
        pos[i3 + 1] =
          Math.sin(x * 0.3 + state.clock.elapsedTime) *
          Math.cos(z * 0.3 + state.clock.elapsedTime) *
          2;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <points ref={pointsRef} geometry={particles}>
      <pointsMaterial
        size={0.05}
        color="#00E1FF"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

type DemoPayload = { name: string; email: string };

function DemoModal({
  onClose,
  onKeyDown,
  onSubmit,
}: {
  onClose: () => void;
  onKeyDown: (e: React.KeyboardEvent | KeyboardEvent) => void;
  onSubmit: (payload: DemoPayload) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  useEffect(() => {
    const input = cardRef.current?.querySelector(
      'input[name="demoName"]'
    ) as HTMLInputElement | null;
    input?.focus();
    const handler = (ev: KeyboardEvent) => onKeyDown(ev);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onKeyDown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setBusy(true);
    try {
      await onSubmit({ name: name.trim(), email: email.trim() });
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-title"
      onClick={onBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        ref={cardRef}
        className="w-full max-w-md mx-4 glass-morphism rounded-2xl p-6 shadow-xl border border-white/10"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between mb-4">
          <h3
            id="demo-title"
            className="text-xl md:text-2xl font-orbitron font-bold text-white"
          >
            Book a Demo
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-white/70 font-inter mb-6">
          Share your details and the team will reach out to schedule a personalized walkthrough.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 font-inter mb-2" htmlFor="demoName">
              Name
            </label>
            <input
              id="demoName"
              name="demoName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 glass-morphism rounded-lg text-white font-inter focus:neon-glow-cyan focus:outline-none transition-all"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 font-inter mb-2" htmlFor="demoEmail">
              Email
            </label>
            <input
              id="demoEmail"
              name="demoEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 glass-morphism rounded-lg text-white font-inter focus:neon-glow-cyan focus:outline-none transition-all"
              placeholder="you@company.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan to-purple rounded-lg text-white font-inter font-semibold text-base neon-glow-cyan hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Booking…" : "Book Demo"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function ContactSection() {
  const [demoOpen, setDemoOpen] = useState(false);

  function onKeyDown(e: React.KeyboardEvent | KeyboardEvent) {
    if (e.key === "Escape") setDemoOpen(false);
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    website: "", // honeypot (hidden)
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      console.log("📤 Sending contact form data...");
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Response data:", data);

      if (data?.success) {
        setSubmitStatus({
          type: "success",
          message: data.message || "Thanks! We will contact you soon.",
        });
        setFormData({
          name: "",
          email: "",
          company: "",
          message: "",
          website: "",
        });
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus({
          type: "error",
          message: data?.message || "Failed to submit form",
        });
      }
    } catch (err: any) {
      console.error("❌ Form submission error:", err?.message || err);
      setSubmitStatus({
        type: "error",
        message: err?.message || "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Demo form submission handler
  const handleDemoSubmit = async (payload: DemoPayload) => {
    try {
      console.log("📤 Sending demo request...");
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          company: "", // Optional: could add company field to demo modal
          message: "🎯 [DEMO REQUEST] Please contact me to schedule a personalized demo.",
          website: "", // honeypot empty
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Demo request response:", data);

      if (data?.success) {
        setSubmitStatus({
          type: "success",
          message: "Demo request received! We'll contact you shortly.",
        });
        setTimeout(() => setSubmitStatus(null), 5000);
        setDemoOpen(false);
      } else {
        throw new Error(data?.message || "Demo request failed");
      }
    } catch (err: any) {
      console.error("❌ Demo request error:", err?.message || err);
      setSubmitStatus({
        type: "error",
        message: err?.message || "Failed to book demo. Please try again.",
      });
    }
  };

  return (
    <section
      id="contact"
      className="relative py-20 md:py-32 bg-gradient-to-b from-navy via-graphite to-navy overflow-hidden"
    >
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <ParticleWave />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-graphite/80 to-navy/80" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6 text-glow-purple">
            Ready to Automate Your <span className="text-cyan">Design Process?</span>
          </h2>
          <p className="text-xl md:text-2xl font-inter text-white/80 max-w-3xl mx-auto">
            Let's build the future—together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-morphism rounded-2xl p-8 md:p-10"
          >
            <h3 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-6">
              Get in Touch
            </h3>

            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
              {/* Honeypot field */}
              <input
                type="text"
                name="website"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                onChange={handleChange}
                value={formData.website}
              />

              <div>
                <label className="block text-white/80 font-inter mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass-morphism rounded-lg text-white font-inter focus:neon-glow-cyan focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 font-inter mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass-morphism rounded-lg text-white font-inter focus:neon-glow-cyan focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 font-inter mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass-morphism rounded-lg text-white font-inter focus:neon-glow-cyan focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-white/80 font-inter mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 glass-morphism rounded-lg text-white font-inter focus:neon-glow-cyan focus:outline-none transition-all resize-none"
                  required
                />
              </div>

              {submitStatus && (
                <div
                  className={`p-4 rounded-lg ${submitStatus.type === "success"
                      ? "bg-cyan/20 border border-cyan"
                      : "bg-red-500/20 border border-red-500"
                    }`}
                >
                  <p className="text-white font-inter text-sm">{submitStatus.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-cyan to-purple rounded-lg text-white font-inter font-semibold text-lg neon-glow-cyan hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Get in Touch"}
              </button>
            </form>
          </motion.div>

          {/* Right: Info & Demo Button */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="glass-morphism rounded-2xl p-8">
              <h3 className="text-2xl font-orbitron font-bold text-white mb-4">
                Why Choose Cadster?
              </h3>
              <ul className="space-y-4">
                {[
                  'Innovative design automation powered by AI and machine learning',
                  'Streamlined workflows that reduce design time and errors',
                  'Future-proof integration with your engineering infrastructure',
                  'Custom-built automation solutions tailored to your business',
                  'Dedicated support and continuous system optimization',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80 font-inter">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-morphism rounded-2xl p-8 text-center">
              <h4 className="text-xl font-orbitron font-bold text-white mb-4">
                Prefer a Demo?
              </h4>
              <p className="text-white/70 font-inter mb-6">
                See our solutions in action with a personalized demonstration
              </p>
              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="px-8 py-3 glass-morphism rounded-lg text-white font-inter font-semibold hover:neon-glow-purple hover:scale-105 transition-all"
              >
                Book a Demo
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Demo Modal */}
      {demoOpen && (
        <DemoModal
          onClose={() => setDemoOpen(false)}
          onKeyDown={onKeyDown}
          onSubmit={handleDemoSubmit}
        />
      )}
    </section>
  );
}

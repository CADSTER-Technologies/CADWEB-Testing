import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [reveal, setReveal] = useState(false);
  const logoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const set = () => {
      const small = window.matchMedia("(max-width: 767.98px)").matches;
      if (!small) setReveal(true);
      else setReveal(false);
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);

  const isSmallScreen = () => window.matchMedia("(max-width: 767.98px)").matches;

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isSmallScreen()) return;
    const touch = e.touches?.[0];
    if (!touch) return;
    const r = logoRef.current?.getBoundingClientRect();
    if (!r) return;

    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = touch.clientX - cx;
    const dy = touch.clientY - cy;
    const d = Math.hypot(dx, dy);
    setReveal(d < 120);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isSmallScreen()) return;
    const r = logoRef.current?.getBoundingClientRect();
    if (!r) return;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    setReveal(d < 120);
  };

  const onTouchEnd = () => {
    if (isSmallScreen()) {
      setTimeout(() => setReveal(false), 80);
    }
  };

  const onMouseLeave = () => {
    if (isSmallScreen()) {
      setTimeout(() => setReveal(false), 80);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Product", href: "/products" },
    { name: "Technology", href: "#technology" },
    { name: "Contact", href: "#contact" },
  ];

  const closeMenu = () => setIsOpen(false);

  const logoText = "CADSTER";

  // Letter animation variants for mobile - opens left to right, closes right to left
  const containerVariants = {
    hidden: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,// Reverse direction for exit
        when: "afterChildren",
        duration: 0.12,

      },
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        staggerDirection: 1, // Forward direction for entrance
        when: "beforeChildren",
        duration: 0.2,
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      x: -10,
      y: -2,
      filter: "blur(4px)",
      transition: {
        duration: 0.18,
        ease: [0.4, 0, 0.2, 1],
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-morphism shadow-lg" : "bg-transparent"
        }`}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 overflow-hidden"
          >
            <div
              ref={logoRef}
              className={`w-10 h-10 rounded-lg flex items-center justify-center
                } cursor-pointer md:cursor-default flex-shrink-0`}
            >
              <img
                src="/logo/cadster_logo.png"
                alt="Cadster Logo"
                className="w-12 h-12 object-contain"
              />
            </div>

            {/* Desktop: Always visible with STATIC gradient (no animation) */}
            <span className="hidden md:inline-block font-orbitron font-bold text-2xl text-transparent bg-clip-text
              bg-[linear-gradient(90deg,#e53935_0%,#43a047_45%,#1e88e5_85%,#43a047_100%)]
              drop-shadow-[0_0_8px_rgba(30,136,229,0.35)]
              whitespace-nowrap">
              CADSTER
            </span>

            {/* Mobile: Letter-by-letter animated text on hover */}
            <div className="md:hidden">
              <AnimatePresence mode="wait">
                {reveal && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="flex"
                  >
                    {logoText.split("").map((letter, index) => (
                      <motion.span
                        key={`${letter}-${index}`}
                        variants={letterVariants}
                        className="font-orbitron font-bold text-xl text-transparent bg-clip-text
bg-[linear-gradient(90deg,#e53935_0%,#43a047_45%,#1e88e5_85%,#43a047_100%)]
drop-shadow-[0_0_8px_rgba(30,136,229,0.35)]
inline-block"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-white/80 hover:text-cyan transition-colors duration-300 font-inter text-base md:text-lg"
              >
                {item.name}
              </motion.a>
            ))}

          </div>

          <div className="md:hidden">
            <button
              aria-label="Open menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((v) => !v)}
              className="text-white p-2 focus:outline-none focus:ring-2 focus:ring-cyan rounded"
            >
              {!isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-4/5 max-w-xs md:hidden bg-[#0b0f18] border-l border-white/10 shadow-xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div className="p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo/cadster_logo.png"
                    alt="Cadster Logo"
                    className="w-8 h-8"
                  />
                  <span className="font-orbitron font-semibold text-transparent bg-clip-text
                    bg-[linear-gradient(90deg,#e53935_0%,#43a047_45%,#1e88e5_85%,#43a047_100%)]">
                    CADSTER
                  </span>
                </div>
                <button
                  aria-label="Close menu"
                  onClick={closeMenu}
                  className="p-2 text-white/80"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <nav className="p-4 flex flex-col gap-2">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={closeMenu}
                    className="block rounded px-3 py-3 text-white/90 hover:bg-white/10 transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
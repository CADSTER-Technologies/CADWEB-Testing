import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-14 h-7 glass-morphism rounded-full" />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-14 h-7 glass-morphism rounded-full flex items-center px-1 transition-all"
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-5 h-5 bg-gradient-to-br from-cyan to-purple rounded-full flex items-center justify-center"
        animate={{
          x: theme === 'dark' ? 0 : 28
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {theme === 'dark' ? (
          <FiMoon className="text-white text-xs" />
        ) : (
          <FiSun className="text-white text-xs" />
        )}
      </motion.div>
    </motion.button>
  );
}

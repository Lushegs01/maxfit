import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 800);
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#06060E] flex flex-col items-center justify-center"
      exit={{
        opacity: 0,
        scale: 1.1,
        filter: 'blur(20px)',
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 55% at 50% 50%, rgba(255, 107, 44, 0.12) 0%, transparent 60%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Logo Animation */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Icon with pulse */}
        <motion.div
          className="relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: 0.2
          }}
        >
          <motion.div
            className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-white"
            style={{
              boxShadow: '0 4px 24px rgba(255, 107, 44, 0.35), 0 0 60px rgba(255, 107, 44, 0.20)'
            }}
            animate={{
              boxShadow: [
                '0 4px 24px rgba(255, 107, 44, 0.35), 0 0 60px rgba(255, 107, 44, 0.20)',
                '0 4px 32px rgba(255, 107, 44, 0.50), 0 0 80px rgba(255, 107, 44, 0.30)',
                '0 4px 24px rgba(255, 107, 44, 0.35), 0 0 60px rgba(255, 107, 44, 0.20)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src="/logo.jpg"
              alt="MaxFit Logo"
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                // Fallback text if image isn't found
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </motion.div>

          {/* Orbiting ring */}
          <motion.div
            className="absolute -inset-4 rounded-[2rem] border-2 border-dashed border-[rgba(255,107,44,0.25)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Brand Name */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h1
            className="font-display text-5xl tracking-[8px] text-foreground"
            style={{ textShadow: '0 0 40px rgba(255,107,44,0.30)' }}
          >
            MAXFIT
          </h1>
          <motion.p
            className="text-sm text-[rgba(245,245,240,0.40)] mt-2 tracking-[4px] uppercase font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Session Tracker
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="w-48 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF6B2C] to-[#FF8A50] rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Loading percentage */}
        <motion.p
          className="text-xs text-[rgba(245,245,240,0.30)] font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {Math.min(Math.round(progress), 100)}%
        </motion.p>
      </div>

      {/* Exit animation overlay */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            className="absolute inset-0 bg-[#06060E]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

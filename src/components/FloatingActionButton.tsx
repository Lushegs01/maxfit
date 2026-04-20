import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Dumbbell, UserPlus, X } from 'lucide-react';

interface FloatingActionButtonProps {
  onQuickLog: () => void;
  onAddAthlete: () => void;
}

export default function FloatingActionButton({ onQuickLog, onAddAthlete }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleQuickLog = () => {
    onQuickLog();
    setIsOpen(false);
  };

  const handleAddAthlete = () => {
    onAddAthlete();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              style={{ zIndex: -1 }}
            />
            
            {/* Menu Items */}
            <div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end">
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: 0.1 }}
                onClick={handleQuickLog}
                className="flex items-center gap-3 group"
              >
                <span className="text-sm font-medium text-foreground bg-[rgba(12,12,24,0.90)] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)]">
                  Quick Workout
                </span>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B2C] to-[#FF4500] flex items-center justify-center shadow-lg shadow-[rgba(255,107,44,0.35)]">
                  <Dumbbell size={20} className="text-white" />
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                onClick={handleAddAthlete}
                className="flex items-center gap-3 group"
              >
                <span className="text-sm font-medium text-foreground bg-[rgba(12,12,24,0.90)] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)]">
                  Add Athlete
                </span>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[rgba(167,139,250,0.35)]">
                  <UserPlus size={20} className="text-white" />
                </div>
              </motion.button>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B2C] to-[#FF4500] flex items-center justify-center shadow-lg shadow-[rgba(255,107,44,0.40)]"
        style={{
          boxShadow: '0 4px 24px rgba(255, 107, 44, 0.35), 0 0 60px rgba(255, 107, 44, 0.20)'
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {isOpen ? (
            <X size={24} className="text-white" />
          ) : (
            <Plus size={24} className="text-white" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}

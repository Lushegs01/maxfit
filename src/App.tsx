import { lazy, Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  History, 
  Target,
} from 'lucide-react';
import type { ViewType, WorkoutSession } from '@/types';
import { StorageProvider, useStorage } from '@/context/StorageContext';
import Preloader from '@/sections/Preloader';
import FloatingActionButton from '@/components/FloatingActionButton';
import confetti from 'canvas-confetti';

const Dashboard = lazy(() => import('@/sections/Dashboard'));
const Athletes = lazy(() => import('@/sections/Athletes'));
const SessionTracker = lazy(() => import('@/sections/SessionTracker'));
const Progress = lazy(() => import('@/sections/Progress'));
const HistoryView = lazy(() => import('@/sections/HistoryView'));
const Goals = lazy(() => import('@/sections/Goals'));

const navItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'athletes', label: 'Athletes', icon: Users },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'history', label: 'History', icon: History },
  { id: 'goals', label: 'Goals', icon: Target },
];

const viewTitles: Record<ViewType, string> = {
  dashboard: 'Dashboard',
  athletes: 'Athletes',
  session: 'Live Session',
  progress: 'Progress',
  history: 'History',
  goals: 'Goals',
};

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ViewFallback() {
  return (
    <div className="glass-card flex min-h-[280px] items-center justify-center rounded-2xl">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[rgba(255,255,255,0.15)] border-t-[#FF6B2C]" />
        <p className="text-sm text-muted-foreground">Loading view...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [showPreloader, setShowPreloader] = useState(true);
  
  const storage = useStorage();

  const handlePreloaderComplete = () => setShowPreloader(false);

  const handleStartSession = (athleteId: string, athleteName: string) => {
    const newSession: WorkoutSession = {
      id: createSessionId(),
      athleteId,
      athleteName,
      date: new Date().toISOString(),
      exercises: [],
      notes: '',
      duration: 0,
      caloriesBurned: 0
    };
    setActiveSession(newSession);
    setCurrentView('session');
  };

  const handleCompleteSession = (session: WorkoutSession) => {
    storage.saveSession(session);
    setActiveSession(null);
    setCurrentView('dashboard');
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B2C', '#00E87A', '#A78BFA', '#FF8A50']
    });
    
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { y: 0.8 },
        colors: ['#FF6B2C', '#00E87A']
      });
    }, 300);
  };

  const handleCancelSession = () => {
    setActiveSession(null);
    setCurrentView('dashboard');
  };

  const handleQuickLog = () => {
    if (storage.athletes.length > 0) {
      handleStartSession(storage.athletes[0].id, storage.athletes[0].name);
    } else {
      setCurrentView('athletes');
    }
  };

  if (!storage.isLoaded) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-6rem] top-[-6rem] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,107,44,0.20),transparent_70%)] blur-2xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,232,122,0.14),transparent_72%)] blur-3xl" />
      </div>
      <AnimatePresence>
        {showPreloader && (
          <Preloader onComplete={handlePreloaderComplete} />
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 bg-[rgba(6,6,14,0.80)] backdrop-blur-2xl saturate-[1.6] border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-4">
          <motion.h1 
            key={currentView}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl tracking-[3px] text-foreground uppercase"
          >
            {viewTitles[currentView]}
          </motion.h1>
          <div className="flex items-center gap-3">
            <span className="font-display text-xl tracking-[5px] text-[#FF6B2C]" style={{ textShadow: '0 0 24px rgba(255,107,44,0.45)' }}>
              MAXFIT
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-lg mx-auto px-4 pt-5 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -18, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<ViewFallback />}>
              {currentView === 'dashboard' && <Dashboard onStartSession={handleStartSession} />}
              {currentView === 'athletes' && <Athletes onStartSession={handleStartSession} />}
              {currentView === 'session' && activeSession && (
                <SessionTracker
                  session={activeSession}
                  onComplete={handleCompleteSession}
                  onCancel={handleCancelSession}
                />
              )}
              {currentView === 'progress' && <Progress />}
              {currentView === 'history' && <HistoryView />}
              {currentView === 'goals' && <Goals />}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <FloatingActionButton 
        onQuickLog={handleQuickLog}
        onAddAthlete={() => setCurrentView('athletes')}
      />

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(6,6,14,0.85)] backdrop-blur-2xl saturate-[1.6] border-t border-[rgba(255,255,255,0.08)] pb-safe">
        <div className="max-w-lg mx-auto flex justify-around items-center px-2 py-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const isDisabled = currentView === 'session';
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && setCurrentView(item.id)}
                disabled={isDisabled}
                className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
                  isActive ? 'text-[#FF6B2C] bg-[rgba(255,107,44,0.08)]' : 'text-[rgba(245,245,240,0.18)] hover:text-[rgba(245,245,240,0.60)]'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <motion.div
                  animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                </motion.div>
                <span className="text-[10px] font-semibold tracking-[1px] uppercase">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#FF6B2C]"
                    style={{ boxShadow: '0 0 8px rgba(255,107,44,0.45)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <StorageProvider>
      <AppContent />
    </StorageProvider>
  );
}

export default App;

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Athlete, WorkoutSession, FitnessGoal } from '@/types';
import { sampleAthletes, sampleSessions, sampleGoals } from '@/data/sampleData';

const STORAGE_KEYS = {
  athletes: 'maxfit-athletes',
  sessions: 'maxfit-sessions',
  goals: 'maxfit-goals',
  initialized: 'maxfit-initialized'
};

interface StorageContextType {
  athletes: Athlete[];
  sessions: WorkoutSession[];
  goals: FitnessGoal[];
  isLoaded: boolean;
  saveAthlete: (athlete: Athlete) => void;
  deleteAthlete: (id: string) => void;
  saveSession: (session: WorkoutSession) => void;
  deleteSession: (id: string) => void;
  saveGoal: (goal: FitnessGoal) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, value: number) => void;
  getWeeklyStats: () => {
    totalWorkouts: number;
    totalCalories: number;
    activeMinutes: number;
    currentStreak: number;
    personalRecords: number;
  };
}

const StorageContext = createContext<StorageContextType | null>(null);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = useCallback(() => {
    try {
      const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
      
      if (!initialized) {
        localStorage.setItem(STORAGE_KEYS.athletes, JSON.stringify(sampleAthletes));
        localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sampleSessions));
        localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(sampleGoals));
        localStorage.setItem(STORAGE_KEYS.initialized, 'true');
        
        setAthletes(sampleAthletes);
        setSessions(sampleSessions);
        setGoals(sampleGoals);
      } else {
        const storedAthletes = localStorage.getItem(STORAGE_KEYS.athletes);
        const storedSessions = localStorage.getItem(STORAGE_KEYS.sessions);
        const storedGoals = localStorage.getItem(STORAGE_KEYS.goals);
        
        setAthletes(storedAthletes ? JSON.parse(storedAthletes) : []);
        setSessions(storedSessions ? JSON.parse(storedSessions) : []);
        setGoals(storedGoals ? JSON.parse(storedGoals) : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync on mount and when other tabs change local storage
  useEffect(() => {
    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || Object.values(STORAGE_KEYS).includes(e.key)) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  const saveAthlete = useCallback((athlete: Athlete) => {
    setAthletes(prev => {
      const existing = prev.findIndex(a => a.id === athlete.id);
      const updated = existing >= 0 
        ? prev.map(a => a.id === athlete.id ? athlete : a)
        : [...prev, athlete];
      localStorage.setItem(STORAGE_KEYS.athletes, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteAthlete = useCallback((id: string) => {
    setAthletes(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.athletes, JSON.stringify(updated));
      return updated;
    });
    setSessions(prev => {
      const updated = prev.filter(s => s.athleteId !== id);
      localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const saveSession = useCallback((session: WorkoutSession) => {
    setSessions(prev => {
      const existing = prev.findIndex(s => s.id === session.id);
      const updated = existing >= 0
        ? prev.map(s => s.id === session.id ? session : s)
        : [...prev, session];
      localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const saveGoal = useCallback((goal: FitnessGoal) => {
    setGoals(prev => {
      const existing = prev.findIndex(g => g.id === goal.id);
      const updated = existing >= 0
        ? prev.map(g => g.id === goal.id ? goal : g)
        : [...prev, goal];
      localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== id);
      localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateGoalProgress = useCallback((id: string, value: number) => {
    setGoals(prev => {
      const updated = prev.map(g => 
        g.id === id ? { ...g, currentValue: Math.min(value, g.targetValue) } : g
      );
      localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getWeeklyStats = useCallback(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thisWeekSessions = sessions.filter(s => new Date(s.date).getTime() > weekAgo);
    
    return {
      totalWorkouts: thisWeekSessions.length,
      totalCalories: thisWeekSessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0),
      activeMinutes: Math.round(thisWeekSessions.reduce((sum, s) => sum + s.duration, 0) / 60),
      currentStreak: calculateStreak(sessions),
      personalRecords: Math.floor(thisWeekSessions.length * 0.3)
    };
  }, [sessions]);

  return (
    <StorageContext.Provider value={{
      athletes, sessions, goals, isLoaded,
      saveAthlete, deleteAthlete, saveSession, deleteSession,
      saveGoal, deleteGoal, updateGoalProgress, getWeeklyStats
    }}>
      {children}
    </StorageContext.Provider>
  );
}

// Fixed timezone issue by normalizing to local midnight timestamp for comparisons
function calculateStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  
  // Normalize date to local midnight properly
  const getLocalMidnight = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };

  const sortedDates = [...new Set(sessions.map(s => getLocalMidnight(s.date)))]
    .sort((a, b) => b - a);
  
  let streak = 0;
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const dateTimestamp = sortedDates[i];
    const diffDays = Math.round((todayMidnight - dateTimestamp) / (1000 * 60 * 60 * 24));
    
    // Check if the sequence continues properly
    if (diffDays === i || (i === 0 && diffDays <= 1)) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}

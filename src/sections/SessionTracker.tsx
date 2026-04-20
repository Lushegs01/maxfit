import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Plus, 
  Minus,
  X, 
  Search,
  Flame
} from 'lucide-react';
import type { WorkoutSession, Exercise } from '@/types';
import { exerciseDB, exerciseCategories } from '@/data/exercises';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SessionTrackerProps {
  session: WorkoutSession;
  onComplete: (session: WorkoutSession) => void;
  onCancel: () => void;
}

export default function SessionTracker({ session, onComplete, onCancel }: SessionTrackerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>(session.exercises);
  const [notes, setNotes] = useState(session.notes);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  
  const startTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  // Timer logic - Absolute time mapping prevents drift in background tabs
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000) + accumulatedTimeRef.current;
        setElapsed(currentElapsed);
        setCaloriesBurned(Math.round((currentElapsed / 60) * 7));
      }, 1000);
    } else {
      accumulatedTimeRef.current = elapsedRef.current;
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const addExercise = (name: string) => {
    const newExercise: Exercise = {
      name,
      sets: ['', '', '', ''],
      target: '',
      completed: false
    };
    setExercises(prev => [...prev, newExercise]);
    setShowExerciseModal(false);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: unknown) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, value: string) => {
    setExercises(prev => {
      const updated = [...prev];
      const newSets = [...updated[exerciseIndex].sets];
      newSets[setIndex] = value;
      updated[exerciseIndex] = { ...updated[exerciseIndex], sets: newSets };
      return updated;
    });
  };

  const addSet = (exerciseIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex] = { ...updated[exerciseIndex], sets: [...updated[exerciseIndex].sets, ''] };
      return updated;
    });
  };

  const removeLastSet = (exerciseIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      if (updated[exerciseIndex].sets.length > 1) {
        updated[exerciseIndex] = { ...updated[exerciseIndex], sets: updated[exerciseIndex].sets.slice(0, -1) };
      }
      return updated;
    });
  };

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const completedSession: WorkoutSession = {
      ...session,
      exercises,
      notes,
      duration: elapsed,
      caloriesBurned
    };
    onComplete(completedSession);
  };

  const getFilteredExercises = () => {
    if (!searchQuery) return exerciseDB;
    const filtered: Record<string, string[]> = {};
    for (const [category, exercises] of Object.entries(exerciseDB)) {
      const matched = exercises.filter(ex => 
        ex.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matched.length > 0) {
        filtered[category] = matched;
      }
    }
    return filtered;
  };

  const filteredExercises = getFilteredExercises();
  const completedCount = exercises.filter(e => e.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <Card className="glass-card p-5 border-l-[3px] border-l-[#FF6B2C] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,107,44,0.04)] to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-[2px] text-foreground">
              {session.athleteName}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{exercises.length} exercises</span>
              <span>·</span>
              <span>{completedCount} completed</span>
            </div>
          </div>
          <motion.div 
            className="timer-pulse bg-[rgba(255,107,44,0.10)] px-4 py-2 rounded-xl border border-[rgba(255,107,44,0.15)]"
          >
            <span className="font-mono text-xl text-[#FF6B2C] tracking-[2px]">
              {formatTime(elapsed)}
            </span>
          </motion.div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={() => setIsRunning(!isRunning)}
          variant="outline"
          className={`flex-1 ${isRunning ? 'border-[rgba(255,200,0,0.30)] text-[#FFD000]' : 'border-[rgba(0,232,122,0.30)] text-[#00E87A]'}`}
        >
          {isRunning ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
          {isRunning ? 'Pause' : 'Resume'}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="border-[rgba(255,68,85,0.25)] text-[#FF4455]"
        >
          <X size={16} />
        </Button>
      </div>

      <motion.div 
        className="flex items-center justify-center gap-2 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Flame size={16} className="text-[#FF6B2C]" />
        <span className="text-sm text-muted-foreground">
          <span className="text-[#FF6B2C] font-semibold">{caloriesBurned}</span> calories burned
        </span>
      </motion.div>

      <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
        <DialogTrigger asChild>
          <button className="w-full py-3.5 bg-[rgba(255,107,44,0.08)] border border-[rgba(255,107,44,0.20)] rounded-xl text-[#FF6B2C] font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:bg-[rgba(255,107,44,0.14)]">
            <Plus size={18} />
            Add Exercise
          </button>
        </DialogTrigger>
        <DialogContent className="bg-[#0E0E1C] border border-[rgba(255,255,255,0.08)] text-foreground max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-[2px]">
              Add Exercise
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative mt-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="pl-9 bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] focus:border-[#FF6B2C]"
            />
          </div>

          <div className="mt-4 space-y-4">
            {Object.entries(filteredExercises).map(([category, exercises]) => {
              const catConfig = exerciseCategories.find(c => c.key === category);
              if (!catConfig) return null;
              
              return (
                <div key={category}>
                  <div className="text-[10px] font-bold tracking-[2.5px] uppercase text-[#FF6B2C] pb-2 mb-2 border-b border-[rgba(255,255,255,0.07)]">
                    {catConfig.icon} {catConfig.label}
                  </div>
                  <div className="space-y-1">
                    {exercises.map(exercise => (
                      <motion.div
                        key={exercise}
                        whileHover={{ x: 4, backgroundColor: 'rgba(255,107,44,0.06)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addExercise(exercise)}
                        className="flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors group"
                      >
                        <span>{exercise}</span>
                        <Plus size={16} className="text-[#FF6B2C] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
            {Object.keys(filteredExercises).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No exercises found.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence mode="popLayout">
        {exercises.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-4xl mb-3 float-animation">💪</div>
            <p className="text-sm text-muted-foreground">
              Add exercises to start tracking
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise, exIndex) => (
              <motion.div
                key={`${exercise.name}-${exIndex}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: exIndex * 0.05 }}
              >
                <Card className={`glass-card p-4 ${exercise.completed ? 'border-[rgba(0,232,122,0.30)]' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateExercise(exIndex, 'completed', !exercise.completed)}
                        className="transition-transform hover:scale-110"
                      >
                        <CheckCircle2 
                          size={20} 
                          className={exercise.completed ? 'text-[#00E87A]' : 'text-muted-foreground'} 
                        />
                      </button>
                      <span className={`font-medium text-sm ${exercise.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {exercise.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeExercise(exIndex)}
                      className="text-muted-foreground hover:text-[#FF4455] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-end gap-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="text-center w-14">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          S{setIndex + 1}
                        </span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={set}
                          onChange={(e) => updateSet(exIndex, setIndex, e.target.value)}
                          placeholder="—"
                          className="w-full h-10 text-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg font-mono text-sm text-foreground focus:border-[#FF6B2C] focus:bg-[rgba(255,107,44,0.06)] outline-none transition-all"
                        />
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-1 mb-1">
                      <button 
                        onClick={() => addSet(exIndex)} 
                        className="w-8 h-8 rounded-lg bg-[rgba(255,107,44,0.1)] border border-[rgba(255,107,44,0.15)] flex items-center justify-center text-[#FF6B2C] hover:bg-[rgba(255,107,44,0.2)] transition-colors"
                        title="Add Set"
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        onClick={() => removeLastSet(exIndex)} 
                        disabled={exercise.sets.length <= 1}
                        className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-muted-foreground hover:bg-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-30 disabled:hover:bg-[rgba(255,255,255,0.05)]"
                        title="Remove Last Set"
                      >
                        <Minus size={14} />
                      </button>
                    </div>

                    <div className="text-center w-16 ml-auto">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        TGT KG
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={exercise.target}
                        onChange={(e) => updateExercise(exIndex, 'target', e.target.value)}
                        placeholder="—"
                        className="w-full h-10 text-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg font-mono text-sm text-[#FF6B2C] focus:border-[#FF6B2C] focus:bg-[rgba(255,107,44,0.06)] outline-none transition-all"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {exercises.length > 0 && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-[2px] uppercase text-muted-foreground">
            Session Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Fatigue levels, pain points, form notes..."
            className="w-full min-h-[100px] p-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-foreground placeholder:text-[rgba(245,245,240,0.18)] focus:border-[#FF6B2C] focus:bg-[rgba(255,107,44,0.04)] outline-none resize-none transition-all"
          />
        </div>
      )}

      {exercises.length > 0 && (
        <Button
          onClick={handleComplete}
          className="w-full btn-gradient text-white py-6 text-base"
        >
          <CheckCircle2 size={18} className="mr-2" />
          Complete Session
        </Button>
      )}
    </motion.div>
  );
}

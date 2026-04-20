import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Play, 
  Edit2, 
  Trash2, 
  X,
  Check,
  Flame,
  Sprout,
  Zap
} from 'lucide-react';
import type { Athlete } from '@/types';
import { useStorage } from '@/context/StorageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AthletesProps {
  onStartSession: (athleteId: string, athleteName: string) => void;
}

const levelConfig = {
  Beginner: { icon: Sprout, color: '#00E87A', bg: 'rgba(0,232,122,0.10)', border: 'rgba(0,232,122,0.18)' },
  Intermediate: { icon: Zap, color: '#FFD000', bg: 'rgba(255,200,0,0.10)', border: 'rgba(255,200,0,0.18)' },
  Advanced: { icon: Flame, color: '#FF6B2C', bg: 'rgba(255,107,44,0.10)', border: 'rgba(255,107,44,0.22)' }
};

const athleteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(10, 'Must be at least 10').max(100, 'Must be under 100'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  goal: z.string().min(3, 'Goal is required'),
});

type AthleteFormValues = z.infer<typeof athleteSchema>;
type AthleteLevel = AthleteFormValues['level'];

export default function Athletes({ onStartSession }: AthletesProps) {
  const { athletes, saveAthlete, deleteAthlete, sessions } = useStorage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [idSeed] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteSchema),
    defaultValues: {
      name: '',
      age: 0,
      level: 'Beginner',
      goal: '',
    },
  });

  const levelValue = useWatch({
    control,
    name: 'level',
  });

  const onSubmit = (data: AthleteFormValues) => {
    const generatedId = `athlete-${idSeed}-${athletes.length + 1}-${data.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')}`;

    const athlete: Athlete = {
      id: editingAthlete?.id || generatedId,
      name: data.name,
      age: data.age,
      level: data.level,
      goal: data.goal,
      createdAt: editingAthlete?.createdAt || new Date().toISOString(),
      avatar: data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    };

    saveAthlete(athlete);
    resetForm();
  };

  const resetForm = () => {
    reset({ name: '', age: 0, level: 'Beginner', goal: '' });
    setEditingAthlete(null);
    setShowAddModal(false);
  };

  const handleEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    reset({
      name: athlete.name,
      age: athlete.age,
      level: athlete.level,
      goal: athlete.goal,
    });
    setShowAddModal(true);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!showAddModal && !editingAthlete) {
      reset({ name: '', age: 0, level: 'Beginner', goal: '' });
    }
  }, [showAddModal, editingAthlete, reset]);

  const getAthleteSessions = (athleteId: string) => {
    return sessions.filter((s: { athleteId: string }) => s.athleteId === athleteId).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      {/* Add Athlete Button */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogTrigger asChild>
          <button className="w-full py-4 bg-[rgba(255,107,44,0.08)] border-[1.5px] border-dashed border-[rgba(255,107,44,0.30)] rounded-2xl text-[#FF6B2C] font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:bg-[rgba(255,107,44,0.14)] hover:border-[#FF6B2C]">
            <Plus size={18} />
            Add New Athlete
          </button>
        </DialogTrigger>
        <DialogContent className="bg-[#0E0E1C] border border-[rgba(255,255,255,0.08)] text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-[2px]">
              {editingAthlete ? 'Edit Athlete' : 'Add Athlete'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Name</Label>
              <Input
                {...register('name')}
                placeholder="Full Name"
                className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] focus:border-[#FF6B2C] mt-1"
              />
              {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Age</Label>
              <Input
                type="number"
                {...register('age', { valueAsNumber: true })}
                placeholder="Age"
                className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] focus:border-[#FF6B2C] mt-1"
              />
              {errors.age && <span className="text-[10px] text-red-500">{errors.age.message}</span>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Level</Label>
              <Select 
                value={levelValue} 
                onValueChange={(value: string) =>
                  setValue('level', value as AthleteLevel, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12121E] border-[rgba(255,255,255,0.08)]">
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && <span className="text-[10px] text-red-500">{errors.level.message}</span>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Goal</Label>
              <Input
                {...register('goal')}
                placeholder="Primary Goal"
                className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] focus:border-[#FF6B2C] mt-1"
              />
              {errors.goal && <span className="text-[10px] text-red-500">{errors.goal.message}</span>}
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                type="submit"
                className="flex-1 btn-gradient text-white"
              >
                <Check size={16} className="mr-1" />
                {editingAthlete ? 'Update' : 'Save'}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={resetForm}
                className="border-[rgba(255,255,255,0.08)]"
              >
                <X size={16} />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Athletes List */}
      <AnimatePresence mode="popLayout">
        {athletes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4 float-animation">🏋️</div>
            <p className="text-muted-foreground">
              No athletes yet.<br />Add your first one to get started.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {athletes.map((athlete, index) => {
              const config = levelConfig[athlete.level];
              const LevelIcon = config.icon;
              const sessionCount = getAthleteSessions(athlete.id);

              return (
                <motion.div
                  key={athlete.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card p-5 group">
                    {/* Level Badge */}
                    <div 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-[1.4px] uppercase mb-3"
                      style={{ 
                        background: config.bg, 
                        color: config.color,
                        border: `1px solid ${config.border}`
                      }}
                    >
                      <LevelIcon size={12} />
                      {athlete.level}
                    </div>

                    {/* Athlete Info */}
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {athlete.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      🎯 {athlete.goal || 'No goal set'}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                      <span>{sessionCount} sessions</span>
                      <span>·</span>
                      <span>{athlete.age} years old</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onStartSession(athlete.id, athlete.name)}
                        className="flex-1 btn-gradient text-white text-sm"
                      >
                        <Play size={14} className="mr-1" />
                        Start Session
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(athlete)}
                        className="border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)]"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (confirm('Delete this athlete and all their session data?')) {
                            deleteAthlete(athlete.id);
                          }
                        }}
                        className="border-[rgba(255,68,85,0.25)] text-[#FF4455] hover:bg-[rgba(255,68,85,0.08)]"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

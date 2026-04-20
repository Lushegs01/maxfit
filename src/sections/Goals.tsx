import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Trophy, 
  Flame, 
  TrendingUp, 
  Calendar,
  Check,
  X,
  Trash2,
  Dumbbell,
  Heart,
  Zap
} from 'lucide-react';
import type { FitnessGoal } from '@/types';
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

const categoryConfig = {
  strength: { icon: Dumbbell, color: '#FF6B2C', bg: 'rgba(255,107,44,0.10)' },
  endurance: { icon: Heart, color: '#00E87A', bg: 'rgba(0,232,122,0.08)' },
  consistency: { icon: Calendar, color: '#A78BFA', bg: 'rgba(167,139,250,0.08)' },
  weight: { icon: TrendingUp, color: '#FFD000', bg: 'rgba(255,200,0,0.10)' },
  custom: { icon: Target, color: '#FF6B2C', bg: 'rgba(255,107,44,0.10)' }
};

export default function Goals() {
  const { goals, saveGoal, deleteGoal, updateGoalProgress } = useStorage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: '',
    unit: '',
    category: 'strength' as FitnessGoal['category']
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.targetValue) return;

    const goal: FitnessGoal = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      targetValue: parseFloat(formData.targetValue),
      currentValue: 0,
      unit: formData.unit,
      category: formData.category,
      createdAt: new Date().toISOString()
    };

    saveGoal(goal);
    setFormData({ title: '', description: '', targetValue: '', unit: '', category: 'strength' });
    setShowAddModal(false);
  };

  const handleProgressUpdate = (goal: FitnessGoal, increment: number) => {
    const newValue = Math.min(goal.currentValue + increment, goal.targetValue);
    updateGoalProgress(goal.id, newValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="glass-card p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-[rgba(255,107,44,0.10)] flex items-center justify-center mx-auto mb-2">
            <Target size={16} className="text-[#FF6B2C]" />
          </div>
          <p className="font-display text-3xl text-foreground">{goals.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Active Goals</p>
        </Card>
        <Card className="glass-card p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-[rgba(0,232,122,0.08)] flex items-center justify-center mx-auto mb-2">
            <Trophy size={16} className="text-[#00E87A]" />
          </div>
          <p className="font-display text-3xl text-foreground">
            {goals.filter(g => g.currentValue >= g.targetValue).length}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Completed</p>
        </Card>
      </div>

      {/* Add Goal Button */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogTrigger asChild>
          <button className="w-full py-4 bg-[rgba(255,107,44,0.08)] border-[1.5px] border-dashed border-[rgba(255,107,44,0.30)] rounded-2xl text-[#FF6B2C] font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:bg-[rgba(255,107,44,0.14)] hover:border-[#FF6B2C]">
            <Plus size={18} />
            Set New Goal
          </button>
        </DialogTrigger>
        <DialogContent className="bg-[#0E0E1C] border border-[rgba(255,255,255,0.08)] text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-[2px]">
              New Goal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Bench Press PR"
                className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] focus:border-[#FF6B2C] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Reach 225 lbs"
                className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] focus:border-[#FF6B2C] mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Target</Label>
                <Input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  placeholder="225"
                  className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] focus:border-[#FF6B2C] mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Unit</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="lbs"
                  className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] focus:border-[#FF6B2C] mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value: FitnessGoal['category']) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12121E] border-[rgba(255,255,255,0.08)]">
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="consistency">Consistency</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSubmit}
                className="flex-1 btn-gradient text-white"
              >
                <Check size={16} className="mr-1" />
                Create Goal
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
                className="border-[rgba(255,255,255,0.08)]"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goals List */}
      <AnimatePresence mode="popLayout">
        {goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4 float-animation">🎯</div>
            <p className="text-muted-foreground">
              No goals set yet.<br />Create your first fitness goal!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, index) => {
              const config = categoryConfig[goal.category];
              const CategoryIcon = config.icon;
              const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
              const isCompleted = progress >= 100;

              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`glass-card p-5 ${isCompleted ? 'border-[rgba(0,232,122,0.30)]' : ''}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: config.bg }}
                        >
                          <CategoryIcon size={18} style={{ color: config.color }} />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground text-sm">{goal.title}</h3>
                          <p className="text-xs text-muted-foreground">{goal.description}</p>
                        </div>
                      </div>
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 rounded-full bg-[rgba(0,232,122,0.15)] flex items-center justify-center"
                        >
                          <Trophy size={16} className="text-[#00E87A]" />
                        </motion.div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                        <span className="font-mono font-medium" style={{ color: config.color }}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 + index * 0.1 }}
                          className="h-full rounded-full relative"
                          style={{ 
                            background: isCompleted 
                              ? 'linear-gradient(90deg, #00E87A, #34FFAA)' 
                              : `linear-gradient(90deg, ${config.color}, ${config.color}88)` 
                          }}
                        >
                          {!isCompleted && <div className="absolute inset-0 shimmer" />}
                        </motion.div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isCompleted && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProgressUpdate(goal, goal.targetValue * 0.1)}
                          className="flex-1 text-xs border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,107,44,0.08)] hover:border-[rgba(255,107,44,0.30)]"
                        >
                          <Zap size={12} className="mr-1 text-[#FF6B2C]" />
                          +{Math.round(goal.targetValue * 0.1)} {goal.unit}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProgressUpdate(goal, goal.targetValue * 0.25)}
                          className="flex-1 text-xs border-[rgba(255,255,255,0.08)] hover:bg-[rgba(0,232,122,0.08)] hover:border-[rgba(0,232,122,0.30)]"
                        >
                          <Flame size={12} className="mr-1 text-[#00E87A]" />
                          +{Math.round(goal.targetValue * 0.25)} {goal.unit}
                        </Button>
                      </div>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm('Delete this goal?')) {
                          deleteGoal(goal.id);
                        }
                      }}
                      className="mt-3 text-xs text-muted-foreground hover:text-[#FF4455] transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={10} />
                      Remove
                    </button>
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

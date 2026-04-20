import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Timer, 
  Zap,
  Trophy, 
  ChevronRight,
  Play,
  Dumbbell
} from 'lucide-react';
import { useStorage } from '@/context/StorageContext';
import { generateInsights } from '@/data/sampleData';
import { Card } from '@/components/ui/card';

interface DashboardProps {
  onStartSession: (athleteId: string, athleteName: string) => void;
}

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
}

function AnimatedCounter({ target, duration = 1500, suffix = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard({ onStartSession }: DashboardProps) {
  const { athletes, sessions, getWeeklyStats } = useStorage();
  const stats = getWeeklyStats();
  const insights = generateInsights(sessions);

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="text-center py-4">
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, Coach! 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here's your fitness overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <Card className="stat-card glass-card p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(255,107,44,0.10)] flex items-center justify-center">
              <Flame size={16} className="text-[#FF6B2C]" />
            </div>
            <span className="text-[10px] font-semibold tracking-[2px] uppercase text-muted-foreground">
              Workouts
            </span>
          </div>
          <p className="font-display text-5xl tracking-[2px] text-foreground">
            <AnimatedCounter target={stats.totalWorkouts} />
          </p>
          <p className="text-xs text-muted-foreground mt-1">This week</p>
        </Card>

        <Card className="stat-card glass-card p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(0,232,122,0.08)] flex items-center justify-center">
              <Zap size={16} className="text-[#00E87A]" />
            </div>
            <span className="text-[10px] font-semibold tracking-[2px] uppercase text-muted-foreground">
              Calories
            </span>
          </div>
          <p className="font-display text-5xl tracking-[2px] text-foreground">
            <AnimatedCounter target={stats.totalCalories} />
          </p>
          <p className="text-xs text-muted-foreground mt-1">Burned</p>
        </Card>

        <Card className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(167,139,250,0.08)] flex items-center justify-center">
              <Timer size={16} className="text-[#A78BFA]" />
            </div>
            <span className="text-[10px] font-semibold tracking-[2px] uppercase text-muted-foreground">
              Minutes
            </span>
          </div>
          <p className="font-display text-5xl tracking-[2px] text-foreground">
            <AnimatedCounter target={stats.activeMinutes} />
          </p>
          <p className="text-xs text-muted-foreground mt-1">Active time</p>
        </Card>

        <Card className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(255,200,0,0.08)] flex items-center justify-center">
              <Trophy size={16} className="text-[#FFD000]" />
            </div>
            <span className="text-[10px] font-semibold tracking-[2px] uppercase text-muted-foreground">
              Streak
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="font-display text-5xl tracking-[2px] text-foreground">
              <AnimatedCounter target={stats.currentStreak} />
            </p>
            {stats.currentStreak > 0 && (
              <motion.span 
                className="text-2xl streak-fire"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.5 }}
              >
                🔥
              </motion.span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Day streak</p>
        </Card>
      </motion.div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-[#FF6B2C]" />
            <h3 className="text-sm font-semibold tracking-[2px] uppercase text-muted-foreground">
              AI Insights
            </h3>
          </div>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`glass-card p-4 rounded-xl border-l-2 ${
                  insight.type === 'positive' ? 'border-l-[#00E87A]' :
                  insight.type === 'milestone' ? 'border-l-[#FFD000]' :
                  'border-l-[#A78BFA]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{insight.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{insight.message}</p>
                    {insight.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">{insight.detail}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-semibold tracking-[2px] uppercase text-muted-foreground mb-3">
          Quick Start
        </h3>
        <div className="space-y-2">
          {athletes.slice(0, 3).map((athlete, index) => (
            <motion.div
              key={athlete.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card 
                className="glass-card p-4 cursor-pointer group"
                onClick={() => onStartSession(athlete.id, athlete.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B2C] to-[#FF4500] flex items-center justify-center text-white font-bold text-sm">
                      {athlete.avatar || athlete.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{athlete.name}</p>
                      <p className="text-xs text-muted-foreground">{athlete.level} · {athlete.goal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[rgba(255,107,44,0.10)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={14} className="text-[#FF6B2C]" />
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      {recentSessions.length > 0 && (
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold tracking-[2px] uppercase text-muted-foreground mb-3">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(255,107,44,0.08)] flex items-center justify-center">
                        <Dumbbell size={18} className="text-[#FF6B2C]" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{session.athleteName}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.exercises.length} exercises · {Math.round(session.duration / 60)} min
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#FF6B2C]">
                      {new Date(session.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Flame,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar
} from 'lucide-react';
import { useStorage } from '@/context/StorageContext';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

type TimeFilter = 'weekly' | 'monthly' | 'all';
type ChartType = 'volume' | 'frequency' | 'calories';

interface ProgressTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  chartType: ChartType;
}

function ProgressTooltip({ active, payload, label, chartType }: ProgressTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0E0E1C] border border-[rgba(255,255,255,0.08)] rounded-lg p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-[#FF6B2C]">
          {payload[0].value.toLocaleString()} {chartType === 'volume' ? 'reps' : chartType === 'calories' ? 'cal' : 'sessions'}
        </p>
      </div>
    );
  }
  return null;
}

export default function Progress() {
  const { sessions, athletes } = useStorage();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('weekly');
  const [chartType, setChartType] = useState<ChartType>('volume');
  const [selectedAthlete, setSelectedAthlete] = useState<string>('all');
  const [referenceTime] = useState(() => Date.now());

  // Filter sessions based on time and athlete
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];
    
    // Time filter
    if (timeFilter === 'weekly') {
      const weekAgo = referenceTime - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(s => new Date(s.date).getTime() > weekAgo);
    } else if (timeFilter === 'monthly') {
      const monthAgo = referenceTime - 30 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(s => new Date(s.date).getTime() > monthAgo);
    }
    
    // Athlete filter
    if (selectedAthlete !== 'all') {
      filtered = filtered.filter(s => s.athleteId === selectedAthlete);
    }
    
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, timeFilter, selectedAthlete, referenceTime]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const dataMap = new Map<string, { date: string; volume: number; sessions: number; calories: number }>();
    
    filteredSessions.forEach(session => {
      const date = new Date(session.date);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const volume = session.exercises.reduce((total, ex) => {
        return total + ex.sets.reduce((sum: number, set) => {
          const val = typeof set === 'string' ? parseInt(set) || 0 : set;
          return sum + val;
        }, 0);
      }, 0);
      
      const existing = dataMap.get(dateKey);
      if (existing) {
        existing.volume += volume;
        existing.sessions += 1;
        existing.calories += session.caloriesBurned || 0;
      } else {
        dataMap.set(dateKey, { date: dateKey, volume, sessions: 1, calories: session.caloriesBurned || 0 });
      }
    });
    
    return Array.from(dataMap.values());
  }, [filteredSessions]);

  // Monthly aggregated data for bar chart
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { month: string; count: number; calories: number }>();
    
    sessions.forEach(session => {
      const month = new Date(session.date).toLocaleDateString('en-US', { month: 'short' });
      const existing = monthMap.get(month);
      if (existing) {
        existing.count += 1;
        existing.calories += session.caloriesBurned || 0;
      } else {
        monthMap.set(month, { month, count: 1, calories: session.caloriesBurned || 0 });
      }
    });
    
    return Array.from(monthMap.values());
  }, [sessions]);

  const totalWorkouts = filteredSessions.length;
  const totalVolume = chartData.reduce((sum, d) => sum + d.volume, 0);
  const totalCalories = filteredSessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-[rgba(255,107,44,0.10)] flex items-center justify-center mx-auto mb-2">
            <Flame size={16} className="text-[#FF6B2C]" />
          </div>
          <p className="font-display text-2xl text-foreground">{totalWorkouts}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Workouts</p>
        </Card>
        <Card className="glass-card p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-[rgba(0,232,122,0.08)] flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={16} className="text-[#00E87A]" />
          </div>
          <p className="font-display text-2xl text-foreground">{totalVolume.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Reps</p>
        </Card>
        <Card className="glass-card p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-[rgba(167,139,250,0.08)] flex items-center justify-center mx-auto mb-2">
            <BarChart3 size={16} className="text-[#A78BFA]" />
          </div>
          <p className="font-display text-2xl text-foreground">{totalCalories.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Calories</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Time Filter */}
        <div className="flex gap-2">
          {(['weekly', 'monthly', 'all'] as TimeFilter[]).map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                timeFilter === filter
                  ? 'bg-[rgba(255,107,44,0.15)] text-[#FF6B2C] border border-[rgba(255,107,44,0.30)]'
                  : 'bg-[rgba(255,255,255,0.03)] text-muted-foreground border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.06)]'
              }`}
            >
              {filter === 'all' ? 'All Time' : filter === 'weekly' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        {/* Chart Type & Athlete Filter */}
        <div className="flex gap-2">
          <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] rounded-xl p-1 flex-1">
            {([
              { key: 'volume' as ChartType, icon: TrendingUp, label: 'Volume' },
              { key: 'frequency' as ChartType, icon: Calendar, label: 'Freq' },
              { key: 'calories' as ChartType, icon: Flame, label: 'Cal' }
            ]).map(type => (
              <button
                key={type.key}
                onClick={() => setChartType(type.key)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  chartType === type.key
                    ? 'bg-[rgba(255,107,44,0.15)] text-[#FF6B2C]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <type.icon size={12} />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Athlete Filter */}
        <select
          value={selectedAthlete}
          onChange={(e) => setSelectedAthlete(e.target.value)}
          className="w-full py-2.5 px-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-sm text-foreground outline-none focus:border-[#FF6B2C] transition-colors"
        >
          <option value="all">All Athletes</option>
          {athletes.map(athlete => (
            <option key={athlete.id} value={athlete.id}>{athlete.name}</option>
          ))}
        </select>
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <Card className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <LineChartIcon size={16} className="text-[#FF6B2C]" />
            {chartType === 'volume' ? 'Training Volume' : chartType === 'calories' ? 'Calories Burned' : 'Workout Frequency'}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            {chartType === 'frequency' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(245,245,240,0.30)" 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(245,245,240,0.30)" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ProgressTooltip chartType={chartType} />} />
                <Bar 
                  dataKey="sessions" 
                  fill="#FF6B2C" 
                  radius={[6, 6, 0, 0]}
                  fillOpacity={0.8}
                />
              </BarChart>
            ) : (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B2C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B2C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(245,245,240,0.30)" 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(245,245,240,0.30)" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ProgressTooltip chartType={chartType} />} />
                <Area 
                  type="monotone" 
                  dataKey={chartType === 'volume' ? 'volume' : 'calories'}
                  stroke="#FF6B2C" 
                  strokeWidth={2.5}
                  fill="url(#colorGradient)"
                  dot={{ fill: '#00E87A', r: 4 }}
                  activeDot={{ r: 6, fill: '#FF6B2C' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </Card>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3 float-animation">📊</div>
          <p className="text-sm text-muted-foreground">
            No data for selected period.
          </p>
        </div>
      )}

      {/* Monthly Overview */}
      {monthlyData.length > 0 && (
        <Card className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-[#A78BFA]" />
            Monthly Overview
          </h3>
          <div className="space-y-3">
            {monthlyData.map((month, index) => {
              const maxCount = Math.max(...monthlyData.map(m => m.count));
              const width = (month.count / maxCount) * 100;
              
              return (
                <motion.div
                  key={month.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs font-medium text-muted-foreground w-10">
                    {month.month}
                  </span>
                  <div className="flex-1 h-5 bg-[rgba(255,255,255,0.03)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 + index * 0.1 }}
                      className="h-full bg-gradient-to-r from-[#FF6B2C] to-[#FF8A50] rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.15)] to-transparent" />
                    </motion.div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                    {month.count}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}
    </motion.div>
  );
}

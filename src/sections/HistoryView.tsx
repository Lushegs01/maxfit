import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Flame, 
  Dumbbell, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  Download
} from 'lucide-react';
import { useStorage } from '@/context/StorageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type FilterType = 'all' | 'week' | 'month';

export default function HistoryView() {
  const { sessions, athletes, deleteSession } = useStorage();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [referenceTime] = useState(() => Date.now());

  const athleteMap = new Map(athletes.map(a => [a.id, a]));

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filter === 'week') {
      const weekAgo = referenceTime - 7 * 24 * 60 * 60 * 1000;
      return new Date(session.date).getTime() > weekAgo;
    }
    if (filter === 'month') {
      const monthAgo = referenceTime - 30 * 24 * 60 * 60 * 1000;
      return new Date(session.date).getTime() > monthAgo;
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleExpand = (sessionId: string) => {
    setExpandedSession(prev => prev === sessionId ? null : sessionId);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Athlete', 'Exercise', 'S1', 'S2', 'S3', 'S4', 'KG', 'Completed'];
    const rows: string[][] = [];
    
    filteredSessions.forEach(session => {
      const athleteName = athleteMap.get(session.athleteId)?.name || 'Unknown';
      const date = new Date(session.date).toLocaleDateString();
      
      session.exercises.forEach(exercise => {
        rows.push([
          date,
          athleteName,
          exercise.name,
          ...exercise.sets.map(s => s.toString()),
          exercise.target.toString(),
          exercise.completed ? 'Yes' : 'No'
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maxfit_sessions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] rounded-xl p-1">
          {(['all', 'week', 'month'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-[rgba(255,107,44,0.15)] text-[#FF6B2C]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : f === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCSV}
          className="border-[rgba(255,255,255,0.08)] text-xs"
        >
          <Download size={14} className="mr-1" />
          Export
        </Button>
      </div>

      {/* Sessions List */}
      <AnimatePresence mode="popLayout">
        {filteredSessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4 float-animation">📝</div>
            <p className="text-muted-foreground">
              No sessions found for this period.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session, index) => {
              const isExpanded = expandedSession === session.id;
              const athlete = athleteMap.get(session.athleteId);
              const date = new Date(session.date);
              const dateStr = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });
              const timeStr = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`glass-card overflow-hidden transition-all ${isExpanded ? 'border-[rgba(255,107,44,0.30)]' : ''}`}
                  >
                    {/* Main Card Content */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => toggleExpand(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-[#FF6B2C]">
                              {dateStr.toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">
                              {timeStr}
                            </span>
                          </div>
                          <h3 className="font-medium text-foreground text-sm">
                            {athlete?.name || 'Unknown Athlete'}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Dumbbell size={12} />
                              {session.exercises.length} exercises
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {Math.round(session.duration / 60)} min
                            </span>
                            {session.caloriesBurned && (
                              <span className="flex items-center gap-1">
                                <Flame size={12} className="text-[#FF6B2C]" />
                                {session.caloriesBurned} cal
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-3xl text-[rgba(245,245,240,0.18)]">
                            {session.exercises.length}
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-muted-foreground" />
                          ) : (
                            <ChevronDown size={16} className="text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-[rgba(255,255,255,0.06)] pt-3">
                            {/* Exercises Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                    <th className="text-left pb-2">Exercise</th>
                                    <th className="text-center pb-2 w-12">S1</th>
                                    <th className="text-center pb-2 w-12">S2</th>
                                    <th className="text-center pb-2 w-12">S3</th>
                                    <th className="text-center pb-2 w-12">S4</th>
                                    <th className="text-center pb-2 w-12">KG</th>
                                    <th className="text-center pb-2 w-10">✓</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {session.exercises.map((exercise, exIndex) => (
                                    <tr 
                                      key={exIndex}
                                      className="border-t border-[rgba(255,255,255,0.04)]"
                                    >
                                      <td className="py-2 text-foreground text-xs">{exercise.name}</td>
                                      {exercise.sets.map((set, setIndex) => (
                                        <td key={setIndex} className="py-2 text-center font-mono text-xs text-muted-foreground">
                                          {set || '—'}
                                        </td>
                                      ))}
                                      <td className="py-2 text-center font-mono text-xs text-[#FF6B2C]">
                                        {exercise.target || '—'}
                                      </td>
                                      <td className="py-2 text-center">
                                        {exercise.completed ? (
                                          <span className="text-[#00E87A]">✓</span>
                                        ) : (
                                          <span className="text-muted-foreground">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Notes */}
                            {session.notes && (
                              <div className="mt-3 p-3 bg-[rgba(255,255,255,0.03)] rounded-lg">
                                <p className="text-xs text-muted-foreground italic">
                                  &ldquo;{session.notes}&rdquo;
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="mt-3 flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Delete this session?')) {
                                    deleteSession(session.id);
                                  }
                                }}
                                className="border-[rgba(255,68,85,0.25)] text-[#FF4455] text-xs hover:bg-[rgba(255,68,85,0.08)]"
                              >
                                <Trash2 size={12} className="mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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

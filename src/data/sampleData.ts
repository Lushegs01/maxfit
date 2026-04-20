import type { Athlete, WorkoutSession, FitnessGoal } from '@/types';

export const sampleAthletes: Athlete[] = [
  {
    id: '1',
    name: 'Marcus Johnson',
    age: 28,
    level: 'Advanced',
    goal: 'Build muscle mass and increase strength',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    avatar: 'MJ'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    age: 24,
    level: 'Intermediate',
    goal: 'Improve endurance and tone muscles',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    avatar: 'SC'
  },
  {
    id: '3',
    name: 'Alex Rivera',
    age: 32,
    level: 'Beginner',
    goal: 'Lose weight and build healthy habits',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    avatar: 'AR'
  }
];

export const sampleSessions: WorkoutSession[] = [
  {
    id: '101',
    athleteId: '1',
    athleteName: 'Marcus Johnson',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    exercises: [
      { name: 'Bench Press', sets: [10, 8, 6], target: 185, completed: true },
      { name: 'Shoulder Press', sets: [10, 10, 8], target: 135, completed: true },
      { name: 'Tricep Extension', sets: [12, 12, 12], target: 50, completed: true },
      { name: 'Lateral Raise', sets: [15, 15], target: 25, completed: true }
    ],
    notes: 'Felt strong today. Increased weight on bench.',
    duration: 3600,
    caloriesBurned: 420
  },
  {
    id: '102',
    athleteId: '1',
    athleteName: 'Marcus Johnson',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    exercises: [
      { name: 'Squats (Barbell)', sets: [8, 8, 6], target: 225, completed: true },
      { name: 'Romanian Deadlift', sets: [10, 10, 10], target: 185, completed: true },
      { name: 'Lunges', sets: [12, 12], target: 40, completed: true },
      { name: 'Calf Raises', sets: [20, 20, 20], target: 60, completed: true }
    ],
    notes: 'Leg day was tough but got through it.',
    duration: 3300,
    caloriesBurned: 480
  },
  {
    id: '103',
    athleteId: '2',
    athleteName: 'Sarah Chen',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    exercises: [
      { name: 'Pull Ups', sets: [8, 6, 5], target: 0, completed: true },
      { name: 'Bent Over Rows', sets: [12, 12, 10], target: 95, completed: true },
      { name: 'Bicep Curl', sets: [12, 12, 12], target: 30, completed: true },
      { name: 'Face Pulls', sets: [15, 15], target: 40, completed: true }
    ],
    notes: 'Back and biceps workout. Good pump!',
    duration: 3000,
    caloriesBurned: 350
  },
  {
    id: '104',
    athleteId: '3',
    athleteName: 'Alex Rivera',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    exercises: [
      { name: 'Push Ups', sets: [15, 12, 10], target: 0, completed: true },
      { name: 'Squats (Bodyweight)', sets: [20, 15, 15], target: 0, completed: true },
      { name: 'Plank', sets: [60, 45, 30], target: 0, completed: true },
      { name: 'Lunges', sets: [12, 12], target: 0, completed: true }
    ],
    notes: 'Full body beginner routine. Feeling good!',
    duration: 2400,
    caloriesBurned: 280
  },
  {
    id: '105',
    athleteId: '1',
    athleteName: 'Marcus Johnson',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    exercises: [
      { name: 'Incline Press', sets: [10, 8, 8], target: 155, completed: true },
      { name: 'Chest Fly', sets: [12, 12, 12], target: 40, completed: true },
      { name: 'Dips', sets: [12, 10, 8], target: 0, completed: true },
      { name: 'Tricep Extension', sets: [12, 12], target: 55, completed: true }
    ],
    notes: 'Chest and triceps focus.',
    duration: 2700,
    caloriesBurned: 380
  },
  {
    id: '106',
    athleteId: '2',
    athleteName: 'Sarah Chen',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    exercises: [
      { name: 'Treadmill Run', sets: [20], target: 0, completed: true },
      { name: 'Kettlebell Swings', sets: [20, 20, 20], target: 35, completed: true },
      { name: 'Box Jumps', sets: [10, 10, 10], target: 0, completed: true },
      { name: 'Burpees', sets: [15, 10], target: 0, completed: true }
    ],
    notes: 'High intensity cardio day!',
    duration: 2700,
    caloriesBurned: 520
  }
];

export const sampleGoals: FitnessGoal[] = [
  {
    id: 'g1',
    title: 'Weekly Workouts',
    description: 'Complete 4 workouts this week',
    targetValue: 4,
    currentValue: 3,
    unit: 'workouts',
    category: 'consistency',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'g2',
    title: 'Bench Press PR',
    description: 'Reach 225 lbs on bench press',
    targetValue: 225,
    currentValue: 185,
    unit: 'lbs',
    category: 'strength',
    createdAt: new Date().toISOString()
  },
  {
    id: 'g3',
    title: 'Monthly Calories',
    description: 'Burn 10,000 calories this month',
    targetValue: 10000,
    currentValue: 6500,
    unit: 'cal',
    category: 'endurance',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'g4',
    title: 'Workout Streak',
    description: 'Maintain a 14-day workout streak',
    targetValue: 14,
    currentValue: 7,
    unit: 'days',
    category: 'consistency',
    createdAt: new Date().toISOString()
  }
];

export const generateInsights = (sessions: WorkoutSession[]) => {
  const insights = [];
  
  if (sessions.length > 0) {
    const thisWeekSessions = sessions.filter(s => {
      const daysDiff = (Date.now() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });
    
    const lastWeekSessions = sessions.filter(s => {
      const daysDiff = (Date.now() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 7 && daysDiff <= 14;
    });
    
    if (thisWeekSessions.length > lastWeekSessions.length) {
      insights.push({
        id: 'i1',
        type: 'positive' as const,
        message: `You trained ${Math.round((thisWeekSessions.length / Math.max(lastWeekSessions.length, 1) - 1) * 100)}% more this week`,
        detail: `${thisWeekSessions.length} workouts vs ${lastWeekSessions.length} last week`,
        icon: '💪'
      });
    }
    
    const totalCalories = sessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0);
    if (totalCalories > 5000) {
      insights.push({
        id: 'i2',
        type: 'milestone' as const,
        message: 'Calorie Crusher!',
        detail: `You've burned ${totalCalories.toLocaleString()} calories total`,
        icon: '🔥'
      });
    }
    
    insights.push({
      id: 'i3',
      type: 'tip' as const,
      message: 'Pro Tip: Progressive Overload',
      detail: 'Try increasing weight by 2.5% each week for optimal gains',
      icon: '💡'
    });
  }
  
  return insights;
};

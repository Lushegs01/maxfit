export interface Athlete {
  id: string;
  name: string;
  age: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
  createdAt: string;
  avatar?: string;
}

export interface Exercise {
  name: string;
  sets: (string | number)[];
  target: string | number;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  athleteId: string;
  athleteName: string;
  date: string;
  exercises: Exercise[];
  notes: string;
  duration: number; // in seconds
  caloriesBurned?: number;
}

export interface FitnessGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  category: 'strength' | 'endurance' | 'consistency' | 'weight' | 'custom';
  createdAt: string;
}

export interface WeeklyStats {
  totalWorkouts: number;
  totalCalories: number;
  activeMinutes: number;
  currentStreak: number;
  personalRecords: number;
}

export interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'milestone' | 'tip';
  message: string;
  detail?: string;
  icon: string;
}

export type ViewType = 'dashboard' | 'athletes' | 'session' | 'progress' | 'history' | 'goals';

export interface AppState {
  currentView: ViewType;
  activeSession: WorkoutSession | null;
  selectedAthleteId: string | null;
  theme: 'dark' | 'light';
}

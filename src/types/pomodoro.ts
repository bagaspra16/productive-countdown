export enum SessionType {
  FOCUS = 'FOCUS',
  REST = 'REST',
}

export interface PomodoroMethod {
  id: string;
  name: string;
  focusDuration: number; // in minutes
  restDuration: number; // in minutes
  isCustom: boolean;
  description?: string;
}

export interface PomodoroSession {
  type: SessionType;
  duration: number; // in minutes
  startTime?: Date;
  endTime?: Date;
  completed: boolean;
}

export interface PomodoroState {
  currentMethod: PomodoroMethod | null;
  currentSession: PomodoroSession | null;
  sessionHistory: PomodoroSession[];
  cycleCount: number; // Number of completed focus sessions
}

// Preset Pomodoro Methods
export const POMODORO_PRESETS: PomodoroMethod[] = [
  {
    id: 'classic',
    name: 'Classic Pomodoro',
    focusDuration: 25,
    restDuration: 5,
    isCustom: false,
    description: '25 minutes of focused work, 5 minutes of rest',
  },
  {
    id: 'extended',
    name: 'Extended Focus',
    focusDuration: 45,
    restDuration: 15,
    isCustom: false,
    description: '45 minutes of focused work, 15 minutes of rest',
  },
];

// Helper function to create a custom method
export const createCustomMethod = (
  focusDuration: number,
  restDuration: number,
  name?: string
): PomodoroMethod => ({
  id: 'custom',
  name: name || 'Custom Method',
  focusDuration,
  restDuration,
  isCustom: true,
  description: `${focusDuration} minutes of focused work, ${restDuration} minutes of rest`,
});

export interface Task {
  id: string;
  title: string;
  description?: string;
  duration: number; // Duration in minutes
  startTime?: Date;
  isCompleted: boolean;
  isActive: boolean;
  color?: string;
}

export interface TaskList {
  tasks: Task[];
  activeTaskId: string | null;
} 
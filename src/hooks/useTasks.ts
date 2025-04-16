import { useState, useCallback, useEffect } from 'react';
import { Task, TaskList } from '../types/task';
import { v4 as uuidv4 } from 'uuid';

// Local storage key for saving tasks
const LOCAL_STORAGE_KEY = 'productive_countdown_tasks';

// Helper to safely parse dates from JSON
const parseTasksFromStorage = (data: string | null): TaskList => {
  if (!data) return { tasks: [], activeTaskId: null };
  
  try {
    const parsedData = JSON.parse(data);
    
    // Convert ISO string dates back to Date objects
    const tasks = parsedData.tasks.map((task: any) => ({
      ...task,
      startTime: task.startTime ? new Date(task.startTime) : undefined
    }));
    
    return {
      tasks,
      activeTaskId: parsedData.activeTaskId
    };
  } catch (error) {
    console.error('Error parsing tasks from localStorage:', error);
    return { tasks: [], activeTaskId: null };
  }
};

export function useTasks() {
  // Initialize state from localStorage
  const [taskList, setTaskList] = useState<TaskList>(() => {
    const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    return parseTasksFromStorage(savedTasks);
  });

  // Save to localStorage whenever taskList changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(taskList));
  }, [taskList]);

  // Add a new task
  const addTask = useCallback((task: Omit<Task, 'id' | 'isActive' | 'isCompleted'>) => {
    const newTask: Task = {
      id: uuidv4(),
      isActive: false,
      isCompleted: false,
      ...task,
    };

    setTaskList(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));

    return newTask.id;
  }, []);

  // Remove a task by id
  const removeTask = useCallback((id: string) => {
    setTaskList(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id),
      activeTaskId: prev.activeTaskId === id ? null : prev.activeTaskId,
    }));
  }, []);

  // Update a task by id
  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTaskList(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  }, []);

  // Mark a task as active and start it
  const startTask = useCallback((id: string) => {
    setTaskList(prev => {
      // First, set all tasks to inactive
      const updatedTasks = prev.tasks.map(task => ({
        ...task,
        isActive: task.id === id,
        startTime: task.id === id ? new Date() : task.startTime,
      }));

      return {
        tasks: updatedTasks,
        activeTaskId: id,
      };
    });
  }, []);

  // Mark the current active task as completed
  const completeActiveTask = useCallback(() => {
    if (!taskList.activeTaskId) return;

    setTaskList(prev => ({
      activeTaskId: null,
      tasks: prev.tasks.map(task => 
        task.id === prev.activeTaskId
          ? { ...task, isActive: false, isCompleted: true }
          : task
      ),
    }));
  }, [taskList.activeTaskId]);

  // Get the current active task
  const getActiveTask = useCallback(() => {
    return taskList.tasks.find(task => task.id === taskList.activeTaskId) || null;
  }, [taskList.tasks, taskList.activeTaskId]);

  // Clear all completed tasks
  const clearCompletedTasks = useCallback(() => {
    setTaskList(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => !task.isCompleted),
    }));
  }, []);

  // Clear all tasks (for testing purposes)
  const clearAllTasks = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all tasks?')) {
      setTaskList({ tasks: [], activeTaskId: null });
    }
  }, []);

  return {
    tasks: taskList.tasks,
    activeTaskId: taskList.activeTaskId,
    addTask,
    removeTask,
    updateTask,
    startTask,
    completeActiveTask,
    getActiveTask,
    clearCompletedTasks,
    clearAllTasks,
  };
} 
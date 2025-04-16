import { useState, useCallback } from 'react';
import { Task, TaskList } from '../types/task';
import { v4 as uuidv4 } from 'uuid';

export function useTasks() {
  const [taskList, setTaskList] = useState<TaskList>({
    tasks: [],
    activeTaskId: null,
  });

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

  return {
    tasks: taskList.tasks,
    activeTaskId: taskList.activeTaskId,
    addTask,
    removeTask,
    updateTask,
    startTask,
    completeActiveTask,
    getActiveTask,
  };
} 
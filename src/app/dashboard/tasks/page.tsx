"use client";

import { useState, useEffect, useCallback } from "react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import TasksPage from "@/components/TasksPage";
import { tasksAPI, disciplinesAPI } from "@/lib/api";
import type { Task, TaskType, Discipline } from "@/types/api-types";

export default function TasksRoute() {
  const { currentWorkspace } = useWorkspaceContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks and disciplines
  const fetchData = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setTasks([]);
      setDisciplines([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [tasksData, disciplinesData] = await Promise.all([
        tasksAPI.list(currentWorkspace.id),
        disciplinesAPI.list(currentWorkspace.id),
      ]);
      setTasks(tasksData.tasks);
      setDisciplines(disciplinesData.disciplines);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      console.error("Failed to fetch tasks data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create task
  const handleCreateTask = async (data: {
    title: string;
    description?: string;
    type: TaskType;
    dueDate: string;
    disciplineId?: string;
  }) => {
    if (!currentWorkspace?.id) return;

    try {
      await tasksAPI.create(currentWorkspace.id, data);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar tarefa");
      throw err;
    }
  };

  // Update task
  const handleUpdateTask = async (
    taskId: string,
    data: {
      title: string;
      description?: string;
      type: TaskType;
      dueDate: string;
      disciplineId?: string;
    }
  ) => {
    if (!currentWorkspace?.id) return;

    try {
      await tasksAPI.update(currentWorkspace.id, taskId, data);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar tarefa");
      throw err;
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!currentWorkspace?.id) return;
    if (!confirm("Tens a certeza que queres eliminar esta tarefa?")) return;

    try {
      await tasksAPI.delete(currentWorkspace.id, taskId);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao eliminar tarefa");
    }
  };

  // Toggle task completion
  const handleToggleTask = async (taskId: string) => {
    if (!currentWorkspace?.id) return;

    try {
      await tasksAPI.toggleComplete(currentWorkspace.id, taskId);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar tarefa");
    }
  };

  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full size-8 border-b-2 border-[#1E40AF]"></div>
      </div>
    );
  }

  // No workspace
  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-500">Seleciona um workspace para ver as tarefas.</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
        <button onClick={fetchData} className="ml-4 underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <TasksPage
      tasks={tasks}
      disciplines={disciplines}
      onCreateTask={handleCreateTask}
      onUpdateTask={handleUpdateTask}
      onDeleteTask={handleDeleteTask}
      onToggleTask={handleToggleTask}
    />
  );
}

"use client";

import { useState } from "react";
import type { Task, TaskType, Discipline } from "@/types/api-types";
import CreateTaskDialog from "./create-task-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface TasksPageProps {
  tasks: Task[];
  disciplines: Discipline[];
  onCreateTask: (data: {
    title: string;
    description?: string;
    type: TaskType;
    dueDate: string;
    disciplineId?: string;
  }) => Promise<void>;
  onUpdateTask: (
    taskId: string,
    data: {
      title: string;
      description?: string;
      type: TaskType;
      dueDate: string;
      disciplineId?: string;
    }
  ) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onToggleTask: (taskId: string) => Promise<void>;
}

// Task type labels and colors
const taskTypeConfig: Record<TaskType, { label: string; color: string }> = {
  TESTE: { label: "Teste", color: "bg-red-100 text-red-700 border-red-200" },
  PROJETO: { label: "Projeto", color: "bg-purple-100 text-purple-700 border-purple-200" },
  TRABALHO: { label: "Trabalho", color: "bg-blue-100 text-blue-700 border-blue-200" },
  TAREFA: { label: "Tarefa", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

const filterOptions: Array<{ value: TaskType | "ALL"; label: string }> = [
  { value: "ALL", label: "Todas" },
  { value: "TESTE", label: "Testes" },
  { value: "PROJETO", label: "Projetos" },
  { value: "TRABALHO", label: "Trabalhos" },
  { value: "TAREFA", label: "Tarefas" },
];

export default function TasksPage({
  tasks,
  disciplines,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
}: TasksPageProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskType | "ALL">("ALL");

  // Filter tasks based on active filter
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "ALL") return true;
    return task.type === activeFilter;
  });

  // Separate pending and completed tasks
  const pendingTasks = filteredTasks.filter((t) => !t.isCompleted);
  const completedTasks = filteredTasks.filter((t) => t.isCompleted);

  // Format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now;
    const formattedDate = format(date, "dd/MM/yyyy 'às' HH:mm", { locale: pt });

    return { formattedDate, isOverdue };
  };

  // Get discipline name
  const getDisciplineName = (disciplineId: string | null) => {
    if (!disciplineId) return null;
    const discipline = disciplines.find((d) => d.id === disciplineId);
    return discipline?.name;
  };

  const handleUpdateTask = async (data: {
    title: string;
    description?: string;
    type: TaskType;
    dueDate: string;
    disciplineId?: string;
  }) => {
    if (!editingTask) return;
    await onUpdateTask(editingTask.id, data);
    setEditingTask(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={onCreateTask}
        mode="create"
        disciplines={disciplines}
      />
      <CreateTaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={handleUpdateTask}
        task={editingTask}
        mode="edit"
        disciplines={disciplines}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Tarefas</h1>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Criar Tarefa
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setActiveFilter(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === option.value
                ? "bg-[#1E40AF] text-white"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Tarefas Pendentes */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Pendentes ({pendingTasks.length})
        </h2>
        {pendingTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-400 text-3xl">
                task_alt
              </span>
            </div>
            <p className="text-slate-500 mb-4">
              {activeFilter === "ALL"
                ? "Nenhuma tarefa pendente! 🎉"
                : `Nenhum(a) ${filterOptions.find((f) => f.value === activeFilter)?.label.toLowerCase()} pendente.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const { formattedDate, isOverdue } = formatDueDate(task.dueDate);
              const disciplineName = getDisciplineName(task.disciplineId);
              const typeConfig = taskTypeConfig[task.type];

              return (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 size-5 rounded border-2 border-slate-300 hover:border-[#1E40AF] transition-colors flex items-center justify-center flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 flex-1">
                        {task.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded border ${typeConfig.color} whitespace-nowrap`}
                      >
                        {typeConfig.label}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-600 mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span
                        className={`flex items-center gap-1 ${
                          isOverdue ? "text-red-600" : "text-slate-500"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          schedule
                        </span>
                        {formattedDate}
                        {isOverdue && " (Atrasada)"}
                      </span>
                      {disciplineName && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <span className="material-symbols-outlined text-base">
                            book
                          </span>
                          {disciplineName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tarefas Concluídas */}
      {completedTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Concluídas ({completedTasks.length})
          </h2>
          <div className="space-y-3">
            {completedTasks.map((task) => {
              const { formattedDate } = formatDueDate(task.dueDate);
              const disciplineName = getDisciplineName(task.disciplineId);
              const typeConfig = taskTypeConfig[task.type];

              return (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 opacity-60"
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 size-5 rounded bg-[#1E40AF] flex items-center justify-center flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-white text-sm">
                      check
                    </span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="font-semibold text-slate-500 line-through flex-1">
                        {task.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded border ${typeConfig.color} whitespace-nowrap opacity-60`}
                      >
                        {typeConfig.label}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-500 line-through mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">
                          schedule
                        </span>
                        {formattedDate}
                      </span>
                      {disciplineName && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            book
                          </span>
                          {disciplineName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

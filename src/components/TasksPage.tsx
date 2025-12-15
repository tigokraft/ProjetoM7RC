"use client";

import { Task } from "@/types/task";

interface TasksPageProps {
    tasks: Task[];
    onToggleTask: (id: number) => void;
}

export default function TasksPage({ tasks, onToggleTask }: TasksPageProps) {
    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Tarefas</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{completedTasks.length}/{tasks.length} concluídas</span>
                </div>
            </div>

            {/* Tarefas Pendentes */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Pendentes</h2>
                {pendingTasks.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">Nenhuma tarefa pendente! 🎉</p>
                ) : (
                    <div className="space-y-3">
                        {pendingTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                            >
                                <button
                                    onClick={() => onToggleTask(task.id)}
                                    className="size-5 rounded border-2 border-slate-300 hover:border-[#1E40AF] transition-colors flex items-center justify-center"
                                >
                                </button>
                                <span className="flex-1 text-slate-700">{task.title}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tarefas Concluídas */}
            {completedTasks.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Concluídas</h2>
                    <div className="space-y-3">
                        {completedTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 opacity-60"
                            >
                                <button
                                    onClick={() => onToggleTask(task.id)}
                                    className="size-5 rounded bg-[#1E40AF] flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-white text-sm">check</span>
                                </button>
                                <span className="flex-1 text-slate-500 line-through">{task.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

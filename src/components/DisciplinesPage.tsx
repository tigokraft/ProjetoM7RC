"use client";

import { useState } from "react";

interface Discipline {
    id: number;
    name: string;
    teacher: string;
    color: string;
    workspaceId: number;
}

interface Workspace {
    id: number;
    name: string;
}

interface DisciplinesPageProps {
    disciplines: Discipline[];
    workspaces: Workspace[];
}

export default function DisciplinesPage({ disciplines, workspaces }: DisciplinesPageProps) {
    const [selectedWorkspace, setSelectedWorkspace] = useState<number | "all">("all");

    const filteredDisciplines = selectedWorkspace === "all"
        ? disciplines
        : disciplines.filter(d => d.workspaceId === selectedWorkspace);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Disciplinas</h1>
            </div>

            {/* Filtro por Workspace */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedWorkspace("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedWorkspace === "all"
                            ? "bg-[#1E40AF] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                >
                    Todos os Workspaces
                </button>
                {workspaces.map((ws) => (
                    <button
                        key={ws.id}
                        onClick={() => setSelectedWorkspace(ws.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedWorkspace === ws.id
                                ? "bg-[#1E40AF] text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                    >
                        {ws.name}
                    </button>
                ))}
            </div>

            {/* Lista de Disciplinas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDisciplines.length === 0 ? (
                    <p className="text-slate-500 col-span-full text-center py-8">Nenhuma disciplina encontrada</p>
                ) : (
                    filteredDisciplines.map((discipline) => (
                        <div
                            key={discipline.id}
                            className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow cursor-pointer"
                            style={{ borderLeftColor: discipline.color }}
                        >
                            <h3 className="font-semibold text-slate-800 text-lg">{discipline.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                <span className="material-symbols-outlined text-sm align-middle mr-1">person</span>
                                {discipline.teacher}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <span
                                    className="size-3 rounded-full"
                                    style={{ backgroundColor: discipline.color }}
                                ></span>
                                <span className="text-xs text-slate-400">
                                    {workspaces.find(w => w.id === discipline.workspaceId)?.name}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import type { Discipline } from "@/types/api-types";
import CreateDisciplineDialog from "./create-discipline-dialog";
import { Pencil, Trash2 } from "lucide-react";

interface DisciplinesPageProps {
  disciplines: Discipline[];
  onCreateDiscipline: (data: {
    name: string;
    description?: string;
    color?: string;
  }) => Promise<void>;
  onUpdateDiscipline: (
    disciplineId: string,
    data: {
      name: string;
      description?: string;
      color?: string;
    }
  ) => Promise<void>;
  onDeleteDiscipline: (disciplineId: string) => Promise<void>;
}

export default function DisciplinesPage({
  disciplines,
  onCreateDiscipline,
  onUpdateDiscipline,
  onDeleteDiscipline,
}: DisciplinesPageProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);

  const handleUpdateDiscipline = async (data: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    if (!editingDiscipline) return;
    await onUpdateDiscipline(editingDiscipline.id, data);
    setEditingDiscipline(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <CreateDisciplineDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={onCreateDiscipline}
        mode="create"
      />
      <CreateDisciplineDialog
        open={!!editingDiscipline}
        onOpenChange={(open) => !open && setEditingDiscipline(null)}
        onSubmit={handleUpdateDiscipline}
        discipline={editingDiscipline}
        mode="edit"
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Disciplinas</h1>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Criar Disciplina
        </button>
      </div>

      {/* Lista de Disciplinas */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {disciplines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-400 text-3xl">
                school
              </span>
            </div>
            <p className="text-slate-500 mb-4">Nenhuma disciplina encontrada.</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Criar Primeira Disciplina
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplines.map((discipline) => (
              <div
                key={discipline.id}
                className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden group"
              >
                {/* Color Bar */}
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: discipline.color || "#1E40AF" }}
                />
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 text-lg flex-1">
                      {discipline.name}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingDiscipline(discipline)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => onDeleteDiscipline(discipline.id)}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  
                  {discipline.description && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {discipline.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: discipline.color || "#1E40AF" }}
                    />
                    <span className="text-xs text-slate-400">
                      {discipline.color || "#1E40AF"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

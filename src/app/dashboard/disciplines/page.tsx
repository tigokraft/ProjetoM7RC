"use client";

import { useState, useEffect, useCallback } from "react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import DisciplinesPage from "@/components/DisciplinesPage";
import { disciplinesAPI } from "@/lib/api";
import type { Discipline } from "@/types/api-types";

export default function DisciplinesRoute() {
  const { currentWorkspace } = useWorkspaceContext();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch disciplines
  const fetchDisciplines = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setDisciplines([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await disciplinesAPI.list(currentWorkspace.id);
      setDisciplines(data.disciplines);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar disciplinas");
      console.error("Failed to fetch disciplines:", err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchDisciplines();
  }, [fetchDisciplines]);

  // Create discipline
  const handleCreateDiscipline = async (data: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    if (!currentWorkspace?.id) return;

    try {
      await disciplinesAPI.create(currentWorkspace.id, data);
      await fetchDisciplines();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar disciplina");
      throw err;
    }
  };

  // Update discipline
  const handleUpdateDiscipline = async (
    disciplineId: string,
    data: {
      name: string;
      description?: string;
      color?: string;
    }
  ) => {
    if (!currentWorkspace?.id) return;

    try {
      await disciplinesAPI.update(currentWorkspace.id, disciplineId, data);
      await fetchDisciplines();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar disciplina");
      throw err;
    }
  };

  // Delete discipline
  const handleDeleteDiscipline = async (disciplineId: string) => {
    if (!currentWorkspace?.id) return;
    if (!confirm("Tens a certeza que queres eliminar esta disciplina?")) return;

    try {
      await disciplinesAPI.delete(currentWorkspace.id, disciplineId);
      await fetchDisciplines();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao eliminar disciplina");
    }
  };

  // Loading state
  if (loading && disciplines.length === 0) {
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
        <p className="text-slate-500">Seleciona um workspace para ver as disciplinas.</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
        <button onClick={fetchDisciplines} className="ml-4 underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <DisciplinesPage
      disciplines={disciplines}
      onCreateDiscipline={handleCreateDiscipline}
      onUpdateDiscipline={handleUpdateDiscipline}
      onDeleteDiscipline={handleDeleteDiscipline}
    />
  );
}

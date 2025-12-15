"use client";

import { useState, useEffect, useCallback } from "react";
import { eventsAPI } from "@/lib/api";
import type { Event } from "@/types/api-types";
import CreateEventDialog from "./create-event-dialog";
import { Pencil, Trash2 } from "lucide-react";

interface EventsPageProps {
  workspaceId: string | null;
}

export default function EventsPage({ workspaceId }: EventsPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!workspaceId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await eventsAPI.list(workspaceId);
      setEvents(data.events);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Create event
  const handleCreateEvent = async (data: {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    location?: string;
  }) => {
    if (!workspaceId) return;

    try {
      await eventsAPI.create(workspaceId, data);
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar evento");
      throw err;
    }
  };

  // Update event
  const handleUpdateEvent = async (data: {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    location?: string;
  }) => {
    if (!workspaceId || !editingEvent) return;

    try {
      await eventsAPI.update(workspaceId, editingEvent.id, data);
      await fetchEvents();
      setEditingEvent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar evento");
      throw err;
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!workspaceId) return;
    if (!confirm("Tens a certeza que queres eliminar este evento?")) return;

    try {
      await eventsAPI.delete(workspaceId, eventId);
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao eliminar evento");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full size-8 border-b-2 border-[#1E40AF]"></div>
      </div>
    );
  }

  // No workspace
  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-500">Seleciona um workspace para ver os eventos.</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
        <button onClick={fetchEvents} className="ml-4 underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateEvent}
        mode="create"
      />
      <CreateEventDialog
        open={!!editingEvent}
        onOpenChange={(open) => !open && setEditingEvent(null)}
        onSubmit={handleUpdateEvent}
        event={editingEvent}
        mode="edit"
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Eventos</h1>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Criar Evento
        </button>
      </div>

      {/* Lista de Eventos */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-400 text-3xl">event</span>
            </div>
            <p className="text-slate-500 mb-4">Nenhum evento encontrado.</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Criar Primeiro Evento
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{event.title}</h3>
                  {event.description && (
                    <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      {formatDate(event.startDate)}
                      {event.endDate && ` - ${formatDate(event.endDate)}`}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        {event.location}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Criado por {event.createdBy.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

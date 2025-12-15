"use client";

import { useState } from "react";

export type EventType = "trabalho" | "teste" | "projeto" | "tarefa";

interface Event {
    id: number;
    name: string;
    date: string;
    time: string;
    type: EventType;
    discipline: string;
    description?: string;
}

interface EventsPageProps {
    events: Event[];
}

const eventTypeLabels: Record<EventType, { label: string; color: string; bg: string }> = {
    trabalho: { label: "Trabalho", color: "text-purple-700", bg: "bg-purple-100" },
    teste: { label: "Teste", color: "text-red-700", bg: "bg-red-100" },
    projeto: { label: "Projeto", color: "text-blue-700", bg: "bg-blue-100" },
    tarefa: { label: "Tarefa", color: "text-green-700", bg: "bg-green-100" },
};

export default function EventsPage({ events }: EventsPageProps) {
    const [filter, setFilter] = useState<EventType | "all">("all");

    const filteredEvents = filter === "all"
        ? events
        : events.filter(e => e.type === filter);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Eventos</h1>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all"
                            ? "bg-[#1E40AF] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                >
                    Todos
                </button>
                {(Object.keys(eventTypeLabels) as EventType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === type
                                ? "bg-[#1E40AF] text-white"
                                : `${eventTypeLabels[type].bg} ${eventTypeLabels[type].color} hover:opacity-80`
                            }`}
                    >
                        {eventTypeLabels[type].label}
                    </button>
                ))}
            </div>

            {/* Lista de Eventos */}
            <div className="bg-white rounded-xl shadow-md p-6">
                {filteredEvents.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Nenhum evento encontrado</p>
                ) : (
                    <div className="space-y-4">
                        {filteredEvents.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                            >
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${eventTypeLabels[event.type].bg} ${eventTypeLabels[event.type].color}`}>
                                    {eventTypeLabels[event.type].label}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800">{event.name}</h3>
                                    <p className="text-sm text-slate-500">{event.discipline}</p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {event.date} • {event.time}
                                    </p>
                                    {event.description && (
                                        <p className="text-sm text-slate-600 mt-2">{event.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

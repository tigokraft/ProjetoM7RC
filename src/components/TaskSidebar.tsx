"use client";

import { DayEvent } from "@/types/event";

interface Task {
    id: number;
    title: string;
    completed: boolean;
}

interface TaskSidebarProps {
    tasks: Task[];
    onToggleTask: (id: number) => void;
    dayEvents: DayEvent[];
    selectedDate: number;
    onEventClick: (event: DayEvent) => void;
}

export default function TaskSidebar({
    tasks,
    onToggleTask,
    dayEvents,
    selectedDate,
    onEventClick
}: TaskSidebarProps) {
    const completedCount = tasks.filter(task => task.completed).length;
    const totalCount = tasks.length;

    return (
        <div className="flex flex-col gap-6 sticky top-5">
            {/* Minhas Tarefas */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#07396E] text-lg font-bold leading-tight">
                        Minhas Tarefas
                    </h3>
                    <span className="text-sm font-medium text-[#009EE2] bg-[#009EE2]/10 px-3 py-1 rounded-full">
                        {completedCount}/{totalCount}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => onToggleTask(task.id)}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F2F2F2] transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center justify-center mt-0.5">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.completed
                                        ? 'bg-gradient-to-br from-[#009EE2] to-[#07396E] border-[#009EE2]'
                                        : 'border-gray-300 group-hover:border-[#009EE2]'
                                    }`}>
                                    {task.completed && (
                                        <span className="material-symbols-outlined text-white text-sm">
                                            check
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className={`text-sm leading-relaxed flex-1 transition-all ${task.completed
                                    ? 'text-gray-400 line-through'
                                    : 'text-[#000000]'
                                }`}>
                                {task.title}
                            </p>
                        </div>
                    ))}
                </div>

                {tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2 block">
                            task_alt
                        </span>
                        <p className="text-sm">Nenhuma tarefa no momento</p>
                    </div>
                )}
            </div>

            {/* Eventos do Dia */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#07396E] text-lg font-bold leading-tight">
                        Eventos do Dia {selectedDate}
                    </h3>
                    <span className="material-symbols-outlined text-[#FDB515]">
                        event_note
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    {dayEvents.map((event) => (
                        <div
                            key={event.id}
                            onClick={() => onEventClick(event)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F2F2F2] transition-all cursor-pointer group hover:shadow-sm"
                        >
                            <div className="bg-[#FDB515]/20 p-2 rounded-lg group-hover:bg-[#FDB515]/30 transition-colors">
                                <span className="material-symbols-outlined text-[#07396E] text-xl">
                                    {event.icon}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[#000000] text-sm font-medium truncate">
                                    {event.name}
                                </p>
                                <p className="text-[#07396E] text-xs font-normal">
                                    {event.time}
                                </p>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-sm group-hover:text-[#009EE2] transition-colors">
                                chevron_right
                            </span>
                        </div>
                    ))}
                </div>

                {dayEvents.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2 block">
                            event_busy
                        </span>
                        <p className="text-sm">Nenhum evento neste dia</p>
                    </div>
                )}
            </div>
        </div>
    );
}

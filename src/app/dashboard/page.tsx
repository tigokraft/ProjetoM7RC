"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import Calendar from "@/components/Calendar";
import TaskSidebar from "@/components/TaskSidebar";
import EventModal from "@/components/EventModal";
import type { CalendarEvent } from "@/components/Calendar";

interface DayEvent {
  id: number;
  name: string;
  time: string;
  location: string;
  description?: string;
  icon: string;
  date: number;
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(26);
  const [currentMonth, setCurrentMonth] = useState(11); // December (0-indexed)
  const [currentYear, setCurrentYear] = useState(2024);
  const [selectedEvent, setSelectedEvent] = useState<DayEvent | null>(null);

  // Mock data for calendar events
  const allDayEvents: DayEvent[] = [
    {
      id: 1,
      name: "Prova de Cálculo",
      time: "09:00 - 11:00",
      location: "Sala 301, Prédio de Ciências",
      description: "Prova sobre derivadas e integrais. Trazer calculadora científica.",
      icon: "quiz",
      date: 26,
    },
    {
      id: 2,
      name: "Entrega de Trabalho",
      time: "14:00",
      location: "Plataforma Online",
      description: "Enviar relatório de laboratório sobre reações químicas.",
      icon: "assignment",
      date: 26,
    },
  ];

  // Mock tasks
  const tasks = [
    { id: 1, name: "Resolver exercícios", subject: "Cálculo", dueDate: "24 Dez", completed: false },
    { id: 2, name: "Preparar apresentação", subject: "Programação", dueDate: "28 Dez", completed: true },
  ];

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  // Convert to calendar events format
  const calendarEvents: CalendarEvent[] = allDayEvents.map(event => ({
    date: event.date,
    name: event.name,
    time: event.time,
    location: event.location,
    description: event.description,
    icon: event.icon,
  }));

  // Get events for selected date
  const dayEvents = useMemo(() => {
    return allDayEvents.filter(e => e.date === selectedDate);
  }, [selectedDate, allDayEvents]);

  const toggleTask = (id: number) => {
    // Tasks are read-only for now
  };

  const handleEventClick = (event: DayEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-6">
        <SearchBar />
        <Calendar
          events={calendarEvents}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onMonthChange={handleMonthChange}
        />
      </div>
      <aside className="lg:block">
        <TaskSidebar
          tasks={tasks}
          onToggleTask={toggleTask}
          dayEvents={dayEvents}
          selectedDate={selectedDate}
          onEventClick={handleEventClick}
        />
      </aside>
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

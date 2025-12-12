"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import Calendar from "@/components/Calendar";
import TaskSidebar from "@/components/TaskSidebar";
import EventModal from "@/components/EventModal";
import { CalendarEvent } from "@/types/calendar";
import { Task } from "@/types/task";
import { DayEvent } from "@/types/event";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(26);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Revisar conteúdo de Cálculo Avançado", completed: false },
    { id: 2, title: "Preparar relatório de Química Orgânica", completed: true },
    { id: 3, title: "Ler capítulos 5-7 de História Mundial", completed: false },
    { id: 4, title: "Completar exercícios de laboratório", completed: false },
    { id: 5, title: "Estudar para prova de matemática", completed: true },
    { id: 6, title: "Fazer apresentação do projeto final", completed: false },
  ]);

  const [selectedEvent, setSelectedEvent] = useState<DayEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleEventClick = (event: DayEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Eventos do calendário para outubro de 2024
  const calendarEvents: CalendarEvent[] = [
    { id: 1, date: 1, day: "Terça-feira" },
    { id: 2, date: 3, day: "Quinta-feira" },
    { id: 3, date: 5, day: "Sábado" },
    { id: 4, date: 8, day: "Terça-feira" },
    { id: 5, date: 10, day: "Quinta-feira" },
    { id: 6, date: 12, day: "Sábado" },
    { id: 7, date: 15, day: "Terça-feira" },
    { id: 8, date: 17, day: "Quinta-feira" },
    { id: 9, date: 19, day: "Sábado" },
    { id: 10, date: 22, day: "Terça-feira" },
    { id: 11, date: 24, day: "Quinta-feira" },
    { id: 12, date: 26, day: "Sábado" },
    { id: 13, date: 29, day: "Terça-feira" },
    { id: 14, date: 31, day: "Quinta-feira" },
  ];

  // Todos os eventos do mês
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

  // Filtrar eventos do dia selecionado
  const dayEvents = useMemo(() =>
    allDayEvents.filter(event => event.date === selectedDate),
    [selectedDate]
  );

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="flex flex-1 justify-center py-5 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              {/* Conteúdo principal */}
              <div className="flex flex-col gap-8">
                <SearchBar />
                <Calendar
                  events={calendarEvents}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
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
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Detalhes do Evento */}
      {selectedEvent && (
        <EventModal
          isOpen={isModalOpen}
          onClose={closeModal}
          eventName={selectedEvent.name}
          eventTime={selectedEvent.time}
          eventLocation={selectedEvent.location}
          eventDescription={selectedEvent.description}
        />
      )}
    </div>
  );
}


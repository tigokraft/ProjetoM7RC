"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar, { ActivePage } from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import { Calendar } from "@/components/ui/calendar";
import TaskSidebar from "@/components/TaskSidebar";
import EventModal from "@/components/EventModal";
import TasksPage from "@/components/TasksPage";
import EventsPage from "@/components/EventsPage";
import DisciplinesPage from "@/components/DisciplinesPage";
import GroupsPage from "@/components/GroupsPage";
import { CalendarEvent } from "@/types/calendar";
import { Task } from "@/types/task";
import { DayEvent } from "@/types/event";

export default function Home() {
  // Usar a data atual do sistema
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState<ActivePage>("calendario");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  // Load active workspace from localStorage on mount
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem("activeWorkspaceId");
    setActiveWorkspaceId(savedWorkspaceId);
  }, []);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setSelectedDate(1);
  };

  const handleEventClick = (event: DayEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Eventos do calendário
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

  // Workspaces (mock data for now - in production this would come from the API)
  const workspaces = [
    { id: 1, name: "1º Semestre" },
    { id: 2, name: "2º Semestre" },
    { id: 3, name: "Extracurricular" },
  ];

  // All Disciplinas
  const allDisciplines = [
    { id: 1, name: "Cálculo Avançado", teacher: "Prof. João Silva", color: "#1E40AF", workspaceId: 1 },
    { id: 2, name: "Química Orgânica", teacher: "Prof. Maria Santos", color: "#059669", workspaceId: 1 },
    { id: 3, name: "Programação", teacher: "Prof. Carlos Mendes", color: "#7C3AED", workspaceId: 1 },
    { id: 4, name: "Física", teacher: "Prof. Ana Costa", color: "#DC2626", workspaceId: 2 },
    { id: 5, name: "Inglês", teacher: "Prof. Pedro Lima", color: "#EA580C", workspaceId: 2 },
    { id: 6, name: "Música", teacher: "Prof. Rita Fonseca", color: "#0891B2", workspaceId: 3 },
  ];

  // Filter disciplines by active workspace
  const disciplines = useMemo(() => {
    if (!activeWorkspaceId) return allDisciplines;
    // Match string workspace ID from API with numeric workspaceId in mock data
    // In production, both would be strings from the API
    return allDisciplines;
  }, [activeWorkspaceId]);

  // Grupos / Turmas
  const groups = [
    {
      id: 1,
      name: "Turma A - Informática",
      description: "Turma do curso de Informática, 1º ano",
      color: "#1E40AF",
      eventsCount: 8,
      members: [
        { id: 1, name: "Ana Silva", avatar: "https://i.pravatar.cc/150?img=1", role: "admin" as const },
        { id: 2, name: "João Costa", avatar: "https://i.pravatar.cc/150?img=2", role: "member" as const },
        { id: 3, name: "Maria Santos", avatar: "https://i.pravatar.cc/150?img=3", role: "member" as const },
        { id: 4, name: "Pedro Lima", avatar: "https://i.pravatar.cc/150?img=4", role: "member" as const },
      ],
    },
    {
      id: 2,
      name: "Grupo de Estudo - Cálculo",
      description: "Grupo para estudar para os exames de Cálculo",
      color: "#059669",
      eventsCount: 3,
      members: [
        { id: 1, name: "Ana Silva", avatar: "https://i.pravatar.cc/150?img=1", role: "admin" as const },
        { id: 5, name: "Rita Fonseca", avatar: "https://i.pravatar.cc/150?img=5", role: "member" as const },
      ],
    },
    {
      id: 3,
      name: "Turma B - Engenharia",
      description: "Turma do curso de Engenharia Mecânica",
      color: "#7C3AED",
      eventsCount: 12,
      members: [
        { id: 6, name: "Carlos Mendes", avatar: "https://i.pravatar.cc/150?img=6", role: "admin" as const },
        { id: 7, name: "Sofia Rodrigues", avatar: "https://i.pravatar.cc/150?img=7", role: "member" as const },
        { id: 8, name: "Miguel Ferreira", avatar: "https://i.pravatar.cc/150?img=8", role: "member" as const },
      ],
    },
  ];

  // Filtrar eventos do dia selecionado
  const dayEvents = useMemo(() =>
    allDayEvents.filter(event => event.date === selectedDate),
    [selectedDate]
  );

  // Renderizar conteúdo baseado na página ativa
  const renderContent = () => {
    switch (activePage) {
      case "calendario":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="flex flex-col gap-8">
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
          </div>
        );
      case "tarefas":
        return <TasksPage tasks={tasks} onToggleTask={toggleTask} />;
      case "eventos":
        return <EventsPage workspaceId={activeWorkspaceId} />;
      case "disciplinas":
        return <DisciplinesPage disciplines={disciplines} workspaces={workspaces} />;
      case "grupos":
        return <GroupsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activePage={activePage}
        onPageChange={setActivePage}
      />
      <div className={`layout-container flex h-full grow flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-[60px]'}`}>
        <main className="flex flex-1 justify-center py-5 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-7xl">
            {renderContent()}
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

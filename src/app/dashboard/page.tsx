"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import SearchBar from "@/components/SearchBar";
import Calendar, { type DayIndicators } from "@/components/Calendar";
import type { CalendarEvent } from "@/components/Calendar";
import TaskSidebar from "@/components/TaskSidebar";
import EventModal from "@/components/EventModal";
import { tasksAPI, eventsAPI } from "@/lib/api";
import type { Task, Event } from "@/types/api-types";
import type { DayEvent as SidebarDayEvent } from "@/types/event";

interface CalendarDayEvent {
  id: string;
  name: string;
  time: string;
  location: string;
  description?: string;
  icon: string;
  date: number;
  type: "task" | "event";
  isCompleted?: boolean;
}

export default function DashboardPage() {
  const { currentWorkspace } = useWorkspaceContext();
  const today = new Date();
  
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedEvent, setSelectedEvent] = useState<CalendarDayEvent | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks and events for the current month
  const fetchData = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setTasks([]);
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [tasksData, eventsData] = await Promise.all([
        tasksAPI.list(currentWorkspace.id),
        eventsAPI.list(currentWorkspace.id),
      ]);
      
      setTasks(tasksData.tasks);
      setEvents(eventsData.events);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  // Process tasks and events to get day-by-day indicators
  const dayIndicators = useMemo(() => {
    const indicators = new Map<number, DayIndicators>();

    // Process tasks
    tasks.forEach((task) => {
      const taskDate = new Date(task.dueDate);
      if (taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear) {
        const day = taskDate.getDate();
        const existing = indicators.get(day) || {
          hasPendingTasks: false,
          hasCompletedTasks: false,
          hasEvents: false,
        };

        if (task.isCompleted) {
          existing.hasCompletedTasks = true;
        } else {
          existing.hasPendingTasks = true;
        }

        indicators.set(day, existing);
      }
    });

    // Process events
    events.forEach((event) => {
      const eventDate = new Date(event.startDate);
      if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
        const day = eventDate.getDate();
        const existing = indicators.get(day) || {
          hasPendingTasks: false,
          hasCompletedTasks: false,
          hasEvents: false,
        };

        existing.hasEvents = true;
        indicators.set(day, existing);
      }
    });

    return indicators;
  }, [tasks, events, currentMonth, currentYear]);

  // Convert to calendar events format (for legacy compatibility)
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events
      .filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      })
      .map((event) => {
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : null;
        
        const formatTime = (date: Date) => 
          date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
        
        const timeStr = endDate 
          ? `${formatTime(startDate)} - ${formatTime(endDate)}`
          : formatTime(startDate);

        return {
          date: startDate.getDate(),
          name: event.title,
          time: timeStr,
          location: event.location || "Sem localização",
          description: event.description || undefined,
          icon: "event",
        };
      });
  }, [events, currentMonth, currentYear]);

  // Get tasks and events for selected date
  const dayEvents = useMemo(() => {
    const result: CalendarDayEvent[] = [];

    // Add tasks
    tasks.forEach((task) => {
      const taskDate = new Date(task.dueDate);
      if (
        taskDate.getDate() === selectedDate &&
        taskDate.getMonth() === currentMonth &&
        taskDate.getFullYear() === currentYear
      ) {
        result.push({
          id: task.id,
          name: task.title,
          time: taskDate.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          location: task.discipline?.name || "Sem disciplina",
          description: task.description || undefined,
          icon: task.isCompleted ? "check_circle" : "radio_button_unchecked",
          date: selectedDate,
          type: "task",
          isCompleted: task.isCompleted,
        });
      }
    });

    // Add events
    events.forEach((event) => {
      const eventDate = new Date(event.startDate);
      if (
        eventDate.getDate() === selectedDate &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      ) {
        const endDate = event.endDate ? new Date(event.endDate) : null;
        const formatTime = (date: Date) =>
          date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
        
        const timeStr = endDate
          ? `${formatTime(eventDate)} - ${formatTime(endDate)}`
          : formatTime(eventDate);

        result.push({
          id: event.id,
          name: event.title,
          time: timeStr,
          location: event.location || "Sem localização",
          description: event.description || undefined,
          icon: "event",
          date: selectedDate,
          type: "event",
        });
      }
    });

    return result;
  }, [tasks, events, selectedDate, currentMonth, currentYear]);

  // Toggle task completion
  const toggleTask = async (id: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      await tasksAPI.toggleComplete(currentWorkspace.id, id);
      await fetchData();
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const handleEventClick = (event: SidebarDayEvent) => {
    const fullEvent = dayEvents.find(e => e.id === String(event.id));
    if (fullEvent) {
      setSelectedEvent(fullEvent);
    }
  };

  if (loading && !currentWorkspace) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full size-8 border-b-2 border-[#1E40AF]"></div>
      </div>
    );
  }

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
          dayIndicators={dayIndicators}
        />
      </div>
      <aside className="lg:block">
        <TaskSidebar
          tasks={dayEvents.filter((e) => e.type === "task").map((e, idx) => ({
            id: idx + 1,
            title: e.name,
            completed: e.isCompleted || false,
          }))}
          onToggleTask={(id) => {
            const event = dayEvents.filter((e) => e.type === "task")[id - 1];
            if (event) toggleTask(event.id);
          }}
          dayEvents={dayEvents.map(e => ({
            id: Number(e.id.split('-')[e.id.split('-').length - 1]) || 0,
            name: e.name,
            time: e.time,
            location: e.location,
            description: e.description,
            icon: e.icon,
            date: e.date,
          })) as SidebarDayEvent[]}
          selectedDate={selectedDate}
          onEventClick={handleEventClick}
        />
      </aside>
      {selectedEvent && (
        <EventModal
          eventName={selectedEvent.name}
          eventTime={selectedEvent.time}
          eventLocation={selectedEvent.location}
          eventDescription={selectedEvent.description}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

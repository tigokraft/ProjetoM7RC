"use client";

import { useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import Calendar from "@/components/Calendar";
import ScheduleList from "@/components/ScheduleList";
import { CalendarEvent, ScheduleItem } from "@/types/calendar";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(26);

  // Calendar events for October 2024
  const calendarEvents: CalendarEvent[] = [
    { id: 1, date: 1, day: "Tuesday" },
    { id: 2, date: 3, day: "Thursday" },
    { id: 3, date: 5, day: "Saturday" },
    { id: 4, date: 8, day: "Tuesday" },
    { id: 5, date: 10, day: "Thursday" },
    { id: 6, date: 12, day: "Saturday" },
    { id: 7, date: 15, day: "Tuesday" },
    { id: 8, date: 17, day: "Thursday" },
    { id: 9, date: 19, day: "Saturday" },
    { id: 10, date: 22, day: "Tuesday" },
    { id: 11, date: 24, day: "Thursday" },
    { id: 12, date: 26, day: "Saturday" },
    { id: 13, date: 29, day: "Tuesday" },
    { id: 14, date: 31, day: "Thursday" },
  ];

  // Schedule items for October 26, 2024
  const scheduleItems: ScheduleItem[] = [
    {
      id: 1,
      subject: "Advanced Calculus",
      time: "09:00 - 10:30",
      location: "Room 301, Science Building",
      icon: "calculate",
    },
    {
      id: 2,
      subject: "Organic Chemistry",
      time: "11:00 - 12:30",
      location: "Lab 12B, Chemistry Wing",
      icon: "biotech",
    },
    {
      id: 3,
      subject: "World History",
      time: "14:00 - 15:30",
      location: "Room 105, Humanities Hall",
      icon: "public",
    },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="flex flex-1 justify-center py-5 px-4 sm:px-6 lg:px-8">
          <div className="layout-content-container flex flex-col max-w-4xl flex-1 gap-8">
            <SearchBar />
            <Calendar
              events={calendarEvents}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <ScheduleList selectedDate={selectedDate} schedules={scheduleItems} />
          </div>
        </main>
      </div>
    </div>
  );
}


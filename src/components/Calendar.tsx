"use client";

import { CalendarEvent } from "@/types/calendar";

interface CalendarProps {
    events: CalendarEvent[];
    selectedDate: number;
    onDateSelect: (date: number) => void;
}

export default function Calendar({ events, selectedDate, onDateSelect }: CalendarProps) {
    const daysInMonth = 31;
    const firstDayOfMonth = 2; // October 2024 starts on Tuesday (0=Sunday, 2=Tuesday)
    const prevMonthDays = [29, 30];

    const hasEvent = (day: number) => {
        return events.some(event => event.date === day);
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-md">
            <div className="flex min-w-72 w-full flex-1 flex-col gap-0.5">
                <div className="flex items-center p-1 justify-between">
                    <button className="hover:bg-[#009EE2]/10 rounded-full transition-colors">
                        <div className="text-[#07396E] flex size-10 items-center justify-center">
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </div>
                    </button>
                    <p className="text-[#07396E] text-base font-bold leading-tight flex-1 text-center">
                        Outubro 2024
                    </p>
                    <button className="hover:bg-[#009EE2]/10 rounded-full transition-colors">
                        <div className="text-[#07396E] flex size-10 items-center justify-center">
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </div>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                        <p
                            key={index}
                            className="text-[#07396E] text-sm font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5"
                        >
                            {day}
                        </p>
                    ))}

                    {/* Previous month days */}
                    {prevMonthDays.map((day, index) => (
                        <button
                            key={`prev-${day}`}
                            className={`h-12 w-full text-gray-400 text-sm font-medium leading-normal ${index === 0 ? 'col-start-1' : ''}`}
                        >
                            <div className="flex size-full items-center justify-center rounded-lg">{day}</div>
                        </button>
                    ))}

                    {/* Current month days */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                        const isSelected = day === selectedDate;
                        const dayHasEvent = hasEvent(day);

                        return (
                            <button
                                key={day}
                                onClick={() => onDateSelect(day)}
                                className={`h-12 w-full text-sm font-bold leading-normal transition-all duration-200 ${day === 1 ? 'col-start-3' : ''
                                    } ${isSelected
                                        ? 'text-white scale-105'
                                        : 'text-[#07396E] hover:bg-[#009EE2]/15 hover:scale-105'
                                    }`}
                            >
                                <div className={`flex size-full items-center justify-center rounded-lg relative ${isSelected ? 'bg-gradient-to-br from-[#009EE2] to-[#07396E] shadow-lg' : ''
                                    }`}>
                                    {day}
                                    {dayHasEvent && (
                                        <span className={`absolute bottom-2 h-2 w-2 rounded-full ${isSelected ? 'bg-[#FDB515] ring-2 ring-white' : 'bg-[#FDB515]'
                                            }`}></span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

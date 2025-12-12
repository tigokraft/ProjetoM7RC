"use client";

import { useState } from "react";
import { CalendarEvent } from "@/types/calendar";

interface CalendarProps {
    events: CalendarEvent[];
    selectedDate: number;
    onDateSelect: (date: number) => void;
    currentMonth: number;
    currentYear: number;
    onMonthChange: (month: number, year: number) => void;
}

const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Calendar({
    events,
    selectedDate,
    onDateSelect,
    currentMonth,
    currentYear,
    onMonthChange
}: CalendarProps) {

    // Calcular dias no mês
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Calcular o primeiro dia da semana do mês (0 = Domingo)
    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    // Calcular dias do mês anterior para preencher
    const getPrevMonthDays = (month: number, year: number) => {
        const firstDay = getFirstDayOfMonth(month, year);
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

        const days = [];
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push(daysInPrevMonth - i);
        }
        return days;
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    const prevMonthDays = getPrevMonthDays(currentMonth, currentYear);

    const hasEvent = (day: number) => {
        return events.some(event => event.date === day);
    };

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            if (currentYear > 2024) {
                onMonthChange(11, currentYear - 1);
            }
        } else {
            onMonthChange(currentMonth - 1, currentYear);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            if (currentYear < 2050) {
                onMonthChange(0, currentYear + 1);
            }
        } else {
            onMonthChange(currentMonth + 1, currentYear);
        }
    };

    // Verificar se pode navegar
    const canGoPrevious = !(currentYear === 2024 && currentMonth === 0);
    const canGoNext = !(currentYear === 2050 && currentMonth === 11);

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-md">
            <div className="flex min-w-72 w-full flex-1 flex-col gap-0.5">
                <div className="flex items-center p-1 justify-between">
                    <button
                        onClick={goToPreviousMonth}
                        disabled={!canGoPrevious}
                        className={`hover:bg-[#009EE2]/10 rounded-full transition-colors ${!canGoPrevious ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                        <div className="text-[#07396E] flex size-10 items-center justify-center">
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </div>
                    </button>
                    <p className="text-[#07396E] text-base font-bold leading-tight flex-1 text-center">
                        {MONTH_NAMES[currentMonth]} {currentYear}
                    </p>
                    <button
                        onClick={goToNextMonth}
                        disabled={!canGoNext}
                        className={`hover:bg-[#009EE2]/10 rounded-full transition-colors ${!canGoNext ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
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
                            disabled
                            className="h-12 w-full text-gray-400 text-sm font-medium leading-normal cursor-default"
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
                                className={`h-12 w-full text-sm font-bold leading-normal transition-all duration-200 ${isSelected
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

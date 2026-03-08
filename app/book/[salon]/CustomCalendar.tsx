"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
    selectedDate: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    advanceBookingDays?: number;
};

export default function CustomCalendar({ selectedDate, onChange, advanceBookingDays = 0 }: Props) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minAllowedDate = new Date(today);
    if (advanceBookingDays > 0) {
        minAllowedDate.setDate(minAllowedDate.getDate() + advanceBookingDays);
    }

    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    maxDate.setDate(0); // Dernier jour du 3ème mois

    const initialDate = selectedDate ? new Date(selectedDate) : minAllowedDate;
    const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

    const nextMonth = () => {
        const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        if (next > maxDate) return;
        setCurrentMonth(next);
    };

    const prevMonth = () => {
        const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        // Empêcher d'aller dans un mois passé
        if (prev.getFullYear() < today.getFullYear() || (prev.getFullYear() === today.getFullYear() && prev.getMonth() < today.getMonth())) {
            return;
        }
        setCurrentMonth(prev);
    };

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    // Convertir de US (0=Dimanche) à FR (1=Lundi, 7=Dimanche)
    const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const weekDays = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

    const formatDateStr = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Est-ce le mois actuel pour griser la flèche de retour ?
    const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
    // Est-ce le mois maximum autorisé ?
    const isMaxMonth = currentMonth.getFullYear() === maxDate.getFullYear() && currentMonth.getMonth() === maxDate.getMonth();

    return (
        <div className="bg-black border border-white/10 p-4 rounded-xl shadow-2xl z-10 w-full mb-6 relative">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={prevMonth}
                    disabled={isCurrentMonth}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>
                <div className="font-semibold text-slate-200 capitalize tracking-wide">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button
                    onClick={nextMonth}
                    disabled={isMaxMonth}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} className="h-10" />;

                    const isPast = date < minAllowedDate;
                    const isTooFar = date > maxDate;
                    const isDisabled = isPast || isTooFar;
                    const dateStr = formatDateStr(date);
                    const isSelected = selectedDate === dateStr;

                    return (
                        <button
                            key={idx}
                            disabled={isDisabled}
                            onClick={() => onChange(dateStr)}
                            className={`
                                h-10 w-full rounded-lg flex items-center justify-center text-sm font-medium transition-all
                                ${isDisabled ? "opacity-10 cursor-not-allowed text-slate-700" : "hover:bg-white/10 cursor-pointer text-slate-200"}
                                ${isSelected && !isDisabled ? "bg-emerald-500 text-black font-bold hover:bg-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" : ""}
                            `}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

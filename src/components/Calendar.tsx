"use client";

import React, { useMemo } from "react";

interface CalendarProps {
  year: number;
  month: number;
  events?: { date: Date; title: string; type: string }[];
  onDateClick?: (date: Date) => void;
}

export default function Calendar({ year, month, events = [], onDateClick }: CalendarProps) {
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayOfWeek = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const eventMap = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const ev of events) {
      const key = ev.date.toISOString().split("T")[0]!;
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="w-full">
      <div className="mb-2" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
        {weekdays.map((w) => (
          <div key={w} className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider">{w}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="h-24 rounded-lg bg-slate-800/30" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = eventMap.get(dateStr) ?? [];
          const isToday = new Date().toISOString().split("T")[0] === dateStr;
          return (
            <button key={day} onClick={() => onDateClick?.(new Date(year, month, day))}
              className={`h-24 rounded-lg border p-2 text-left transition hover:border-amber-500/50 hover:bg-slate-800/60 ${isToday ? "border-amber-500/40 bg-amber-500/10" : "border-slate-700/50 bg-slate-800/40"}`}>
              <span className={`text-sm font-semibold ${isToday ? "text-amber-400" : "text-slate-200"}`}>{day}</span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((ev, i) => (
                  <div key={i} className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${ev.type === "task" ? "bg-blue-500/20 text-blue-300" : ev.type === "reminder" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && <div className="text-[10px] text-slate-400">+{dayEvents.length - 3} more</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

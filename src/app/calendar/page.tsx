"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Calendar from "../../components/Calendar";
import { api } from "../../utils/api";

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const { data: tasks } = api.task.list.useQuery();
  const { data: reminders } = api.reminder.list.useQuery();
  const { data: followUps } = api.followUp.list.useQuery();

  const events = [
    ...(tasks?.map((t) => ({ date: t.dueDate ? new Date(t.dueDate) : new Date(), title: t.title, type: "task" as const })) ?? []),
    ...(reminders?.map((r) => ({ date: r.dueDate ? new Date(r.dueDate) : new Date(), title: r.title, type: "reminder" as const })) ?? []),
    ...(followUps?.map((f) => ({ date: new Date(f.dueDate), title: `Follow up: ${f.contact?.name ?? ""}`, type: "followUp" as const })) ?? []),
  ].filter((e) => e.date);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Calendar</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition">←</button>
            <span className="text-white font-medium min-w-[140px] text-center">{new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" })}</span>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition">→</button>
          </div>
        </div>
        <Calendar year={year} month={month} events={events} />
      </main>
    </div>
  );
}

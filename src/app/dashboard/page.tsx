"use client";

import Sidebar from "../../components/Sidebar";
import { api } from "../../utils/api";

export default function DashboardPage() {
  const { data: briefing, isLoading } = api.dashboard.briefing.useQuery();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Daily Briefing</h2>

        {isLoading ? (
          <div className="text-slate-400">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Contacts" value={briefing?.contactsCount ?? 0} />
              <StatCard label="Companies" value={briefing?.companiesCount ?? 0} />
              <StatCard label="Overdue Tasks" value={briefing?.overdueTasks ?? 0} color="text-red-400" />
              <StatCard label="Overdue Reminders" value={briefing?.overdueReminders ?? 0} color="text-red-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <BriefingSection title="Tasks Due Today" items={briefing?.tasksDue ?? []} type="task" />
              <BriefingSection title="Reminders Due Today" items={briefing?.remindersDue ?? []} type="reminder" />
              <BriefingSection title="Follow-ups Due Today" items={briefing?.followUpsDue ?? []} type="followUp" />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color = "text-white" }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function BriefingSection({ title, items, type }: { title: string; items: any[]; type: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nothing due today.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
              <div>
                <div className="text-sm font-medium text-slate-200">{item.title}</div>
                {item.contact && (
                  <div className="text-xs text-slate-500">{item.contact.name}</div>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {item.dueDate ? new Date(item.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

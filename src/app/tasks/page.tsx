"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { api } from "../../utils/api";

export default function TasksPage() {
  const { data: tasks, refetch } = api.task.list.useQuery();
  const { data: contacts } = api.contact.list.useQuery();
  const createTask = api.task.create.useMutation({ onSuccess: () => refetch() });
  const updateTask = api.task.update.useMutation({ onSuccess: () => refetch() });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "medium" as const, contactId: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate({
      title: form.title,
      description: form.description || undefined,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      priority: form.priority,
      contactId: form.contactId || undefined,
    });
    setForm({ title: "", description: "", dueDate: "", priority: "medium", contactId: "" });
    setShowForm(false);
  };

  const toggleStatus = (task: any) => {
    const next = task.status === "done" ? "todo" : "done";
    updateTask.mutate({ id: task.id, status: next });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Tasks & Reminders</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition">+ New Task</button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" required />
            <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
              <option value="">No Contact</option>
              {contacts?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white md:col-span-2" />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {tasks?.map((task) => (
            <div key={task.id} className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
              <button onClick={() => toggleStatus(task)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${task.status === "done" ? "bg-amber-500 border-amber-500" : "border-slate-600"}`}>
                {task.status === "done" && <span className="text-slate-950 text-xs font-bold">✓</span>}
              </button>
              <div className="flex-1">
                <div className={`text-sm font-medium ${task.status === "done" ? "line-through text-slate-500" : "text-white"}`}>{task.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"} • {task.priority}
                  {task.contact ? ` • ${task.contact.name}` : ""}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${task.priority === "high" ? "bg-red-500/20 text-red-400" : task.priority === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

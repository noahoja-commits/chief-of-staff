"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { api } from "../../utils/api";

export default function FollowUpsPage() {
  const { data: followUps, refetch } = api.followUp.list.useQuery();
  const { data: contacts } = api.contact.list.useQuery();
  const createFollowUp = api.followUp.create.useMutation({ onSuccess: () => refetch() });
  const updateFollowUp = api.followUp.update.useMutation({ onSuccess: () => refetch() });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contactId: "", dueDate: "", reason: "", notes: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createFollowUp.mutate({
      contactId: form.contactId,
      dueDate: new Date(form.dueDate).toISOString(),
      reason: form.reason || undefined,
      notes: form.notes || undefined,
    });
    setForm({ contactId: "", dueDate: "", reason: "", notes: "" });
    setShowForm(false);
  };

  const toggleStatus = (fu: any) => {
    const next = fu.status === "completed" ? "pending" : "completed";
    updateFollowUp.mutate({ id: fu.id, status: next });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Follow-ups</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition">+ New Follow-up</button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" required>
              <option value="">Select Contact</option>
              {contacts?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" required />
            <input placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
            <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white md:col-span-2" />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {followUps?.map((fu) => (
            <div key={fu.id} className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
              <button onClick={() => toggleStatus(fu)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${fu.status === "completed" ? "bg-amber-500 border-amber-500" : "border-slate-600"}`}>
                {fu.status === "completed" && <span className="text-slate-950 text-xs font-bold">✓</span>}
              </button>
              <div className="flex-1">
                <div className={`text-sm font-medium ${fu.status === "completed" ? "line-through text-slate-500" : "text-white"}`}>
                  Follow up with {fu.contact?.name ?? "Unknown"}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {new Date(fu.dueDate).toLocaleString()} {fu.reason ? `• ${fu.reason}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

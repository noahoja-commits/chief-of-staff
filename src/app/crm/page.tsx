"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { api } from "../../utils/api";

export default function CRMPage() {
  const [search, setSearch] = useState("");
  const { data: contacts, refetch } = api.contact.list.useQuery({ search: search || undefined });
  const { data: companies } = api.company.list.useQuery();
  const createContact = api.contact.create.useMutation({ onSuccess: () => refetch() });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", companyId: "", notes: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createContact.mutate({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      companyId: form.companyId || undefined,
      notes: form.notes || undefined,
    });
    setForm({ name: "", email: "", phone: "", companyId: "", notes: "" });
    setShowForm(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Contacts & Companies</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition"
          >
            + Add Contact
          </button>
        </div>

        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 mb-6"
        />

        {showForm && (
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" required />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
            <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
              <option value="">No Company</option>
              {companies?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white md:col-span-2" />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts?.map((contact) => (
            <div key={contact.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-lg font-semibold text-white">{contact.name}</div>
              {contact.email && <div className="text-sm text-slate-400 mt-1">{contact.email}</div>}
              {contact.phone && <div className="text-sm text-slate-400">{contact.phone}</div>}
              {contact.company && <div className="text-sm text-amber-400 mt-2">{contact.company.name}</div>}
              {contact.notes && <div className="text-sm text-slate-500 mt-2">{contact.notes}</div>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

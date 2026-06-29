"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { api } from "../../utils/api";

export default function AssistantPage() {
  const [message, setMessage] = useState("");
  const { data: history, refetch } = api.assistant.getHistory.useQuery({ limit: 50 });
  const sendMessage = api.assistant.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage.mutate({ message: message.trim() });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <h2 className="text-xl font-bold text-white">AI Assistant</h2>
          <p className="text-sm text-slate-400">Ask me to create contacts, tasks, reminders, or follow-ups.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {history?.length === 0 && (
            <div className="text-center text-slate-500 mt-12">
              <p className="text-lg mb-2">👋 Welcome!</p>
              <p>Try: "Remind me to call Alex Thursday" or "Add Sarah from Acme as a contact"</p>
            </div>
          )}
          {history?.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-3xl ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
            >
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-amber-500/10 text-amber-100 border border-amber-500/20"
                    : "bg-slate-800 text-slate-200 border border-slate-700"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {sendMessage.isLoading && (
            <div className="mr-auto max-w-3xl">
              <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-400">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
              disabled={sendMessage.isLoading}
            />
            <button
              type="submit"
              disabled={sendMessage.isLoading || !message.trim()}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

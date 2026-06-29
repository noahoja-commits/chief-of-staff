"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { api } from "../../utils/api";

export default function SettingsPage() {
  const { data: settings, refetch } = api.settings.get.useQuery();
  const updateSettings = api.settings.update.useMutation({ onSuccess: () => refetch() });
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [preferredProvider, setPreferredProvider] = useState("default");
  const [timezone, setTimezone] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setPreferredProvider(settings.preferredProvider);
      setTimezone(settings.timezone);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      openaiKey: openaiKey || "••••••••",
      anthropicKey: anthropicKey || "••••••••",
      preferredProvider: preferredProvider as any,
      timezone: timezone || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const timezones = Intl.supportedValuesOf?.("timeZone") ?? [
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney",
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">OpenAI API Key</label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder={settings?.openaiKey ? "•••••••• (set)" : "sk-..."}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            <p className="text-xs text-slate-500 mt-1">Your key is encrypted before storage.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Anthropic API Key</label>
            <input
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder={settings?.anthropicKey ? "•••••••• (set)" : "sk-ant-..."}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Provider</label>
            <select value={preferredProvider} onChange={(e) => setPreferredProvider(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white">
              <option value="default">Auto (OpenAI first)</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white">
              <option value="">Select timezone...</option>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <button onClick={handleSave} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition">
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </main>
    </div>
  );
}

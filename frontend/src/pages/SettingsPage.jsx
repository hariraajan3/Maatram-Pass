import React, { useEffect, useState } from 'react';
import client from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Settings, Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    windowMonths: '4',
    frequentMinEvents: '3',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client.get('/admin/settings')
      .then((res) => {
        if (res.data.settings) {
          setSettings((prev) => ({ ...prev, ...res.data.settings }));
        }
      })
      .catch((err) => toast.error('Failed to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        client.patch('/admin/settings/windowMonths', { value: settings.windowMonths }),
        client.patch('/admin/settings/frequentMinEvents', { value: settings.frequentMinEvents }),
      ]);
      toast.success('Settings updated successfully!');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="text-amber-600" /> Platform & Engagement Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure segment classification thresholds used for volunteer drifting and retention calculations.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Engagement Analysis Window (Months)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                required
                value={settings.windowMonths}
                onChange={(e) => setSettings({ ...settings, windowMonths: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Default: 4 months. Volunteers with 0 events in this period are classified as Quiet / Drifting.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Frequent Volunteer Minimum Event Count
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={settings.frequentMinEvents}
                onChange={(e) => setSettings({ ...settings, frequentMinEvents: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Default: 3 events. Volunteers attending at least this many events within the window are classified as Frequent.
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

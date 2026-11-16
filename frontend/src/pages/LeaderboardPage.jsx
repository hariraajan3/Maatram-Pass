import React, { useEffect, useState } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { Trophy, Medal, Calendar, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(''); // '' means all-time
  const [loading, setLoading] = useState(true);

  // Generate last 6 months options
  const monthOptions = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthOptions.push({ val, label });
  }

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedMonth]);

  const fetchLeaderboard = () => {
    setLoading(true);
    const params = selectedMonth ? { month: selectedMonth } : {};
    client.get('/dashboard/leaderboard', { params })
      .then((res) => {
        setLeaderboard(res.data.leaderboard || []);
      })
      .catch((err) => {
        toast.error('Failed to load leaderboard.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="text-amber-500" /> Volunteer Recognition Leaderboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Recognising volunteers by number of events attended (with total hours as tie-breaker).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">🏆 All-Time Leaderboard</option>
              {monthOptions.map((m) => (
                <option key={m.val} value={m.val}>
                  📅 {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Volunteer</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Employer / Organization</th>
                    <th className="px-6 py-4 text-center">Events</th>
                    <th className="px-6 py-4 text-right">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((v, idx) => {
                    const rank = idx + 1;
                    return (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold">
                          {rank === 1 ? (
                            <span className="flex items-center gap-1 text-amber-500 text-base">🥇 1</span>
                          ) : rank === 2 ? (
                            <span className="flex items-center gap-1 text-slate-400 text-base">🥈 2</span>
                          ) : rank === 3 ? (
                            <span className="flex items-center gap-1 text-amber-700 text-base">🥉 3</span>
                          ) : (
                            <span className="text-slate-400 font-mono pl-2">{rank}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">{v.name}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {v.type || 'Volunteer'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{v.employer || 'Independent'}</td>
                        <td className="px-6 py-4 text-center font-bold text-blue-600">{v.events}</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">{v.hours} hrs</td>
                      </tr>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">
                        No volunteer records for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

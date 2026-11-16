import React, { useEffect, useState } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import toast from 'react-hot-toast';
import {
  BarChart2, PhoneCall, PhoneOff, UserCheck, AlertTriangle, Filter, Users
} from 'lucide-react';

const COLORS = ['#2563eb', '#6366f1', '#f59e0b', '#94a3b8'];

export default function EngagementReportPage() {
  const [data, setData] = useState(null);
  const [whoToCall, setWhoToCall] = useState({ available: [], doNotContactList: [] });
  const [loading, setLoading] = useState(true);
  const [activeReportTab, setActiveReportTab] = useState('segments'); // 'segments' | 'whotocall' | 'alumni'

  // Who to call filter state
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    Promise.all([
      client.get('/reports/engagement'),
      client.get('/reports/who-to-call'),
    ])
      .then(([engRes, callRes]) => {
        setData(engRes.data);
        setWhoToCall(callRes.data);
      })
      .catch((err) => toast.error('Failed to load engagement report.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const segments = data?.segments || {};
  const chartData = [
    { name: 'Frequent (3+ events)', count: segments.frequent?.length || 0 },
    { name: 'Occasional (1-2 events)', count: segments.occasional?.length || 0 },
    { name: 'Quiet (Drifting)', count: segments.quiet?.length || 0 },
    { name: 'No History', count: segments.noHistory?.length || 0 },
  ];

  // Filtering who-to-call lists
  const filterList = (list) => {
    return list.filter((v) => {
      if (typeFilter !== 'ALL' && v.type !== typeFilter) return false;
      if (skillFilter && !v.skills?.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))) {
        return false;
      }
      return true;
    });
  };

  const filteredAvailable = filterList(whoToCall.available);
  const filteredDoNotContact = filterList(whoToCall.doNotContactList);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="text-blue-600" /> Volunteer Engagement & Insights
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Analysis Window: <strong className="text-slate-700">{data?.windowLabel}</strong>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveReportTab('segments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeReportTab === 'segments'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Engagement Segments
            </button>
            <button
              onClick={() => setActiveReportTab('whotocall')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeReportTab === 'whotocall'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Who to Call (Interviews)
            </button>
            <button
              onClick={() => setActiveReportTab('alumni')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeReportTab === 'alumni'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Alumni Consistency
            </button>
          </div>
        </div>

        {/* TAB 1: SEGMENTS & DRIFTING */}
        {activeReportTab === 'segments' && (
          <div className="space-y-8">
            {/* Overview Cards & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Segments Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase mb-4">
                  Volunteers by Engagement Segment
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Student vs Alumni Breakdown */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase mb-4">Student vs Alumni Split</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-xs uppercase font-bold text-blue-600">Students</p>
                      <h4 className="text-3xl font-black text-blue-900 mt-1">
                        {data?.studentAlumniSplit?.students || 0}
                      </h4>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl">
                      <p className="text-xs uppercase font-bold text-indigo-600">Alumni</p>
                      <h4 className="text-3xl font-black text-indigo-900 mt-1">
                        {data?.studentAlumniSplit?.alumni || 0}
                      </h4>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-4 text-center">
                  Total Active Community: {data?.studentAlumniSplit?.total || 0} volunteers
                </p>
              </div>
            </div>

            {/* Drifting Away List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-amber-500" size={20} />
                <h3 className="text-base font-bold text-slate-800">
                  Volunteers Drifting Away ({data?.driftingAway?.length || 0})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                These volunteers actively participated in the past, but have 0 logged events in the current {data?.windowMonths}-month window. A friendly check-in can re-engage them.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Volunteer</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Employer</th>
                      <th className="px-4 py-3">Lifetime Events</th>
                      <th className="px-4 py-3">Lifetime Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.driftingAway?.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-800">{v.name}</td>
                        <td className="px-4 py-3">{v.type}</td>
                        <td className="px-4 py-3">{v.employer || 'Independent'}</td>
                        <td className="px-4 py-3 font-semibold text-blue-600">{v.totalEvents}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{v.totalHours} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WHO TO CALL (INTERVIEWS) */}
        {activeReportTab === 'whotocall' && (
          <div>
            {/* Filter controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase">
                <Filter size={14} /> Filters:
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="ALL">All Types (Student & Alumni)</option>
                <option value="STUDENT">Students Only</option>
                <option value="ALUMNI">Alumni Only</option>
              </select>

              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="Filter by skill (e.g. Python)..."
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Side-by-side lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available to Contact */}
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6">
                <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold">
                  <PhoneCall size={20} className="text-emerald-600" />
                  <h3>Available to Call ({filteredAvailable.length})</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Consented to interview contacts (`INTERVIEW_CONTACT = true`) and `doNotContact = false`.
                </p>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredAvailable.map((v) => (
                    <div key={v.id} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800">{v.name}</h4>
                        <span className="font-semibold text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                          {v.type}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{v.email} • {v.employer || 'Independent'}</p>
                      {v.skills && v.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {v.skills.map((s) => (
                            <span key={s} className="bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredAvailable.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No matching available volunteers.</p>
                  )}
                </div>
              </div>

              {/* Do Not Contact */}
              <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
                <div className="flex items-center gap-2 mb-2 text-red-800 font-bold">
                  <PhoneOff size={20} className="text-red-600" />
                  <h3>Do Not Contact / No Consent ({filteredDoNotContact.length})</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Volunteers who opted out or did not grant interview contact consent.
                </p>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredDoNotContact.map((v) => (
                    <div key={v.id} className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-xs">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800">{v.name}</h4>
                        <span className="font-semibold text-[10px] bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
                          {v.type}
                        </span>
                      </div>
                      <p className="text-red-700 font-semibold mt-1">Reason: {v.reason}</p>
                      <p className="text-slate-500 mt-0.5">{v.employer || 'Independent'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALUMNI CONSISTENCY */}
        {activeReportTab === 'alumni' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-800 mb-2">Alumni Volunteering Consistency</h3>
            <p className="text-xs text-slate-500 mb-6">
              Consistency score is calculated as active volunteering months in the last 12 months divided by 12.
            </p>

            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Alumni Volunteer</th>
                  <th className="px-4 py-3">Employer</th>
                  <th className="px-4 py-3">Active Months (Last 12m)</th>
                  <th className="px-4 py-3 text-right">Consistency Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.alumniScores?.map((al) => (
                  <tr key={al.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{al.name}</td>
                    <td className="px-4 py-3">{al.employer || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{al.activeMonths} / 12 months</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono font-bold px-2.5 py-1 rounded-full text-xs ${
                        al.consistencyScore >= 0.5 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {Math.round(al.consistencyScore * 100)}% ({al.consistencyScore})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

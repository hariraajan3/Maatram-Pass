import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Calendar, Users, CheckCircle, Clock, ArrowLeft,
  UserCheck, AlertCircle, ArrowUpCircle
} from 'lucide-react';

export default function ManageOpportunityPage() {
  const { id } = useParams();
  const [opp, setOpp] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'live' | 'completed'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

  const fetchOpportunity = () => {
    setLoading(true);
    client.get(`/opportunities/${id}`)
      .then((res) => setOpp(res.data.opportunity))
      .catch((err) => toast.error('Failed to load opportunity.'))
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await client.patch(`/opportunities/${id}/status`, { status: newStatus });
      toast.success(`Event status updated to ${newStatus}!`);
      fetchOpportunity();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleSelectVolunteer = async (appId) => {
    try {
      const res = await client.patch(`/applications/${appId}/select`);
      toast.success(res.data.message);
      fetchOpportunity();
    } catch (err) {
      toast.error('Failed to select volunteer.');
    }
  };

  const handlePromoteWaitlist = async (appId) => {
    try {
      const res = await client.patch(`/applications/${appId}/promote`);
      toast.success(res.data.message);
      fetchOpportunity();
    } catch (err) {
      toast.error('Failed to promote from waitlist.');
    }
  };

  const handleManualCheckOut = async (attendanceId) => {
    try {
      const res = await client.post('/attendance/checkout', { attendanceId });
      toast.success(res.data.message);
      fetchOpportunity();
    } catch (err) {
      toast.error('Failed to check out volunteer.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!opp) return <div className="text-center py-20">Opportunity not found.</div>;

  const applications = opp.applications || [];
  const attendances = opp.attendances || [];
  const liveSessions = attendances.filter((a) => a.checkIn && !a.checkOut);
  const completedSessions = attendances.filter((a) => a.checkIn && a.checkOut);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/office"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
        >
          <ArrowLeft size={16} /> Back to Office Portal
        </Link>

        {/* Opportunity Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-0.5 rounded-full uppercase">
                {opp.category.replace('_', ' ')}
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-0.5 rounded-full uppercase">
                {opp.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{opp.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(opp.startAt).toLocaleString()} • Capacity: {opp.capacity} volunteers
            </p>
          </div>

          {/* Quick status transition dropdown/buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Change Status:</span>
            {opp.status === 'OPEN' && (
              <button
                onClick={() => handleStatusChange('LIVE')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Start Event (LIVE)
              </button>
            )}
            {opp.status === 'LIVE' && (
              <button
                onClick={() => handleStatusChange('COMPLETED')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Mark Event COMPLETED
              </button>
            )}
            {opp.status === 'DRAFT' && (
              <button
                onClick={() => handleStatusChange('OPEN')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Open for Applications
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'upcoming'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Registered & Applicants ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Attendance ({liveSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'completed'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed Sessions ({completedSessions.length})
          </button>
        </div>

        {/* Tab 1: Upcoming / Applicants */}
        {activeTab === 'upcoming' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Volunteer</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Employer</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4">Application Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{app.user.name}</div>
                      <div className="text-xs text-slate-400">{app.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
                        {app.user.type || 'Volunteer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{app.user.employer?.name || '-'}</td>
                    <td className="px-6 py-4 text-xs">{app.user.skills?.join(', ') || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        app.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'SELECTED' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'WAITLISTED' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'APPLIED' && (
                        <button
                          onClick={() => handleSelectVolunteer(app.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                        >
                          Select Volunteer
                        </button>
                      )}
                      {app.status === 'WAITLISTED' && (
                        <button
                          onClick={() => handlePromoteWaitlist(app.id)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1 ml-auto"
                        >
                          <ArrowUpCircle size={14} /> Promote
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No applications registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Live Attendance */}
        {activeTab === 'live' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">Currently Checked-In Volunteers</h3>
            {liveSessions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {liveSessions.map((att) => (
                  <div key={att.id} className="py-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{att.user.name}</h4>
                      <p className="text-xs text-slate-500">
                        Check-in time: {new Date(att.checkIn).toLocaleTimeString()} • Method: {att.method}
                      </p>
                    </div>
                    <button
                      onClick={() => handleManualCheckOut(att.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Check Out
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic py-6 text-center">
                No active check-in sessions right now. Use the QR Scanner to check volunteers in.
              </p>
            )}
          </div>
        )}

        {/* Tab 3: Completed Sessions */}
        {activeTab === 'completed' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Volunteer</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Hours Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedSessions.map((att) => (
                  <tr key={att.id}>
                    <td className="px-6 py-4 font-bold text-slate-800">{att.user.name}</td>
                    <td className="px-6 py-4 text-xs">{new Date(att.checkIn).toLocaleTimeString()}</td>
                    <td className="px-6 py-4 text-xs">{new Date(att.checkOut).toLocaleTimeString()}</td>
                    <td className="px-6 py-4 text-xs font-semibold">{att.method}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">
                      {att.hours} hrs
                    </td>
                  </tr>
                ))}
                {completedSessions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No completed volunteer sessions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

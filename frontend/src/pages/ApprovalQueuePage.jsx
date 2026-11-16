import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Check, X, Shield, Users, Clock } from 'lucide-react';

export default function ApprovalQueuePage() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('VOLUNTEER'); // 'VOLUNTEER' | 'OFFICE_TEAM'

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = () => {
    setLoading(true);
    client.get('/admin/approval-queue')
      .then((res) => setPendingUsers(res.data.pendingUsers || []))
      .catch((err) => toast.error('Failed to load pending queue.'))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (userId, status) => {
    try {
      await client.patch(`/admin/users/${userId}/status`, { status });
      toast.success(`Account ${status.toLowerCase()}!`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.');
    }
  };

  if (loading) return <LoadingSpinner />;

  const volunteers = pendingUsers.filter((u) => u.role === 'VOLUNTEER');
  const officeTeam = pendingUsers.filter((u) => u.role === 'OFFICE_TEAM');
  const displayedList = activeTab === 'VOLUNTEER' ? volunteers : officeTeam;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Account Approval Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Review new sign-ups before granting community access.</p>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('VOLUNTEER')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 ${
              activeTab === 'VOLUNTEER'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={16} /> Volunteer Sign-ups ({volunteers.length})
          </button>

          {user.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('OFFICE_TEAM')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 ${
                activeTab === 'OFFICE_TEAM'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield size={16} /> Office Team Sign-ups ({officeTeam.length})
            </button>
          )}
        </div>

        {/* Table of pending users */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Employer / Org</th>
                <th className="px-6 py-4">Skills</th>
                <th className="px-6 py-4">Consents</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedList.map((u) => {
                const dataConsent = u.consents?.find((c) => c.type === 'DATA_USE')?.granted;
                const interviewConsent = u.consents?.find((c) => c.type === 'INTERVIEW_CONTACT')?.granted;
                const linkedInConsent = u.consents?.find((c) => c.type === 'LINKEDIN_SHARE')?.granted;

                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {u.type || u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{u.employer?.name || '-'}</td>
                    <td className="px-6 py-4 text-xs">{u.skills?.join(', ') || '-'}</td>
                    <td className="px-6 py-4 text-xs space-y-0.5">
                      <div className={dataConsent ? 'text-green-600' : 'text-slate-400'}>
                        ✓ Data Use: {dataConsent ? 'Yes' : 'No'}
                      </div>
                      <div className={interviewConsent ? 'text-green-600' : 'text-slate-400'}>
                        ✓ Interviews: {interviewConsent ? 'Yes' : 'No'}
                      </div>
                      <div className={linkedInConsent ? 'text-green-600' : 'text-slate-400'}>
                        ✓ LinkedIn: {linkedInConsent ? 'Yes' : 'No'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(u.id, 'APPROVED')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(u.id, 'REJECTED')}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                      >
                        <X size={14} /> Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
              {displayedList.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">
                    No pending accounts in this queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, LogOut } from 'lucide-react';

export default function PendingApprovalPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Account Pending Approval</h1>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Hello <strong>{user?.name}</strong>, your <strong>{user?.role === 'OFFICE_TEAM' ? 'Office Team' : 'Volunteer'}</strong> account registration has been received and is awaiting approval by our administration team.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 text-left mb-6">
          <p className="font-semibold mb-1">What happens next?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Our team verifies volunteer sign-ups.</li>
            <li>Once approved, you will have access to event sign-ups, your digital Maatram Pass, and the leaderboard.</li>
          </ul>
        </div>

        <button
          onClick={logout}
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}

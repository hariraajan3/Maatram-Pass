import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar, QrCode, ClipboardList, BarChart2, FileText,
  PlusCircle, Users, CheckCircle, Clock
} from 'lucide-react';

export default function OfficeHomePage() {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    openOpportunities: 0,
    needsReview: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/admin/approval-queue'),
      client.get('/opportunities?status=OPEN'),
      client.get('/attendance/needs-review'),
    ])
      .then(([queueRes, oppRes, reviewRes]) => {
        setStats({
          pendingApprovals: queueRes.data.pendingUsers?.length || 0,
          openOpportunities: oppRes.data.opportunities?.length || 0,
          needsReview: reviewRes.data.needsReview?.length || 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Office Team Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Manage event opportunities, verify attendance, and monitor community engagement.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Link
            to="/office/approval-queue"
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.pendingApprovals}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <ClipboardList size={22} />
            </div>
          </Link>

          <Link
            to="/opportunities"
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Open Opportunities</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">{stats.openOpportunities}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar size={22} />
            </div>
          </Link>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Sessions Needing Review</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.needsReview}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <h2 className="text-lg font-bold text-slate-800 mb-4">Event Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/office/opportunities/new"
            className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <PlusCircle size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Create Opportunity</h3>
            <p className="text-xs text-slate-500">Post school visits, admissions panels, BGV, or mock interviews.</p>
          </Link>

          <Link
            to="/office/scanner"
            className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <QrCode size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">QR / Manual Check-In</h3>
            <p className="text-xs text-slate-500">Scan volunteer Maatram Pass QR or manually log attendance.</p>
          </Link>

          <Link
            to="/office/reports/engagement"
            className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BarChart2 size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Engagement Report</h3>
            <p className="text-xs text-slate-500">View 4 segments, drifting volunteers, and interview call lists.</p>
          </Link>

          <Link
            to="/office/reports/employer"
            className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-amber-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Employer Report</h3>
            <p className="text-xs text-slate-500">Generate and export company volunteering impact as CSV or PDF.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

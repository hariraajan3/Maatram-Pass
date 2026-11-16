import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Shield, Users, FileText, Settings, BarChart2, CheckSquare } from 'lucide-react';

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full uppercase mb-2">
            <Shield size={14} /> System Administrator
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Control Center</h1>
          <p className="text-sm text-slate-500 mt-1">Superuser controls for accounts, audit trails, and platform configurations.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">User & Role Management</h3>
            <p className="text-xs text-slate-500">View all registered accounts, change roles, suspend, or reactivate accounts.</p>
          </Link>

          <Link
            to="/office/approval-queue"
            className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <CheckSquare size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Staff & Volunteer Approvals</h3>
            <p className="text-xs text-slate-500">Approve pending Office Team staff accounts and volunteer applications.</p>
          </Link>

          <Link
            to="/admin/audit"
            className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Security Audit Log</h3>
            <p className="text-xs text-slate-500">Tamper-evident trail of who did what and when across the entire portal.</p>
          </Link>

          <Link
            to="/admin/settings"
            className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Settings size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Platform Settings</h3>
            <p className="text-xs text-slate-500">Configure engagement window months and frequent attendance thresholds.</p>
          </Link>

          <Link
            to="/office/reports/engagement"
            className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BarChart2 size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Community Analytics</h3>
            <p className="text-xs text-slate-500">4-segment engagement breakdown, alumni consistency, and contact lists.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

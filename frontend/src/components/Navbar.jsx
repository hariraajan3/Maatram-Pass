import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CreditCard, Calendar, Trophy, QrCode,
  Users, FileText, Settings, LogOut, Shield, ClipboardList,
  BarChart2, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const volunteerLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/opportunities', icon: Calendar, label: 'Opportunities' },
  { to: '/pass', icon: CreditCard, label: 'My Pass' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

const officeLinks = [
  { to: '/office', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/office/opportunities/new', icon: Calendar, label: 'New Opportunity' },
  { to: '/office/scanner', icon: QrCode, label: 'QR Scanner' },
  { to: '/office/approval-queue', icon: ClipboardList, label: 'Approvals' },
  { to: '/office/reports/engagement', icon: BarChart2, label: 'Engagement' },
  { to: '/office/reports/employer', icon: FileText, label: 'Employer Report' },
];

const adminLinks = [
  { to: '/admin', icon: Shield, label: 'Admin Home' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/audit', icon: FileText, label: 'Audit Log' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/office', icon: LayoutDashboard, label: 'Office' },
  { to: '/office/scanner', icon: QrCode, label: 'Scanner' },
  { to: '/office/approval-queue', icon: ClipboardList, label: 'Approvals' },
  { to: '/office/reports/engagement', icon: BarChart2, label: 'Engagement' },
  { to: '/office/reports/employer', icon: FileText, label: 'Employer Report' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const links =
    user.role === 'ADMIN' ? adminLinks :
    user.role === 'OFFICE_TEAM' ? officeLinks :
    volunteerLinks;

  const isActive = (to) => location.pathname === to;

  return (
    <nav className="bg-maatram-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-white">
              Maatram <span className="text-blue-300">Pass</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, icon: Icon, label }) => (
              <Link
                key={to + label}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-blue-200">{user.name}</span>
            <span className="text-xs bg-blue-700 px-2 py-0.5 rounded-full">{user.role}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-sm text-blue-200 hover:text-white transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-blue-800 px-4 py-3 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to + label}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                isActive(to)
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-blue-800 flex items-center justify-between">
            <span className="text-sm text-blue-200">{user.name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-sm text-blue-200 hover:text-white"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

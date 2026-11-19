import React, { useEffect, useState } from 'react';
import client from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Users, Search, Filter, Shield, CheckCircle, Ban, RefreshCw } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = () => {
    setLoading(true);
    const params = {};
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;

    client.get('/admin/users', { params })
      .then((res) => setUsers(res.data.users || []))
      .catch((err) => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await client.patch(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`Account status updated to ${newStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.employer?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-blue-600" /> User Accounts & Role Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">Manage portal volunteers, office staff, and role authorizations.</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
            >
              <option value="">All Roles</option>
              <option value="VOLUNTEER">Volunteers</option>
              <option value="OFFICE_TEAM">Office Team</option>
              <option value="ADMIN">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Contribution</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">{u.type || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        u.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        u.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {u.totalHours} hrs • {u.totalEvents} events
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {u.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(u.id, 'APPROVED')}
                          className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          Approve
                        </button>
                      )}
                      {u.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(u.id, 'SUSPENDED')}
                          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold"
                        >
                          Suspend
                        </button>
                      )}
                      {u.status === 'SUSPENDED' && (
                        <button
                          onClick={() => handleUpdateStatus(u.id, 'APPROVED')}
                          className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-bold"
                        >
                          Reactivate
                        </button>
                      )}
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

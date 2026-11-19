import React, { useEffect, useState } from 'react';
import client from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FileText, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const fetchLogs = (p) => {
    setLoading(true);
    client.get(`/admin/audit?page=${p}&limit=20`)
      .then((res) => {
        setLogs(res.data.logs || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => toast.error('Failed to load audit logs.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-purple-600" /> Platform Security Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete record of administrative actions, volunteer status changes, and attendance overrides.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 font-sans">
                    <td className="px-6 py-3 font-mono text-slate-400">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {l.actor ? `${l.actor.name} (${l.actor.role})` : 'System Job'}
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {l.entity ? `${l.entity} #${l.entityId?.slice(0, 8)}...` : '-'}
                    </td>
                    <td className="px-6 py-3 font-mono text-[11px] text-slate-500">
                      {l.meta ? JSON.stringify(l.meta) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

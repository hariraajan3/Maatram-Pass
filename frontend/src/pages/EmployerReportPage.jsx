import React, { useState } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';
import EmployerAutocomplete from '../components/EmployerAutocomplete';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  FileText, Download, Printer, Search, Calendar, Building2, Users, Clock
} from 'lucide-react';

export default function EmployerReportPage() {
  const [employerId, setEmployerId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!employerId) {
      toast.error('Please select an employer first.');
      return;
    }

    setLoading(true);
    try {
      const res = await client.get('/reports/employer', {
        params: { employerId, from: from || undefined, to: to || undefined },
      });
      setReportData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!employerId) return;
    const url = `${client.defaults.baseURL}/reports/employer/csv?employerId=${employerId}&from=${from}&to=${to}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Controls Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 print:hidden">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="text-amber-600" /> Employer-Wise Contribution Report
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Summarise hours contributed by corporate and organizational volunteers to share with their CSR teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Employer / Company
              </label>
              <EmployerAutocomplete value={employerId} onChange={setEmployerId} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">From Date</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">To Date</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Search size={15} /> {loading ? 'Generating...' : 'Generate Report'}
            </button>

            {reportData && (
              <>
                <button
                  onClick={handleExportCsv}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Download size={15} /> Export CSV
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Printer size={15} /> Save as PDF / Print
                </button>
              </>
            )}
          </div>
        </div>

        {/* Printable Report Output */}
        {reportData && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 print:border-none print:shadow-none">
            {/* Report Header */}
            <div className="border-b border-slate-200 pb-6 mb-6 flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-extrabold text-blue-600 tracking-widest">
                  Maatram Community Impact Report
                </span>
                <h2 className="text-3xl font-black text-slate-900 mt-1">{reportData.employer?.name}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Reporting Period: {reportData.period?.from} to {reportData.period?.to}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-800">Maatram Foundation</span>
                <p className="text-xs text-slate-400 italic">Scan in. Give back. Get recognised.</p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs uppercase font-bold text-slate-400">Total Volunteers</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{reportData.metrics?.totalVolunteers}</h3>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs uppercase font-bold text-slate-400">Total Hours</p>
                <h3 className="text-2xl font-black text-blue-600 mt-1">{reportData.metrics?.totalHours} hrs</h3>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs uppercase font-bold text-slate-400">Total Events</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{reportData.metrics?.totalEvents}</h3>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs uppercase font-bold text-slate-400">Unique Causes</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{reportData.metrics?.uniqueEvents}</h3>
              </div>
            </div>

            {/* Attendance Breakdown Table */}
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Event Contribution Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Volunteer</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Opportunity Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.attendances?.map((att) => (
                    <tr key={att.id}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{att.volunteerName}</td>
                      <td className="px-4 py-3">{att.volunteerType || 'Volunteer'}</td>
                      <td className="px-4 py-3">{att.eventTitle}</td>
                      <td className="px-4 py-3">{att.category?.replace('_', ' ')}</td>
                      <td className="px-4 py-3">{new Date(att.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-blue-600">
                        {att.hours} hrs
                      </td>
                    </tr>
                  ))}
                  {reportData.attendances?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                        No volunteer sessions recorded for this employer in the selected date range.
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

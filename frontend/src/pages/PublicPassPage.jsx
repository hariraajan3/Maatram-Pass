import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import BadgeDisplay from '../components/BadgeDisplay';
import { Heart, Trophy, Clock, Calendar, Award, ExternalLink } from 'lucide-react';

export default function PublicPassPage() {
  const { userId } = useParams();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/pass/${userId}`)
      .then((res) => {
        setPass(res.data.pass);
        document.title = `${res.data.pass.firstName}'s Maatram Volunteer Pass`;
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (!pass) return <div className="text-center py-20 text-slate-500">Volunteer Pass not found.</div>;

  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
        {/* Header branding */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-1.5 text-blue-900 font-black tracking-wider text-sm">
            <Heart size={18} className="fill-blue-600 text-blue-600" /> MAATRAM PASS
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
            {pass.type || 'Volunteer'}
          </span>
        </div>

        {/* Avatar badge */}
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-full flex items-center justify-center mx-auto text-3xl font-black shadow-lg mb-3">
          {pass.firstName[0]}
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{pass.fullName}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{pass.employer || 'Maatram Community'}</p>
        <p className="text-[11px] text-blue-600 font-semibold mt-1">Speciality: {pass.topCategory}</p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400">Total Hours</p>
            <h3 className="text-2xl font-black text-blue-600 mt-0.5">{pass.totalHours} hrs</h3>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400">Total Events</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{pass.totalEvents}</h3>
          </div>
        </div>

        {/* Badges Earned */}
        {pass.badges && pass.badges.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Recognition Badges</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {pass.badges.map((ub) => (
                <span
                  key={ub.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-bold border border-amber-200"
                >
                  <span>{ub.badge.icon}</span> {ub.badge.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Button */}
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 mb-4"
        >
          <ExternalLink size={14} /> Share on LinkedIn
        </a>

        <div className="text-[11px] text-slate-400 italic">
          Maatram Foundation • Scan in. Give back. Get recognised.
        </div>
      </div>
    </div>
  );
}

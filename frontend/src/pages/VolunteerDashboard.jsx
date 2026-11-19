import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import BadgeDisplay from '../components/BadgeDisplay';
import toast from 'react-hot-toast';
import {
  Clock, Award, Calendar, Trophy, Share2, Copy, Check,
  ArrowRight, ExternalLink, ShieldCheck
} from 'lucide-react';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    client.get('/dashboard/volunteer')
      .then((res) => {
        setData(res.data.dashboard);
        if (res.data.dashboard.linkedInPost) {
          setPostText(res.data.dashboard.linkedInPost);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load dashboard.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(postText);
    setCopied(true);
    toast.success('LinkedIn post copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLinkedIn = () => {
    const cardUrl = `${window.location.origin}/pass/public/${user.id}`;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cardUrl)}`;
    window.open(shareUrl, '_blank', 'width=600,height=600');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl text-white p-6 shadow-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-semibold bg-blue-700/60 uppercase tracking-widest px-2.5 py-1 rounded-full text-blue-200">
              {user.type || 'Volunteer'}
            </span>
            <h1 className="text-2xl font-bold mt-2">Welcome back, {user.name}!</h1>
            <p className="text-blue-200 text-sm italic mt-0.5">Scan in. Give back. Get recognised.</p>
          </div>
          <Link
            to="/pass"
            className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-4 py-2 rounded-xl text-sm shadow-md transition-colors flex items-center gap-2"
          >
            View My Maatram Pass <ArrowRight size={16} />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Hours</p>
              <h3 className="text-2xl font-bold text-slate-800">{data?.totalHours || 0} hrs</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Events Attended</p>
              <h3 className="text-2xl font-bold text-slate-800">{data?.totalEvents || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Community Rank</p>
              <h3 className="text-2xl font-bold text-slate-800">#{data?.rank || 1}</h3>
            </div>
          </div>
        </div>

        {/* Next Badge Progress */}
        {data?.nextBadge && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Award size={18} className="text-amber-500" /> Next Milestone: {data.nextBadge.label}
              </span>
              <span className="text-xs font-medium text-slate-500">{data.nextBadge.current} / {data.nextBadge.target}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, data.nextBadge.progress)}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Earned Badges */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Award className="text-blue-600" size={20} /> Badges & Recognition
            </h2>
            {data?.badges && data.badges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.badges.map((ub) => (
                  <BadgeDisplay key={ub.id} badge={ub.badge} awardedAt={ub.awardedAt} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic py-4">Attend events to earn recognition badges!</p>
            )}
          </div>

          {/* Upcoming Confirmed Events */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} /> Upcoming Confirmed Events
              </h2>
              <Link to="/opportunities" className="text-xs text-blue-600 font-semibold hover:underline">
                Explore all
              </Link>
            </div>
            {data?.upcomingOpportunities && data.upcomingOpportunities.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingOpportunities.map((opp) => (
                  <div key={opp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{opp.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(opp.startAt).toLocaleDateString()} • {opp.isOnline ? 'Online' : opp.location}
                      </p>
                    </div>
                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="text-xs bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-lg hover:bg-blue-200"
                    >
                      Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500 mb-3">No upcoming confirmed events.</p>
                <Link
                  to="/opportunities"
                  className="inline-block text-xs bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Browse Volunteering Opportunities
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* LinkedIn Share Section (Only if consented) */}
        {data?.canShareLinkedIn && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="text-[#0a66c2]" size={20} />
              <h2 className="text-lg font-bold text-slate-800">Share Your Volunteering on LinkedIn</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Ready-to-share post celebrating your contribution. Edit text as needed and share with your network!
            </p>
            <textarea
              rows={3}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <ExternalLink size={14} /> Share on LinkedIn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, MapPin, Globe, Users, Award, CheckCircle,
  AlertCircle, ArrowLeft, Send, ThumbsUp
} from 'lucide-react';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [opp, setOpp] = useState(null);
  const [myApp, setMyApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const [oppRes, appRes] = await Promise.all([
        client.get(`/opportunities/${id}`),
        client.get('/applications/my'),
      ]);
      setOpp(oppRes.data.opportunity);
      const matched = appRes.data.applications.find((a) => a.opportunityId === id);
      setMyApp(matched || null);
    } catch (err) {
      toast.error('Failed to load opportunity details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (interestedOnly = false) => {
    try {
      setSubmitting(true);
      const res = await client.post('/applications/apply', {
        opportunityId: id,
        interested: interestedOnly,
      });
      toast.success(interestedOnly ? 'Interest registered!' : 'Applied successfully!');
      setMyApp(res.data.application);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmSelection = async (confirm) => {
    if (!myApp) return;
    try {
      setSubmitting(true);
      const res = await client.patch(`/applications/${myApp.id}/confirm`, { confirm });
      toast.success(confirm ? 'Selection confirmed! See you at the event.' : 'Selection declined.');
      setMyApp(res.data.application);
    } catch (err) {
      toast.error('Failed to update confirmation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!myApp) return;
    try {
      setSubmitting(true);
      const res = await client.patch(`/applications/${myApp.id}/withdraw`);
      toast.success('Application withdrawn.');
      setMyApp(res.data.application);
    } catch (err) {
      toast.error('Failed to withdraw application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!opp) return <div className="text-center py-20 text-slate-500">Opportunity not found.</div>;

  const isDeadlinePassed = new Date() > new Date(opp.deadline);
  const spotsLeft = Math.max(0, opp.capacity - (opp._count?.applications || 0));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to opportunities
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
              {opp.category.replace('_', ' ')}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${
              opp.status === 'OPEN' ? 'bg-green-100 text-green-700' :
              opp.status === 'LIVE' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              Status: {opp.status}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-4">{opp.title}</h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6 whitespace-pre-line">{opp.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Calendar className="text-blue-600" size={18} />
              <span>
                <strong>Start:</strong> {new Date(opp.startAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="text-blue-600" size={18} />
              <span>
                <strong>End:</strong> {new Date(opp.endAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              {opp.isOnline ? <Globe className="text-blue-600" size={18} /> : <MapPin className="text-blue-600" size={18} />}
              <span>
                <strong>Location:</strong> {opp.isOnline ? (opp.meetingLink || 'Online (link on selection)') : (opp.location || 'Offline')}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="text-blue-600" size={18} />
              <span>
                <strong>Capacity:</strong> {opp.capacity} volunteers ({spotsLeft} spots available)
              </span>
            </div>
          </div>

          {opp.requiredSkills && opp.requiredSkills.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {opp.requiredSkills.map((sk) => (
                  <span key={sk} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 font-medium">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action / Application Status Section */}
          <div className="pt-6 border-t border-slate-200">
            {myApp ? (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <h3 className="text-sm font-bold text-blue-900">
                    Application Status: <span className="uppercase">{myApp.status}</span>
                  </h3>
                </div>

                {myApp.status === 'SELECTED' && (
                  <div className="mt-3">
                    <p className="text-xs text-blue-800 mb-3">
                      🎉 Congratulations! You have been selected. Please confirm your attendance so we can finalize event logistics.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleConfirmSelection(true)}
                        disabled={submitting}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        Confirm Attendance
                      </button>
                      <button
                        onClick={() => handleConfirmSelection(false)}
                        disabled={submitting}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {myApp.status === 'CONFIRMED' && (
                  <div className="mt-2 text-xs text-green-800 font-medium flex justify-between items-center">
                    <span>✅ Attendance confirmed. Show your Maatram Pass QR at the event!</span>
                    <button
                      onClick={handleWithdraw}
                      className="text-xs text-red-600 hover:underline font-semibold ml-4"
                    >
                      Withdraw
                    </button>
                  </div>
                )}

                {myApp.status === 'WAITLISTED' && (
                  <p className="mt-1 text-xs text-amber-700">
                    You are currently on the waitlist. If a confirmed volunteer withdraws, you may be promoted!
                  </p>
                )}

                {myApp.status === 'APPLIED' && (
                  <div className="mt-2 flex justify-between items-center text-xs text-blue-700">
                    <span>Application under review by the coordination team.</span>
                    <button
                      onClick={handleWithdraw}
                      className="text-red-500 hover:underline font-semibold ml-4"
                    >
                      Withdraw Application
                    </button>
                  </div>
                )}
              </div>
            ) : isDeadlinePassed ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle size={18} />
                <span>The deadline for this opportunity has passed. Applications are closed.</span>
              </div>
            ) : opp.status !== 'OPEN' ? (
              <div className="p-4 bg-slate-100 rounded-2xl text-slate-600 text-xs flex items-center gap-2">
                <AlertCircle size={18} />
                <span>This opportunity is not currently open for new applications.</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleApply(false)}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center gap-2"
                >
                  <Send size={16} /> Apply Now
                </button>
                <button
                  onClick={() => handleApply(true)}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
                >
                  <ThumbsUp size={16} /> I'm Interested
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

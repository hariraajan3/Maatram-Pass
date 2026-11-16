import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import BadgeDisplay from '../components/BadgeDisplay';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import { ShieldCheck, Heart, Sparkles, Award, Lock, ExternalLink } from 'lucide-react';

export default function MaatramPassPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [consents, setConsents] = useState({});
  const [activeTab, setActiveTab] = useState('pass'); // 'pass' | 'privacy'
  const [loading, setLoading] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  useEffect(() => {
    Promise.all([
      client.get('/auth/me'),
      client.get('/onboarding/consents'),
    ])
      .then(async ([meRes, consentRes]) => {
        setProfile(meRes.data.user);
        setConsents(consentRes.data.consents || {});
        if (user?.id) {
          const dataUrl = await QRCode.toDataURL(user.id, {
            width: 200,
            margin: 2,
            color: { dark: '#1e3a8a', light: '#ffffff' },
          });
          setQrCodeDataUrl(dataUrl);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load pass details.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleConsentToggle = async (type, currentVal) => {
    try {
      const newVal = !currentVal;
      await client.post('/onboarding/consent', { type, granted: newVal });
      setConsents((prev) => ({ ...prev, [type]: newVal }));
      toast.success('Privacy preference updated.');
    } catch (err) {
      toast.error('Failed to update consent.');
    }
  };

  if (loading) return <LoadingSpinner />;

  const publicUrl = `${window.location.origin}/pass/public/${user.id}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-200 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('pass')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'pass'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Digital ID Pass
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'privacy'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Privacy & Consents
            </button>
          </div>
        </div>

        {activeTab === 'pass' ? (
          <div className="flex flex-col items-center">
            {/* The Maatram Pass Card */}
            <div className="w-full max-w-md bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-7 text-white shadow-2xl border-4 border-blue-400/30 relative overflow-hidden">
              {/* Background watermark */}
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Heart size={200} />
              </div>

              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black tracking-wider text-white">MAATRAM PASS</h2>
                  <p className="text-[11px] text-blue-300 font-medium italic">Scan in. Give back. Get recognised.</p>
                </div>
                <span className="text-[10px] bg-blue-600 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {profile?.type || 'Volunteer'}
                </span>
              </div>

              {/* QR Code section */}
              <div className="bg-white p-4 rounded-2xl flex flex-col items-center shadow-inner mb-6">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="Maatram Pass QR" className="w-44 h-44 rounded-lg" />
                ) : (
                  <div className="w-44 h-44 bg-slate-100 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
                )}
                <span className="text-[11px] font-mono text-slate-500 mt-2">ID: {user.id.slice(0, 12)}...</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Show this at event check-in/out</span>
              </div>

              {/* Volunteer Info */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold tracking-tight text-white">{profile?.name}</h3>
                <p className="text-xs text-blue-200 mt-1">{profile?.employer?.name || 'Maatram Community'}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm text-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">Total Hours</p>
                  <p className="text-xl font-black text-white">{profile?.totalHours || 0} hrs</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">Total Events</p>
                  <p className="text-xl font-black text-white">{profile?.totalEvents || 0}</p>
                </div>
              </div>
            </div>

            {/* Public Card Link */}
            <div className="mt-6 text-center">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
              >
                Preview Public Contribution Card <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ) : (
          /* Privacy & Consents Tab */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-slate-800">Your Privacy & Data Consent</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              You stay in control of your personal information at all times. Update your consents below; every change is securely versioned.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Data Use (Volunteer Management)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Allows Maatram to manage your volunteer hours and attendance.</p>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  Granted (Required)
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Mock & Panel Interview Contact</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Allows Maatram coordinators to reach out to you for interview panels.</p>
                </div>
                <button
                  onClick={() => handleConsentToggle('INTERVIEW_CONTACT', consents.INTERVIEW_CONTACT)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    consents.INTERVIEW_CONTACT
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {consents.INTERVIEW_CONTACT ? 'Granted' : 'Revoked'}
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">LinkedIn Share Prompts</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Generates ready-to-share social contribution posts on completion.</p>
                </div>
                <button
                  onClick={() => handleConsentToggle('LINKEDIN_SHARE', consents.LINKEDIN_SHARE)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    consents.LINKEDIN_SHARE
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {consents.LINKEDIN_SHARE ? 'Granted' : 'Revoked'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

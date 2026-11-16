import React, { useEffect, useState, useRef } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { QrCode, Search, CheckCircle, LogOut, AlertTriangle, Camera } from 'lucide-react';

export default function QRScannerPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [manualUserId, setManualUserId] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [showOverride, setShowOverride] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    client.get('/opportunities?status=OPEN')
      .then((res) => {
        const opps = res.data.opportunities || [];
        setOpportunities(opps);
        if (opps.length > 0) setSelectedOppId(opps[0].id);
      })
      .catch(console.error);
  }, []);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      toast.error('Camera not accessible. Please use the manual volunteer ID input.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleProcessScan = async (userId, override = '') => {
    if (!selectedOppId) {
      toast.error('Please select an opportunity first.');
      return;
    }

    setLoading(true);
    try {
      // First attempt check-in
      const checkinRes = await client.post('/attendance/checkin', {
        userId,
        opportunityId: selectedOppId,
        method: 'QR',
        overrideNote: override || overrideNote,
      });

      toast.success(checkinRes.data.message);
      setLastScanResult({ type: 'CHECKIN', data: checkinRes.data.attendance });
      setShowOverride(false);
      setOverrideNote('');
    } catch (err) {
      if (err.response?.data?.needsOverride) {
        setShowOverride(true);
        setManualUserId(userId);
        toast.error('Volunteer is not confirmed. Provide an override note to check in.');
      } else if (err.response?.data?.error?.includes('already checked in')) {
        // Volunteer already checked in -> trigger checkout!
        try {
          const checkoutRes = await client.post('/attendance/checkout', {
            userId,
            opportunityId: selectedOppId,
          });
          toast.success(checkoutRes.data.message);
          setLastScanResult({ type: 'CHECKOUT', data: checkoutRes.data.attendance });
        } catch (checkoutErr) {
          toast.error(checkoutErr.response?.data?.error || 'Check-out failed.');
        }
      } else {
        toast.error(err.response?.data?.error || 'Failed to process check-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualAction = (isCheckIn) => {
    if (!manualUserId.trim()) {
      toast.error('Please enter a volunteer ID.');
      return;
    }
    if (isCheckIn) {
      handleProcessScan(manualUserId.trim(), overrideNote);
    } else {
      client.post('/attendance/checkout', {
        userId: manualUserId.trim(),
        opportunityId: selectedOppId,
      })
        .then((res) => toast.success(res.data.message))
        .catch((err) => toast.error(err.response?.data?.error || 'Check-out failed.'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <QrCode className="text-emerald-600" /> Event Attendance Scanner
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Scan a volunteer's Maatram Pass QR to check them in; scanning again checks them out.
          </p>
        </div>

        {/* Opportunity Selector */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            Select Active Event / Opportunity
          </label>
          <select
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          >
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.title} ({opp.category}) • {new Date(opp.startAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camera QR Reader */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                <Camera size={18} className="text-blue-600" /> QR Camera Scanner
              </h3>
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Stop Camera
                </button>
              )}
            </div>

            <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <Camera size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Camera is idle.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Click "Start Camera" or enter volunteer ID below.</p>
                </div>
              )}
            </div>

            {lastScanResult && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                <p className="font-bold">
                  {lastScanResult.type === 'CHECKIN' ? '✅ Check-In Logged' : '🏁 Check-Out Completed'}
                </p>
                <p className="mt-0.5">Session recorded successfully.</p>
              </div>
            )}
          </div>

          {/* Manual Fallback */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2">
                <Search size={18} className="text-slate-600" /> Manual Fallback
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                If camera is unavailable or volunteer does not have digital pass, enter their volunteer User ID:
              </p>

              <input
                type="text"
                value={manualUserId}
                onChange={(e) => setManualUserId(e.target.value)}
                placeholder="Enter volunteer User ID..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none mb-3"
              />

              {showOverride && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
                    <AlertTriangle size={14} /> Staff Override Required
                  </div>
                  <input
                    type="text"
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    placeholder="Reason for manual check-in (e.g. walk-in approved by lead)..."
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs bg-white focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleManualAction(true)}
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={16} /> Check In
              </button>
              <button
                onClick={() => handleManualAction(false)}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <LogOut size={16} /> Check Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

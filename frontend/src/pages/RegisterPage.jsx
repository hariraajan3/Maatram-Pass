import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../services/auth';
import EmployerAutocomplete from '../components/EmployerAutocomplete';
import toast from 'react-hot-toast';
import { UserPlus, Heart, Info } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VOLUNTEER',
    type: 'STUDENT',
    employerId: '',
    skills: '',
    consents: {
      DATA_USE: false,
      INTERVIEW_CONTACT: false,
      LINKEDIN_SHARE: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.consents.DATA_USE) {
      toast.error('Data Use consent is required to register as a volunteer.');
      return;
    }

    setLoading(true);
    try {
      const skillsArray = formData.skills
        ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await registerApi({
        ...formData,
        skills: skillsArray,
      });

      toast.success('Registration successful! Please sign in to check your account status.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 py-10 px-4 flex justify-center items-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-700 rounded-full mb-2">
            <Heart className="w-6 h-6 fill-current text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Join Maatram Community</h1>
          <p className="text-xs text-slate-500 italic mt-0.5">Scan in. Give back. Get recognised.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ananya Krishnan"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Info size={11} /> Used to issue your official Maatram Pass & certificates.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">For event confirmations.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Minimum 6 characters.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="VOLUNTEER">Volunteer</option>
                <option value="OFFICE_TEAM">Office Team (Staff)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Office accounts require admin approval.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Volunteer Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="STUDENT">Student</option>
                <option value="ALUMNI">Alumni</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Helps us track alumni consistency.</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Employer / Organization</label>
            <EmployerAutocomplete
              value={formData.employerId}
              onChange={(employer) => setFormData({
                ...formData,
                employerId: typeof employer === 'object' ? employer?.id || '' : employer,
              })}
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">For aggregate employer impact reports.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Skills (Comma-separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. Mock Interviews, Python, Admissions, Public Speaking"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">Helps match you with relevant opportunities.</span>
          </div>

          {/* Privacy & Consents */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Privacy & Consents</h3>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                required
                checked={formData.consents.DATA_USE}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consents: { ...formData.consents, DATA_USE: e.target.checked },
                  })
                }
                className="mt-0.5 text-blue-600 rounded"
              />
              <span>
                <strong className="text-red-500">* Required:</strong> Maatram may store my details for volunteer management.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={formData.consents.INTERVIEW_CONTACT}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consents: { ...formData.consents, INTERVIEW_CONTACT: e.target.checked },
                  })
                }
                className="mt-0.5 text-blue-600 rounded"
              />
              <span>Maatram may contact me for mock interviews and admission panel interviews.</span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={formData.consents.LINKEDIN_SHARE}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consents: { ...formData.consents, LINKEDIN_SHARE: e.target.checked },
                  })
                }
                className="mt-0.5 text-blue-600 rounded"
              />
              <span>Maatram may offer me a ready-to-share LinkedIn post about my contribution.</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 mt-4"
          >
            {loading ? 'Submitting...' : (
              <>
                <UserPlus size={18} /> Register as Volunteer
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

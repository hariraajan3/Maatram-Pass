import React, { useEffect, useState } from 'react';
import client from '../services/api';
import Navbar from '../components/Navbar';
import OpportunityCard from '../components/OpportunityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Search, Filter, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'ALL',
  'SCHOOL_VISIT',
  'ADMISSIONS_SUPPORT',
  'BGV',
  'MOCK_INTERVIEW',
  'PANEL_INTERVIEW',
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, [selectedCategory, search]);

  const fetchOpportunities = () => {
    setLoading(true);
    const params = {};
    if (selectedCategory !== 'ALL') params.category = selectedCategory;
    if (search) params.search = search;

    client.get('/opportunities', { params })
      .then((res) => setOpportunities(res.data.opportunities || []))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load opportunities.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Volunteering Opportunities</h1>
            <p className="text-sm text-slate-500 mt-1">
              Find causes that match your passion and skills.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by event title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? 'All Opportunities' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Opportunities List */}
        {loading ? (
          <LoadingSpinner />
        ) : opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No opportunities found"
            message="Check back soon for new school visits, mock interviews, or panel sessions!"
          />
        )}
      </div>
    </div>
  );
}

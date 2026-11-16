import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Wifi, Users } from 'lucide-react';

const CATEGORY_COLORS = {
  SCHOOL_VISIT:       'bg-green-100 text-green-700',
  ADMISSIONS_SUPPORT: 'bg-blue-100 text-blue-700',
  BGV:                'bg-purple-100 text-purple-700',
  MOCK_INTERVIEW:     'bg-orange-100 text-orange-700',
  PANEL_INTERVIEW:    'bg-red-100 text-red-700',
};

const CATEGORY_LABELS = {
  SCHOOL_VISIT:       'School Visit',
  ADMISSIONS_SUPPORT: 'Admissions Support',
  BGV:                'BGV',
  MOCK_INTERVIEW:     'Mock Interview',
  PANEL_INTERVIEW:    'Panel Interview',
};

export default function OpportunityCard({ opportunity }) {
  const { id, title, category, startAt, isOnline, location, capacity, applications } = opportunity;
  const spotsLeft = capacity - (applications?.filter(a => ['SELECTED','CONFIRMED','ATTENDED'].includes(a.status))?.length || 0);
  const dateStr = startAt ? new Date(startAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <Link to={`/opportunities/${id}`} className="block group">
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200 h-full flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'}`}>
            {CATEGORY_LABELS[category] || category}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${spotsLeft > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {spotsLeft > 0 ? `${spotsLeft} spots` : 'Full'}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-2 line-clamp-2 flex-1">
          {title}
        </h3>

        <div className="space-y-1.5 mt-auto">
          {dateStr && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar size={12} />
              {dateStr}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            {isOnline ? <Wifi size={12} /> : <MapPin size={12} />}
            {isOnline ? 'Online' : (location || 'TBD')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users size={12} />
            Capacity: {capacity}
          </div>
        </div>
      </div>
    </Link>
  );
}

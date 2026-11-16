import React, { useState, useEffect, useRef } from 'react';
import { listEmployers, suggestEmployer } from '../api/employers';
import { Building2 } from 'lucide-react';

export default function EmployerAutocomplete({ value, onChange, placeholder = 'Search employer...' }) {
  const [query, setQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      listEmployers()
        .then((data) => {
          const employers = Array.isArray(data) ? data : data.employers || [];
          setSuggestions(
            employers.filter((e) =>
              e.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 8)
          );
          setOpen(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const select = (employer) => {
    setQuery(employer.name);
    onChange(employer);
    setOpen(false);
  };

  const handleSuggest = async () => {
    if (!query.trim()) return;
    try {
      const data = await suggestEmployer(query.trim());
      onChange(data.employer || { name: query.trim() });
      setOpen(false);
    } catch {
      onChange({ name: query.trim() });
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {open && (query.length >= 2) && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
          {loading && (
            <p className="px-3 py-2 text-sm text-gray-500">Searching...</p>
          )}
          {!loading && suggestions.length === 0 && (
            <div className="px-3 py-2">
              <p className="text-sm text-gray-500 mb-2">No employer found</p>
              <button
                type="button"
                onClick={handleSuggest}
                className="text-sm text-blue-600 hover:underline"
              >
                + Suggest "{query}" as new employer
              </button>
            </div>
          )}
          {suggestions.map((emp) => (
            <button
              key={emp.id}
              type="button"
              onClick={() => select(emp)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors"
            >
              {emp.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useMemo } from 'react';
import * as adminService from '../services/adminService';
import { 
  HeartIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  InboxIcon
} from '@heroicons/react/24/outline';

const AdminFavoritesManager: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getFavorites();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Filter logic for the search bar
  const filteredFavorites = useMemo(() => {
    return favorites.filter(fav => 
      (fav.title || fav.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fav.userEmail || fav.userId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [favorites, searchTerm]);

  if (loading && favorites.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500">
        <ArrowPathIcon className="h-8 w-8 animate-spin mb-2 text-blue-500" />
        <p className="font-medium">Analyzing user interests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Favorites & Interest</h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitoring which events users are saving to their wishlists.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <span className="text-xs text-blue-600 font-semibold uppercase">Total Saves</span>
            <p className="text-xl font-bold text-blue-900">{favorites.length}</p>
          </div>
          <button 
            onClick={fetchFavorites}
            className="p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text"
          placeholder="Search by event title or user email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4">Event Details</th>
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Date Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFavorites.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <InboxIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No matching favorites found.</p>
                  </td>
                </tr>
              ) : (
                filteredFavorites.map((fav, idx) => (
                  <tr key={fav.id || idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HeartIcon className="h-5 w-5 text-pink-500 fill-pink-50" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {fav.title || fav.eventName || 'Unnamed Event'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <CalendarDaysIcon className="h-3 w-3" />
                            ID: {fav.eventId?.substring(0, 8) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <UserGroupIcon className="h-4 w-4 text-gray-400" />
                        {fav.userEmail || fav.userId || 'Anonymous User'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {fav.createdAt || fav.date 
                        ? new Date(fav.createdAt || fav.date).toLocaleDateString('en-KE', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Unknown Date'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFavoritesManager;

import React, { useEffect, useState, useMemo } from 'react';
import * as adminService from '../services/adminService';
import { 
  EnvelopeIcon, 
  UserPlusIcon, 
  ArrowDownTrayIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const AdminNewsletterManager: React.FC = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getNewsletterSubscribers();
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to sync subscriber list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filteredList = useMemo(() => {
    return subscribers.filter(s => s.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [subscribers, searchTerm]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + subscribers.map(s => s.email).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers_list.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading && subscribers.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-semibold">Loading mailing list...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
            <EnvelopeIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Newsletter Hub</h2>
            <p className="text-orange-100 text-sm">Grow your reach. Currently managing {subscribers.length} active leads.</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-orange-50 transition-all active:scale-95 shadow-md"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Export CSV
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search subscriber emails..."
            className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-gray-500 hover:text-orange-600 transition-colors">
          <FunnelIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Subscriber List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">
            <UserPlusIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No subscribers found in this view.</p>
          </div>
        ) : (
          filteredList.map((entry, idx) => (
            <div key={entry.id || idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 hover:border-orange-200 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CheckBadgeIcon className="h-6 w-6 text-orange-600" />
                </div>
                <button className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              <h3 className="font-bold text-gray-800 truncate" title={entry.email}>
                {entry.email}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Joined:</span>
                <span>
                  {entry.signedUpAt ? new Date(entry.signedUpAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNewsletterManager;

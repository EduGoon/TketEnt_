import React, { useEffect, useState, useMemo } from 'react';
import * as adminService from '../services/adminService';
import { 
  StarIcon, 
  TrashIcon, 
  ChatBubbleLeftEllipsisIcon, 
  UserCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const AdminReviewManager: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => 
      (rev.comment || rev.text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rev.userEmail || rev.userName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reviews, searchTerm]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating 
            ? <StarIconSolid key={star} className="h-4 w-4 text-yellow-500" />
            : <StarIcon key={star} className="h-4 w-4 text-gray-300" />
        ))}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500">
        <ArrowPathIcon className="h-8 w-8 animate-spin mb-2 text-green-600" />
        <p className="font-medium">Moderating feedback...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">User Reviews</h2>
          <p className="text-sm text-gray-500 mt-1">
            Moderate community feedback and monitor event ratings.
          </p>
        </div>
        <button 
          onClick={fetchReviews}
          className="inline-flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text"
          placeholder="Search review content, users, or events..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4">Reviewer</th>
                <th className="px-6 py-4">Rating & Comment</th>
                <th className="px-6 py-4">Event Context</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <ArchiveBoxIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No reviews found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev, idx) => (
                  <tr key={rev.id || idx} className="hover:bg-gray-50 transition-colors align-top">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        <div className="max-w-[150px]">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {rev.userName || 'Guest User'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {rev.userEmail || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-1">{renderStars(rev.rating || 0)}</div>
                      <p className="text-sm text-gray-700 leading-relaxed max-w-md italic">
                        "{rev.comment || rev.text || 'No comment provided.'}"
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5" />
                        {rev.eventName || rev.eventId?.substring(0, 8) || 'Unknown Event'}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        title="Delete Review"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        onClick={() => {/* adminService.deleteReview(rev.id) */}}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
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

export default AdminReviewManager;

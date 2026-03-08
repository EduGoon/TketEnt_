import React, { useEffect, useState, useMemo } from 'react';
import * as adminService from '../services/adminService';
import { 
  StarIcon, TrashIcon, UserCircleIcon, CalendarIcon,
  ArrowPathIcon, MagnifyingGlassIcon, HeartIcon,
  ChatBubbleBottomCenterTextIcon, HandThumbUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const AdminReviewManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews');
  const [data, setData] = useState<{ reviews: any[], favorites: any[] }>({ reviews: [], favorites: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revs, favs] = await Promise.all([
        adminService.getReviews(),
        adminService.getFavorites()
      ]);
      setData({ 
        reviews: Array.isArray(revs) ? revs : [], 
        favorites: Array.isArray(favs) ? favs : [] 
      });
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredItems = useMemo(() => {
    const currentList = activeTab === 'reviews' ? data.reviews : data.favorites;
    return currentList.filter(item => 
      (item.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.event?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, activeTab, searchTerm]);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        star <= rating 
          ? <StarIconSolid key={star} className="h-3.5 w-3.5 text-amber-400" />
          : <StarIcon key={star} className="h-3.5 w-3.5 text-gray-200" />
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => { setActiveTab('reviews'); setSearchTerm(''); }}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'reviews' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <ChatBubbleBottomCenterTextIcon className="h-4 w-4" /> Reviews
          </button>
          <button 
            onClick={() => { setActiveTab('favorites'); setSearchTerm(''); }}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'favorites' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <HeartIconSolid className={`h-4 w-4 ${activeTab === 'favorites' ? 'text-pink-500' : ''}`} /> Favorites
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Total {activeTab}</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{filteredItems.length}</p>
          </div>
          <button onClick={fetchData} className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
            <ArrowPathIcon className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text"
          placeholder={`Filter ${activeTab} by user, event or content...`}
          className="w-full pl-14 pr-6 py-5 bg-white border-none rounded-[24px] shadow-sm focus:ring-2 focus:ring-gray-900 outline-none transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">User & Context</th>
              <th className="px-8 py-5">{activeTab === 'reviews' ? 'Rating & Feedback' : 'Wishlist Status'}</th>
              <th className="px-8 py-5 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={3} className="py-20 text-center"><ArrowPathIcon className="h-10 w-10 animate-spin mx-auto text-gray-200" /></td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan={3} className="py-20 text-center text-gray-400 font-bold uppercase text-xs">No {activeTab} found</td></tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group align-top">
                  <td className="px-8 py-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        <UserCircleIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{item.user?.firstName || 'Guest'} {item.user?.lastName || ''}</p>
                        <p className={`text-[10px] font-bold uppercase mt-1 flex items-center gap-1 ${activeTab === 'favorites' ? 'text-pink-500' : 'text-blue-500'}`}>
                          <CalendarIcon className="h-3 w-3" /> {item.event?.title || 'Unknown Event'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {activeTab === 'reviews' ? (
                      <>
                        <div className="mb-2">{renderStars(item.rating)}</div>
                        <p className="text-sm text-gray-600 italic leading-relaxed">
                          {item.comment ? `"${item.comment}"` : "No comment."}
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-pink-600 bg-pink-50 px-3 py-1.5 rounded-xl w-fit">
                        <HeartIconSolid className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Event Wishlisted</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(item.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                    </div>
                    {activeTab === 'reviews' && (
                      <button className="mt-4 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviewManager;

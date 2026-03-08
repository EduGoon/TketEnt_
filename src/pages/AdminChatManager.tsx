import React, { useEffect, useState } from 'react';
import * as adminService from '../services/adminService';
import { 
  ChatBubbleLeftRightIcon, 
  UserCircleIcon, 
  ChatBubbleOvalLeftEllipsisIcon,
  ArrowPathIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const AdminChatManager: React.FC = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getChats();
      // data should be an array of ChatMessage objects
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Chat sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  if (loading && chats.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20">
      <ArrowPathIcon className="h-10 w-10 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-500 font-medium">Syncing conversation logs...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Clean Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Support Logs</h2>
          <p className="text-gray-500 text-sm mt-1">Audit trail of all platform communications.</p>
        </div>
        <button 
          onClick={fetchChats}
          className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-xl transition-all"
        >
          Refresh Feed
        </button>
      </div>

      {chats.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 shadow-sm">
          <ChatBubbleOvalLeftEllipsisIcon className="h-16 w-16 mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold">No active conversations found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map((chat) => (
            <div 
              key={chat.id} 
              className={`flex items-start gap-4 p-5 rounded-3xl border transition-all ${
                chat.sender === 'support' 
                  ? 'bg-blue-50/30 border-blue-100 ml-12' 
                  : 'bg-white border-gray-100 mr-12'
              }`}
            >
              <div className="flex-shrink-0">
                {chat.sender === 'support' ? (
                  <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500">
                    <UserCircleIcon className="h-7 w-7" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black uppercase tracking-widest ${
                    chat.sender === 'support' ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {chat.sender === 'support' ? 'System Support' : (chat.user?.firstName || 'User')}
                  </span>
                 <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
  <ClockIcon className="h-3 w-3" />
  {new Date(chat.createdAt).toLocaleString('en-KE', { 
    hour: '2-digit', 
    minute: '2-digit', 
    day: 'numeric',   // FIXED: Changed from 'short' to 'numeric'
    month: 'short'    // This one is allowed to be 'short'
  })}
</span>
                </div>
                
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {chat.content}
                </p>

                {chat.sender !== 'support' && chat.user?.email && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    Linked to: {chat.user.email}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChatManager;

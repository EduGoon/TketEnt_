import React, { useEffect, useState } from 'react';
import * as adminService from '../services/adminService';
import { 
  ChatBubbleLeftRightIcon, 
  UserCircleIcon, 
  ShieldExclamationIcon,
  PaperAirplaneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminChatManager: React.FC = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getChats();
      setChats(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to sync chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-blue-600">
      <div className="animate-bounce mr-2">●</div>
      <div className="animate-bounce delay-100 mr-2">●</div>
      <div className="animate-bounce delay-200">●</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-7 w-7 text-indigo-600" />
            Communication Logs
          </h2>
          <p className="text-sm text-gray-500">Real-time monitor of user inquiries and support chats.</p>
        </div>
        <button 
          onClick={fetchChats}
          className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Refresh Feed
        </button>
      </div>

      {chats.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
          <PaperAirplaneIcon className="h-12 w-12 mx-auto text-gray-300 -rotate-45" />
          <p className="mt-4 text-gray-500 font-medium">The airwaves are silent. No chats yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {chats.map((chat, idx) => (
            <div 
              key={chat.id || idx} 
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {chat.sender?.charAt(0).toUpperCase() || <UserCircleIcon className="h-6 w-6" />}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900 truncate">
                      {chat.sender || 'Anonymous User'}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {chat.createdAt ? new Date(chat.createdAt).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                      {chat.message || chat.text || "Empty message"}
                    </p>
                  </div>
                  
                  {chat.room && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                        #{chat.room}
                      </span>
                    </div>
                  )}
                </div>

                {/* Secret Admin Actions visible on hover */}
                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button title="Flag Chat" className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                    <ShieldExclamationIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChatManager;

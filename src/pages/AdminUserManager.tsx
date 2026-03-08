import React, { useEffect, useState, useMemo } from 'react';
import * as adminService from '../services/adminService';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const AdminUserManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to sync users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (loading && users.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20">
      <ArrowPathIcon className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
      <p className="text-gray-500 font-medium">Loading User Records...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">User Directory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage accounts, roles, and platform access.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <UserGroupIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-gray-400 leading-none mb-1">Active Accounts</p>
            <p className="text-xl font-black text-gray-900 leading-none">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text"
          placeholder="Search by name or email..."
          className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Modern Table List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Identity</th>
              <th className="px-8 py-5">Contact</th>
              <th className="px-8 py-5">Privileges</th>
              <th className="px-8 py-5 text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-gray-400">
                  No user records found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-black text-lg">
                        {user.firstName ? user.firstName[0].toUpperCase() : <UserIcon className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">
                          {user.firstName || 'Unnamed'} {user.lastName || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">UID: {user.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <EnvelopeIcon className="h-3.5 w-3.5" /> {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-[11px] text-gray-400 flex items-center gap-2 font-medium">
                          <PhoneIcon className="h-3 w-3" /> {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      <ShieldCheckIcon className="h-3.5 w-3.5" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-sm text-gray-400 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
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

export default AdminUserManager;

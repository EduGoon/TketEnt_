import React, { useEffect, useState, useMemo } from 'react';
import * as adminService from '../services/adminService';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  ShieldCheckIcon, 
  NoSymbolIcon,
  EnvelopeIcon,
  IdentificationIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

const AdminUserManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Assuming you'll add 'getUsers' to adminService soon
      const data = await (adminService as any).getUsers?.() || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (loading && users.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Syncing user records...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Identity Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage user access levels, roles, and security protocols.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <UserGroupIcon className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Total Users</p>
              <p className="text-lg font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-md transition-all">
            <UserPlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name, email, or UID..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* User Table (Modern List) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Role / Permissions</th>
              <th className="px-6 py-4">Security Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <IdentificationIcon className="h-16 w-16 mb-2" />
                    <p className="font-semibold text-lg">Empty Directory</p>
                    <p className="text-sm">No user records currently available.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, idx) => (
                <tr key={user.id || idx} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                        {user.name?.[0] || <IdentificationIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name || 'New User'}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <EnvelopeIcon className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold uppercase">
                    <span className={`px-2 py-1 rounded-md ${user.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.isAdmin ? 'Admin' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      <ShieldCheckIcon className="h-4 w-4" />
                      Active
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                        <NoSymbolIcon className="h-5 w-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition-colors">
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                      </button>
                    </div>
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

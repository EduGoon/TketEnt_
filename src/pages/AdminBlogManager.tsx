import React, { useEffect, useState } from 'react';
import * as adminService from '../services/adminService';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  DocumentTextIcon, 
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const AdminBlogManager: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getBlogs();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleTogglePublish = async (blogId: string, currentStatus: string) => {
    setActionLoading(blogId);
    try {
      if (currentStatus === 'PUBLISHED') {
        await adminService.unpublishBlog(blogId);
      } else {
        await adminService.publishBlog(blogId);
      }
      await fetchBlogs(); // Refresh list
    } catch (err) {
      alert("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500">
        <ArrowPathIcon className="h-8 w-8 animate-spin mb-2" />
        <p>Loading blog repository...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Blog Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create, moderate, and publish articles for your audience.
          </p>
        </div>
        <button 
          onClick={fetchBlogs}
          className="inline-flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Article Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Author / Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No blog posts found in the system.</p>
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {blog.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {blog.excerpt || 'No description provided...'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        blog.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${blog.status === 'PUBLISHED' ? 'bg-green-600' : 'bg-yellow-600'}`} />
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{blog.author?.name || 'Admin'}</div>
                      <div className="text-xs text-gray-500">
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleTogglePublish(blog.id, blog.status)}
                          disabled={actionLoading === blog.id}
                          className={`p-2 rounded-md transition-colors ${
                            blog.status === 'PUBLISHED'
                              ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={blog.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        >
                          {blog.status === 'PUBLISHED' ? (
                            <XCircleIcon className="h-5 w-5" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Showing {blogs.length} articles. Only published articles are visible to the public.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogManager;


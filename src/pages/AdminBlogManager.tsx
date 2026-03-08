import React, { useEffect, useState } from 'react';
import * as adminService from '../services/adminService';
import { 
  PlusIcon, PencilIcon, TrashIcon, 
  EyeIcon, EyeSlashIcon, XMarkIcon, ArrowPathIcon 
} from '@heroicons/react/24/outline';

const AdminBlogManager: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);

  // Removed category and summary to match Prisma Schema
  const initialForm = { title: '', content: '', imageUrl: '', author: '' };
  const [formData, setFormData] = useState(initialForm);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getBlogs();
      setBlogs(Array.isArray(data) ? data : data?.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleOpenPanel = (blog: any = null) => {
    setEditingBlog(blog);
    setFormData({
      title: blog?.title || '',
      content: blog?.content || '',
      imageUrl: blog?.imageUrl || '',
      author: blog?.author || ''
    });
    setIsPanelOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlog) await adminService.updateBlog(editingBlog.id, formData);
      else await adminService.createBlog(formData);
      setIsPanelOpen(false);
      fetchBlogs();
    } catch (err) { alert("Save failed"); }
  };

  const handleTogglePublish = async (blog: any) => {
    try {
      if (blog.published) await adminService.unpublishBlog(blog.id);
      else await adminService.publishBlog(blog.id);
      fetchBlogs();
    } catch (err) { alert("Toggle failed"); }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-gray-900">Articles</h2>
        <button onClick={() => handleOpenPanel()} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
          <PlusIcon className="h-5 w-5" /> New Post
        </button>
      </div>

      <div className="space-y-4">
        {blogs.map(blog => (
          <div key={blog.id} className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center justify-between group shadow-sm">
            <div className="flex items-center gap-5">
              <img src={blog.imageUrl || 'https://via.placeholder.com'} className="h-16 w-16 rounded-2xl object-cover bg-gray-50" alt="" />
              <div>
                <h3 className="font-bold text-gray-900 text-lg leading-none mb-2">{blog.title}</h3>
                <div className="flex items-center gap-3">
                  {/* Only showing Status and Date now */}
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${blog.published ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    {blog.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleTogglePublish(blog)} className={`p-3 rounded-xl ${blog.published ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}>
                {blog.published ? <EyeIcon className="h-6 w-6" /> : <EyeSlashIcon className="h-6 w-6" />}
              </button>
              <button onClick={() => handleOpenPanel(blog)} className="p-3 text-gray-400 hover:text-gray-900"><PencilIcon className="h-5 w-5" /></button>
              <button onClick={() => adminService.deleteBlog(blog.id).then(fetchBlogs)} className="p-3 text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Drawer Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full p-10 overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">{editingBlog ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setIsPanelOpen(false)}><XMarkIcon className="h-8 w-8 text-gray-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input required placeholder="Post Title" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" 
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Author Name" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" 
                  value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                <input placeholder="Image URL" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" 
                  value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>

              <textarea required placeholder="Write your content here..." rows={15} className="w-full p-4 bg-gray-50 rounded-2xl outline-none resize-none" 
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />

              <button type="submit" className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl hover:bg-black transition-all">
                {editingBlog ? 'Update Post' : 'Create Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogManager;

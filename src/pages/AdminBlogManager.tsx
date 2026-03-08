import React, { useEffect, useState } from 'react';

const AdminBlogManager: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', category: '', summary: '', imageUrl: '', content: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    setLoading(true);
    fetch('http://localhost:4000/api/v1/blog/')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleEdit = (post: any) => {
    setEditing(post);
    setForm({ ...post });
  };

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:4000/api/v1/blog/${id}`, { method: 'DELETE' });
    fetchPosts();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch(`http://localhost:4000/api/v1/blog/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('http://localhost:4000/api/v1/blog/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setEditing(null);
    setForm({ title: '', category: '', summary: '', imageUrl: '', content: '' });
    fetchPosts();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display', serif", marginBottom: 24 }}>Admin Blog Manager</h1>
        <form onSubmit={handleSubmit} style={{ background: '#222', borderRadius: 14, padding: 24, marginBottom: 32 }}>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" style={{ width: '100%', marginBottom: 12, borderRadius: 8, border: '1px solid #444', padding: 10, fontSize: 15 }} required />
          <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" style={{ width: '100%', marginBottom: 12, borderRadius: 8, border: '1px solid #444', padding: 10, fontSize: 15 }} required />
          <input type="text" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} placeholder="Summary" style={{ width: '100%', marginBottom: 12, borderRadius: 8, border: '1px solid #444', padding: 10, fontSize: 15 }} required />
          <input type="text" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="Image URL" style={{ width: '100%', marginBottom: 12, borderRadius: 8, border: '1px solid #444', padding: 10, fontSize: 15 }} required />
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Content" style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid #444', padding: 10, fontSize: 15, marginBottom: 12 }} required />
          <button type="submit" style={{ background:'#f0c040', color:'#0a0d14', border:'none', borderRadius:8, padding:'10px 22px', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>{editing ? 'Update' : 'Create'} Post</button>
        </form>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: '#fff', fontSize: 16 }}>Loading blog posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: '#fff', fontSize: 16 }}>No blog posts found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {posts.map(post => (
              <div key={post.id} style={{ background: '#111827', borderRadius: 14, boxShadow: '0 6px 24px rgba(0,0,0,0.45)', overflow: 'hidden', position: 'relative' }}>
                <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderBottom: '1px solid #222' }} />
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: 20, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#f0c040', marginBottom: 6 }}>{post.title}</h3>
                  <p style={{ fontSize: 15, color: '#22c55e', marginBottom: 2 }}>{post.category}</p>
                  <p style={{ fontSize: 14, color: '#fff', marginBottom: 8 }}>{post.summary}</p>
                  <button onClick={() => handleEdit(post)} style={{ background:'#22c55e', color:'#0a0d14', border:'none', borderRadius:8, padding:'8px 18px', fontSize:14, fontWeight:600, cursor:'pointer', marginRight: 8 }}>Edit</button>
                  <button onClick={() => handleDelete(post.id)} style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:14, fontWeight:600, cursor:'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogManager;

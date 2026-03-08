import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:4000/api/v1/blog/')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#22c55e', fontFamily: "'Playfair Display', serif", marginBottom: 24 }}>Blog & News</h1>
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
              <div key={post.id} style={{ background: '#111827', borderRadius: 14, boxShadow: '0 6px 24px rgba(0,0,0,0.45)', overflow: 'hidden' }}>
                <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderBottom: '1px solid #222' }} />
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: 20, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#f0c040', marginBottom: 6 }}>{post.title}</h3>
                  <p style={{ fontSize: 15, color: '#22c55e', marginBottom: 2 }}>{post.category}</p>
                  <p style={{ fontSize: 14, color: '#fff', marginBottom: 8 }}>{post.summary}</p>
                  <Link to={`/blog/${post.id}`} style={{ background:'#22c55e', color:'#0a0d14', border:'none', borderRadius:8, padding:'8px 18px', fontSize:14, fontWeight:600, cursor:'pointer', transition:'opacity 0.2s,transform 0.15s', fontFamily:'DM Sans,sans-serif', marginLeft: 8 }}>Read More</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;

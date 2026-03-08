import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as eventService from '../services/historyService';

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const data = await eventService.getBlogs();
        // Adjust based on if your backend returns { data: [] } or just []
        setPosts(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        console.error("Blog fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
        
        <div style={{ marginBottom: 48, borderLeft: '4px solid #22c55e', paddingLeft: 20 }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#fff', fontFamily: "'Playfair Display', serif", margin: 0 }}>
            The Hub <span style={{ color: '#22c55e' }}>.</span>
          </h1>
          <p style={{ color: '#888', fontSize: 16, marginTop: 8 }}>Curated stories, event guides, and local highlights.</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 350, background: '#111827', borderRadius: 20 }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#111827', borderRadius: 20 }}>
            <p style={{ color: '#666', fontSize: 18 }}>Our writers are busy creating magic. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {posts.map(post => (
              <div 
                key={post.id} 
                style={{ 
                  background: '#111827', 
                  borderRadius: 20, 
                  overflow: 'hidden', 
                  border: '1px solid #1f2937'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img 
                    src={post.imageUrl || 'https://via.placeholder.com'} 
                    alt={post.title} 
                    style={{ width: '100%', height: 220, objectFit: 'cover' }} 
                  />
                  <div style={{ 
                    position: 'absolute', 
                    top: 15, 
                    left: 15, 
                    background: '#22c55e', 
                    color: '#0a0d14', 
                    padding: '4px 12px', 
                    borderRadius: 6, 
                    fontSize: 12, 
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {post.category || 'News'}
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  <h3 style={{ 
                    fontSize: 22, 
                    fontFamily: 'Playfair Display, serif', 
                    fontWeight: 700, 
                    color: '#f0c040', 
                    lineHeight: 1.3,
                    marginBottom: 12 
                  }}>
                    {post.title}
                  </h3>
                  
                  <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24, lineHeight: 1.6 }}>
                    {post.summary || post.content?.substring(0, 100) + '...'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#4b5563' }}>
                      {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <Link 
                      to={`/blog/${post.id}`} 
                      style={{ 
                        color: '#22c55e', 
                        textDecoration: 'none', 
                        fontSize: 14, 
                        fontWeight: 700
                      }}
                    >
                      Read Article →
                    </Link>
                  </div>
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

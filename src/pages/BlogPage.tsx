import React, { useEffect, useState } from 'react';
import * as eventService from '../services/historyService';
import { useSeo } from '../utilities/seo';

/* ── Article Reader Modal ───────────────────────────────────────────────── */
const ArticleModal: React.FC<{ post: any; onClose: () => void }> = ({ post, onClose }) => {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(5,7,12,0.92)',
        backdropFilter: 'blur(18px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 24px',
        overflowY: 'auto',
        animation: 'backdropIn 0.3s ease forwards',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 740,
          background: 'linear-gradient(160deg, #141927 0%, #0e1320 100%)',
          border: '1px solid rgba(240,192,64,0.15)',
          borderRadius: 20,
          overflow: 'hidden',
          animation: 'modalUp 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 18, right: 18, zIndex: 10,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            fontFamily: 'monospace',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(240,192,64,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
        >
          ✕
        </button>

        {/* Hero image */}
        {post.imageUrl && (
          <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 40%, #141927 100%)',
            }} />
            {post.category && (
              <div style={{
                position: 'absolute', top: 20, left: 24,
                background: '#f0c040', color: '#0a0d14',
                padding: '4px 12px', borderRadius: 6,
                fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
                fontFamily: "'DM Mono', monospace",
              }}>
                {post.category}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '32px 40px 48px' }}>
          {!post.imageUrl && post.category && (
            <div style={{
              display: 'inline-block',
              background: '#f0c040', color: '#0a0d14',
              padding: '4px 12px', borderRadius: 6, marginBottom: 16,
              fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
              fontFamily: "'DM Mono', monospace",
            }}>
              {post.category}
            </div>
          )}

          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 32, fontWeight: 700, lineHeight: 1.25,
            color: '#fff', marginBottom: 12,
          }}>
            {post.title}
          </h2>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            marginBottom: 28, paddingBottom: 28,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
              {new Date(post.createdAt || Date.now()).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {post.author && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono', monospace" }}>
                  {post.author}
                </span>
              </>
            )}
          </div>

          <div style={{
            fontSize: 15, color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.85, letterSpacing: 0.2,
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: 'pre-wrap',
          }}>
            {post.content || post.summary || 'No content available.'}
          </div>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '8px 18px',
                fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Blog Card ──────────────────────────────────────────────────────────── */
const BlogCard: React.FC<{ post: any; index: number; onRead: () => void }> = ({ post, index, onRead }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(160deg, #141927 0%, #0f1521 100%)',
        borderRadius: 16,
        overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(240,192,64,0.25)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column',
        animation: `fadeUp 0.5s ease ${index * 0.08}s both`,
        cursor: 'pointer',
      }}
      onClick={onRead}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={post.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'}
          alt={post.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.5s ease',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            filter: 'brightness(0.75)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 50%, #141927 100%)',
        }} />
        {/* Category badge */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: '#f0c040', color: '#0a0d14',
          padding: '3px 10px', borderRadius: 5,
          fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
          fontFamily: "'DM Mono', monospace",
        }}>
          {post.category || 'News'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 19, fontWeight: 700, lineHeight: 1.3,
          color: '#fff', marginBottom: 10,
          transition: 'color 0.2s',
          ...(hovered ? { color: '#f0c040' } : {}),
        }}>
          {post.title}
        </h3>

        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.65, marginBottom: 'auto', paddingBottom: 18,
        }}>
          {post.summary || post.content?.substring(0, 100) + '...'}
        </p>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          <span style={{
            fontSize: 10, color: 'rgba(255,255,255,0.28)',
            fontFamily: "'DM Mono', monospace", letterSpacing: 1,
          }}>
            {new Date(post.createdAt || Date.now()).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: hovered ? '#f0c040' : 'rgba(255,255,255,0.4)',
            letterSpacing: 1.5, textTransform: 'uppercase',
            fontFamily: "'DM Mono', monospace",
            transition: 'color 0.2s',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            Read
            <span style={{
              display: 'inline-block',
              transition: 'transform 0.2s',
              transform: hovered ? 'translateX(4px)' : 'translateX(0)',
            }}>→</span>
          </span>
        </div>
      </div>
    </div>
  );
};

/* ── Skeleton ───────────────────────────────────────────────────────────── */
const Skeleton: React.FC = () => (
  <div style={{
    height: 380, background: 'linear-gradient(160deg, #141927, #0f1521)',
    borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)',
    overflow: 'hidden', position: 'relative',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
      animation: 'shimmer 1.8s infinite',
    }} />
  </div>
);

/* ── Page ───────────────────────────────────────────────────────────────── */
const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePost, setActivePost] = useState<any | null>(null);

  useSeo({
    title: 'Eventify Blog - Events, Ticketing Tips & Organizer Guides',
    description: 'Read the latest event planning tips, ticketing guides, and ideas for organizers and attendees on Eventify.',
    keywords: 'event blog,event tips,ticketing guide,organizer guides,event planning,live events',
    url: typeof window !== 'undefined' ? window.location.href : 'https://eventify.space/the-hub',
    type: 'website',
  });

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const data = await eventService.getBlogs();
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
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalUp {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes headerIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: 60, animation: 'headerIn 0.5s ease forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 3, height: 44, background: '#f0c040', borderRadius: 2, flexShrink: 0 }} />
            <div>
              <p style={{
                fontSize: 9, letterSpacing: 4, color: 'rgba(240,192,64,0.7)',
                textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 5,
              }}>
                Editorial
              </p>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 46, fontWeight: 700, color: '#fff', lineHeight: 1,
                letterSpacing: -1,
              }}>
                The Hub<span style={{ color: '#f0c040' }}>.</span>
              </h1>
            </div>
          </div>
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.35)',
            maxWidth: 420, lineHeight: 1.6, marginLeft: 17,
            paddingLeft: 14, borderLeft: '1px solid rgba(255,255,255,0.08)',
          }}>
            Curated stories, event guides, and local highlights.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 32px',
            background: 'linear-gradient(160deg,#141927,#0f1521)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20,
            animation: 'fadeUp 0.5s ease forwards',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
              Our writers are busy creating magic.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 8, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
              CHECK BACK SOON
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
            {posts.map((post, i) => (
              <BlogCard
                key={post.id}
                post={post}
                index={i}
                onRead={() => setActivePost(post)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Article Modal */}
      {activePost && (
        <ArticleModal post={activePost} onClose={() => setActivePost(null)} />
      )}
    </div>
  );
};

export default BlogPage;

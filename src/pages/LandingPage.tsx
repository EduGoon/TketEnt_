// NewsletterSignupForm component
function NewsletterSignupForm() {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await fetch('http://localhost:4000/api/v1/newsletter/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      setSuccess(true);
      setEmail('');
      setName('');
    } catch (err) {
      setError('Failed to subscribe');
    }
    setSubmitting(false);
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your Name"
        style={{ borderRadius: 8, border: '1px solid #444', padding: 10, fontSize: 15 }}
        required
      />
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your Email"
        style={{ borderRadius: 8, border: '1px solid #444', padding: 10, fontSize: 15 }}
        required
      />
      <button type="submit" disabled={submitting} style={{ background:'#22c55e', color:'#0a0d14', border:'none', borderRadius:8, padding:'10px 22px', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Sign Up</button>
      {success && <div style={{ color: '#22c55e', marginTop: 8 }}>Subscribed successfully!</div>}
      {error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
    </form>
  );
}
import React from 'react';
import FeaturedEvents from './FeaturedEvents';
import { Link } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';

const LandingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [loadingTrending, setLoadingTrending] = React.useState(true);
  const [trendingEvents, setTrendingEvents] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function fetchTrending() {
      setLoadingTrending(true);
      try {
        const resp = await fetch('http://localhost:4000/api/v1/events/trending');
        const data = await resp.json();
        setTrendingEvents(Array.isArray(data) ? data : []);
      } catch {
        setTrendingEvents([]);
      }
      setLoadingTrending(false);
    }
    fetchTrending();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; }
        .gold { color: #f0c040; }
        .green { color: #22c55e; }
        .hero-title { font-size: 48px; font-family: 'Playfair Display', serif; font-weight: 700; line-height: 1.1; color: #f0c040; margin-bottom: 18px; }
        .hero-sub { font-size: 20px; color: #fff; font-family: 'DM Sans', sans-serif; margin-bottom: 32px; }
        .action-btn { background:#22c55e; color:#0a0d14; border:none; border-radius:12px; padding:14px 32px; font-size:17px; font-weight:600; cursor:pointer; transition:opacity 0.2s,transform 0.15s; font-family:'DM Sans',sans-serif; margin-right: 18px; }
        .action-btn:hover { opacity:0.85; transform:translateY(-1px); }
        .ghost-btn { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:14px 32px; font-size:17px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .ghost-btn:hover { background:rgba(255,255,255,0.1); color:#fff; }
      `}</style>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,13,20,0.96)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display', serif", letterSpacing: -0.3 }}>✦ SparkVybzEnt</span>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/events" className="ghost-btn" style={{ padding: '6px 16px', fontSize: '14px', borderRadius: '8px' }}>Events</Link>
            {user ? (
              <>
                <Link to="/account" className="ghost-btn" style={{ padding: '6px 16px', fontSize: '14px', borderRadius: '8px' }}>My Account</Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="action-btn" style={{ background: '#22c55e', color: '#0a0d14', padding: '6px 16px', fontSize: '14px', borderRadius: '8px' }}>Admin</Link>
                )}
                <button onClick={logout} className="ghost-btn" style={{ color: '#ef4444', padding: '6px 16px', fontSize: '14px', borderRadius: '8px' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/signin" className="ghost-btn" style={{ padding: '6px 16px', fontSize: '14px', borderRadius: '8px' }}>Sign In</Link>
                <Link to="/signup" className="action-btn" style={{ padding: '6px 16px', fontSize: '14px', borderRadius: '8px' }}>Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {/* Hero Section */}
      <section style={{ padding: '48px 0 32px', textAlign: 'center', background: 'linear-gradient(135deg,#1a1f2e,#111827)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" fillOpacity="0.07" d="M0,160L80,149.3C160,139,320,117,480,128C640,139,800,181,960,197.3C1120,213,1280,203,1360,197.3L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="hero-title">SparkVybzEnt</h1>
          <p className="hero-sub">Kenya's #1 platform for events, tickets, and unforgettable moments.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
            <Link to="/events" className="action-btn">Discover Events</Link>
            {!user && (
              <Link to="/signup" className="ghost-btn">Get Started</Link>
            )}
            {user && (
              <Link to="/account" className="ghost-btn" style={{ background: '#fff', color: '#22c55e' }}>Go to My Account</Link>
            )}
          </div>
        </div>
      </section>
      {/* Trending Events Section */}
      <section style={{ padding: '32px 0', background: '#0a0d14' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e', textAlign: 'center', marginBottom: 18, fontFamily: "'Playfair Display', serif" }}>Trending Events</div>
          {loadingTrending ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#fff', fontSize: 16 }}>Loading trending events...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              {trendingEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <p style={{ color: '#fff', fontSize: 16 }}>No trending events found.</p>
                </div>
              ) : (
                trendingEvents.map((event: any) => {
                  const eventStart = event.startTime ?? event.date;
                  const venue = event.venue ?? event.location;
                  return (
                    <div key={event.id} style={{ background: '#111827', borderRadius: 14, boxShadow: '0 6px 24px rgba(0,0,0,0.45)', overflow: 'hidden' }}>
                      <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderBottom: '1px solid #222' }} />
                      <div style={{ padding: '16px' }}>
                        <h3 style={{ fontSize: 20, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#f0c040', marginBottom: 6 }}>{event.title}</h3>
                        <p style={{ fontSize: 15, color: '#22c55e', marginBottom: 2 }}>{venue}</p>
                        <p style={{ fontSize: 14, color: '#fff', marginBottom: 8 }}>
                          {eventStart
                            ? new Date(eventStart).toLocaleString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Date TBD'}
                        </p>
                        <Link
                          to={`/events/${event.id}`}
                          style={{ background:'#22c55e', color:'#0a0d14', border:'none', borderRadius:8, padding:'8px 18px', fontSize:14, fontWeight:600, cursor:'pointer', transition:'opacity 0.2s,transform 0.15s', fontFamily:'DM Sans,sans-serif', marginLeft: 8 }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>
      {/* Featured Events Section */}
      <section style={{ padding: '48px 0', background: '#111827' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#f0c040', textAlign: 'center', marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>Featured Events</h2>
          <FeaturedEvents />
        </div>
      </section>
      {/* Newsletter Signup */}
      <section style={{ padding: '32px 0', background: '#111827' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px', background: '#222', borderRadius: 14, boxShadow: '0 6px 24px rgba(0,0,0,0.45)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#22c55e', textAlign: 'center', marginBottom: 18, fontFamily: "'Playfair Display', serif" }}>Sign Up for Event Updates</h2>
          <NewsletterSignupForm />
        </div>
      </section>
      {/* Footer */}
      <footer style={{ background: '#0a0d14', color: '#fff', padding: '18px 0', marginTop: 'auto', textAlign: 'center' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>
          <p>&copy; {new Date().getFullYear()} SparkVybzEnt. All rights reserved.</p>
        </div>
      </footer>
    // ...existing code...
    </div>
  );
};

export default LandingPage;
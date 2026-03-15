import React from 'react';
import FeaturedEvents from './FeaturedEvents';
import { Link } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';
 
const LandingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [_loadingTrending, setLoadingTrending] = React.useState(true);
  const [trendingEvents, setTrendingEvents] = React.useState<any[]>([]);
  const [blogs, setBlogs] = React.useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
 
  React.useEffect(() => {
    async function fetchTrending() {
      setLoadingTrending(true);
      try {
        const resp = await fetch('https://skyent-backend-403800080245.us-central1.run.app/api/v1/api/events/trending');
        const data = await resp.json();
        setTrendingEvents(Array.isArray(data) ? data : (data?.data ?? []));
      } catch {
        setTrendingEvents([]);
      }
      setLoadingTrending(false);
    }
 
    async function fetchBlogs() {
      setLoadingBlogs(true);
      try {
        const resp = await fetch('https://skyent-backend-403800080245.us-central1.run.app/api/v1/api/blogs/');
        const data = await resp.json();
        setBlogs(Array.isArray(data) ? data.slice(0, 4) : (data?.data ?? []).slice(0, 4));
      } catch {
        setBlogs([]);
      }
      setLoadingBlogs(false);
    }
 
    fetchTrending();
    fetchBlogs();
  }, []);
 
  const closeMobileMenu = () => setMobileMenuOpen(false);
 
  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
 
        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeLeft  { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer   { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
 
        .nav-link {
          color: rgba(255,255,255,0.52); font-size: 13px; font-weight: 500;
          text-decoration: none; padding: 6px 14px; border-radius: 8px;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
          background: none; border: none; cursor: pointer;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.07); }
        .nav-cta {
          background: #f0c040; color: #0a0d14; border: none; border-radius: 8px;
          padding: 7px 18px; font-size: 13px; font-weight: 700; cursor: pointer;
          text-decoration: none; font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s, transform 0.15s;
        }
        .nav-cta:hover { opacity: 0.87; transform: translateY(-1px); }
 
        .cta-primary {
          background: #f0c040; color: #0a0d14; border: none; border-radius: 12px;
          padding: 16px 36px; font-size: 15px; font-weight: 700; cursor: pointer;
          text-decoration: none; font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s, transform 0.2s; letter-spacing: 0.3px;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .cta-primary:hover { opacity: 0.88; transform: translateY(-2px); }
 
        .cta-ghost {
          background: transparent; color: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.15); border-radius: 12px;
          padding: 16px 36px; font-size: 15px; font-weight: 500; cursor: pointer;
          text-decoration: none; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .cta-ghost:hover { border-color: rgba(255,255,255,0.35); color: #fff; background: rgba(255,255,255,0.05); }
 
        .blog-featured {
          background: linear-gradient(160deg,#141927,#0f1521);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 20px;
          overflow: hidden; transition: all 0.3s; cursor: pointer; text-decoration: none; display: block;
        }
        .blog-featured:hover { border-color: rgba(240,192,64,0.3); transform: translateY(-4px); box-shadow: 0 28px 60px rgba(0,0,0,0.5); }
        .blog-featured:hover .b-img { transform: scale(1.04); }
        .blog-featured:hover .b-title { color: #f0c040; }
 
        .blog-side {
          background: linear-gradient(160deg,#141927,#0f1521);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 14px;
          overflow: hidden; transition: all 0.3s; cursor: pointer; text-decoration: none;
          display: flex;
        }
        .blog-side:hover { border-color: rgba(240,192,64,0.25); transform: translateX(5px); box-shadow: 0 10px 30px rgba(0,0,0,0.45); }
        .blog-side:hover .b-title { color: #f0c040; }
 
        .b-img { transition: transform 0.5s ease; }
        .b-title { font-family:'Playfair Display',serif; font-weight:700; color:#fff; line-height:1.3; transition:color 0.25s; }
 
        .eyebrow {
          font-size: 9px; letter-spacing: 4px; color: rgba(240,192,64,0.6);
          text-transform: uppercase; font-family: 'DM Mono', monospace; margin-bottom: 14px;
          display: flex; align-items: center; gap: 12px;
        }
        .eyebrow::after { content:''; flex: 0 0 36px; height:1px; background:rgba(240,192,64,0.3); }
 
        .view-all {
          font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.3);
          text-transform: uppercase; font-family: 'DM Mono', monospace;
          text-decoration: none; transition: color 0.2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .view-all:hover { color: #f0c040; }
 
        .skeleton { background: linear-gradient(160deg,#141927,#0f1521); border-radius:14px; border:1px solid rgba(255,255,255,0.05); position:relative; overflow:hidden; }
        .skeleton::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent); animation:shimmer 1.8s infinite; }
 
        .divider { height:1px; background:linear-gradient(to right,transparent,rgba(255,255,255,0.07),transparent); }
 
        .footer-link { color:rgba(255,255,255,0.32); text-decoration:none; font-size:13px; transition:color 0.2s; }
        .footer-link:hover { color:rgba(255,255,255,0.75); }
 
        .hamburger {
          display: none;
          flex-direction: column; justify-content: center; align-items: center;
          width: 38px; height: 38px; gap: 5px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9px; cursor: pointer; transition: background 0.2s;
          flex-shrink: 0;
        }
        .hamburger:hover { background: rgba(255,255,255,0.1); }
        .hamburger span {
          display: block; width: 18px; height: 1.5px;
          background: rgba(255,255,255,0.7); border-radius: 2px;
          transition: all 0.25s;
        }
 
        .mobile-menu {
          position: absolute; top: 64px; left: 0; right: 0;
          background: rgba(10,13,20,0.99);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          padding: 12px 20px 18px;
          display: flex; flex-direction: column; gap: 2px;
          animation: slideDown 0.2s ease forwards;
          z-index: 199;
        }
 
        .mobile-nav-link {
          color: rgba(255,255,255,0.6); font-size: 15px; font-weight: 500;
          text-decoration: none; padding: 12px 14px; border-radius: 9px;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
          background: none; border: none; cursor: pointer; text-align: left; width: 100%;
          display: block;
        }
        .mobile-nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
 
        .mobile-nav-cta {
          background: #f0c040; color: #0a0d14; border: none; border-radius: 9px;
          padding: 12px 14px; font-size: 15px; font-weight: 700; cursor: pointer;
          text-decoration: none; font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s; margin-top: 8px; text-align: center; display: block;
        }
        .mobile-nav-cta:hover { opacity: 0.87; }
 
        .mobile-nav-logout {
          color: rgba(248,113,113,0.75); font-size: 15px; font-weight: 500;
          padding: 12px 14px; border-radius: 9px; border: none;
          background: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
          text-align: left; width: 100%; transition: all 0.2s; display: block;
        }
        .mobile-nav-logout:hover { background: rgba(248,113,113,0.08); color: rgba(248,113,113,0.95); }
 
        .mobile-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 6px 0; }
 
        @media (max-width: 680px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
 
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-cards { display: none !important; }
          .blog-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
 
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(10,13,20,0.97)', backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:200 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
          <span style={{ fontSize:20, fontWeight:700, color:'#f0c040', fontFamily:"'Playfair Display', serif", letterSpacing:-0.5 }}>
            ✦ TketEnt
          </span>
 
          {/* Desktop nav */}
          <nav className="desktop-nav" style={{ display:'flex', alignItems:'center', gap:4 }}>
            <Link to="/events" className="nav-link">Events</Link>
            <Link to="/the-hub" className="nav-link">The Hub</Link>
            {user ? (
  <>
    <Link to="/account" className="nav-link">My Account</Link>
    {user.role === 'ORGANIZER' && <Link to="/organizer/dashboard" className="nav-link" style={{ color:'#f0c040' }}>My Events</Link>}
    {user.role === 'ADMIN' && <Link to="/admin" className="nav-cta" style={{ marginLeft:6 }}>Admin</Link>}
    <button onClick={logout} className="nav-link" style={{ color:'rgba(248,113,113,0.65)' }}>Logout</button>
  </>
            ) : (
              <>
                <Link to="/signin" className="nav-link">Sign In</Link>
                <Link to="/signup" className="nav-cta" style={{ marginLeft:6 }}>Sign Up</Link>
              </>
            )}
          </nav>
 
          {/* Hamburger — mobile only */}
          <button className="hamburger" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Toggle menu">
            <span style={mobileMenuOpen ? { transform:'rotate(45deg) translate(3px, 5px)' } : {}} />
            <span style={mobileMenuOpen ? { opacity:0 } : {}} />
            <span style={mobileMenuOpen ? { transform:'rotate(-45deg) translate(3px, -5px)' } : {}} />
          </button>
        </div>
 
        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <nav className="mobile-menu">
            <Link to="/events" className="mobile-nav-link" onClick={closeMobileMenu}>Events</Link>
            <Link to="/the-hub" className="mobile-nav-link" onClick={closeMobileMenu}>The Hub</Link>
            <div className="mobile-divider" />
     {user ? (
  <>
    <Link to="/account" className="mobile-nav-link" onClick={closeMobileMenu}>My Account</Link>
    {user.role === 'ORGANIZER' && (
      <Link to="/organizer/dashboard" className="mobile-nav-link" onClick={closeMobileMenu} style={{ color:'#f0c040' }}>
        🎪 My Events
      </Link>
    )}
    {user.role === 'ADMIN' && (
                  <Link to="/admin" className="mobile-nav-link" onClick={closeMobileMenu} style={{ color:'#f0c040' }}>
                    ✦ Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { logout(); closeMobileMenu(); }} className="mobile-nav-logout">Logout</button>
              </>
            ) : (
              <>
                <Link to="/signin" className="mobile-nav-link" onClick={closeMobileMenu}>Sign In</Link>
<Link to="/signup" className="mobile-nav-cta" onClick={closeMobileMenu}>Sign Up</Link>
              </>
            )}
          </nav>
        )}
      </header>
 
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ position:'relative', overflow:'hidden', minHeight:580 }}>
        <div style={{ position:'absolute', inset:0, zIndex:0, background:'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(240,192,64,0.07) 0%, transparent 55%), radial-gradient(ellipse 50% 70% at 5% 70%, rgba(96,200,240,0.05) 0%, transparent 55%), #0a0d14' }} />
        <div style={{ position:'absolute', right:-140, top:-140, width:540, height:540, borderRadius:'50%', border:'1px solid rgba(240,192,64,0.05)', zIndex:0, pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:-70, top:-70, width:380, height:380, borderRadius:'50%', border:'1px dashed rgba(240,192,64,0.07)', zIndex:0, pointerEvents:'none' }} />
 
        <div className="hero-grid" style={{ maxWidth:1100, margin:'0 auto', padding:'80px 28px 72px', display:'grid', gridTemplateColumns:'1fr 420px', gap:56, alignItems:'center', position:'relative', zIndex:1 }}>
          <div style={{ animation:'fadeUp 0.6s ease forwards' }}>
            <p className="eyebrow">Kenya's #1 Events Platform</p>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(38px,5.5vw,64px)', fontWeight:700, lineHeight:1.08, letterSpacing:-2, marginBottom:22, color:'#fff' }}>
              Every night<br />
              <span style={{ color:'#f0c040' }}>deserves</span> a<br />
              <em style={{ fontStyle:'italic', color:'rgba(255,255,255,0.55)' }}>story.</em>
            </h1>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.48)', lineHeight:1.8, maxWidth:400, marginBottom:36 }}>
              Discover concerts, festivals, experiences across Kenya and creative blogs by kenyan writers. Book your seat, live the moment.
            </p>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              <Link to="/events" className="cta-primary">Explore Events →</Link>
              {!user ? <Link to="/signup" className="cta-ghost">Get Started</Link> : <Link to="/account" className="cta-ghost">My Tickets</Link>}
            </div>
            <div style={{ display:'flex', gap:32, marginTop:44, paddingTop:28, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              {[{ val:'500+', label:'Events' }, { val:'50K+', label:'Tickets Sold' }, { val:'100+', label:'Venues' }].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily:"'DM Mono', monospace", fontSize:20, fontWeight:700, color:'#f0c040', marginBottom:3 }}>{s.val}</p>
                  <p style={{ fontSize:9, color:'rgba(255,255,255,0.28)', letterSpacing:2, textTransform:'uppercase', fontFamily:"'DM Mono', monospace" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
 
          <div className="hero-cards" style={{ position:'relative', height:440, animation:'fadeLeft 0.7s ease 0.15s both' }}>
            {(() => {
              const eventCards = trendingEvents.slice(0,2).map(ev => ({ ...ev, _kind:'event' as const }));
              const blogCards  = blogs.slice(0,2).map(b  => ({ ...b,  _kind:'blog'  as const }));
              const deck: any[] = [];
              let ei = 0, bi = 0;
              while (deck.length < 3) {
                if (deck.length % 2 === 0 && ei < eventCards.length) deck.push(eventCards[ei++]);
                else if (bi < blogCards.length) deck.push(blogCards[bi++]);
                else if (ei < eventCards.length) deck.push(eventCards[ei++]);
                else break;
              }
              if (deck.length < 3) deck.push({ _kind:'info' as const, id:'__info' });
 
              const configs = [
                { top:0,  right:0,  rotate:3,  z:12 },
                { top:36, right:28, rotate:-2, z:11 },
                { top:68, right:52, rotate:4,  z:10 },
              ];
 
              return deck.slice(0,3).map((card, i) => {
                const c = configs[i];
                const baseStyle: React.CSSProperties = {
                  position:'absolute', top:c.top, right:c.right, width:300,
                  transform:`rotate(${c.rotate}deg)`, zIndex:c.z,
                  borderRadius:16, overflow:'hidden',
                  boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
                  background:'linear-gradient(160deg,#181e2e,#111827)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  textDecoration:'none', transition:'transform 0.3s, box-shadow 0.3s',
                  display:'block',
                };
                const handleEnter = (e: React.MouseEvent<HTMLElement>) => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)';
                  e.currentTarget.style.zIndex = '20';
                  e.currentTarget.style.boxShadow = '0 28px 70px rgba(0,0,0,0.7)';
                };
                const handleLeave = (e: React.MouseEvent<HTMLElement>) => {
                  e.currentTarget.style.transform = `rotate(${c.rotate}deg) scale(1)`;
                  e.currentTarget.style.zIndex = String(c.z);
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.6)';
                };
 
                if (card._kind === 'event') {
                  return (
                    <Link key={card.id} to={`/events/${card.id}`} style={baseStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
                      <div style={{ height:160, overflow:'hidden', background:'#1a1f2e' }}>
                        {card.imageUrl
                          ? <img src={card.imageUrl} alt={card.title} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.72)' }} />
                          : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1a2540,#0d1523)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:28, opacity:0.2 }}>✦</span></div>
                        }
                        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(to bottom,transparent,#181e2e)' }} />
                      </div>
                      <div style={{ padding:'14px 16px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                          {card.category && <span style={{ fontSize:8, letterSpacing:2, background:'#f0c040', color:'#0a0d14', padding:'2px 8px', borderRadius:4, fontWeight:800, fontFamily:"'DM Mono', monospace", textTransform:'uppercase' }}>{card.category}</span>}
                          <span style={{ fontSize:8, letterSpacing:1.5, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Mono', monospace", textTransform:'uppercase' }}>Event</span>
                        </div>
                        <p style={{ fontFamily:"'Playfair Display', serif", fontSize:15, fontWeight:700, color:'#fff', marginBottom:5, lineHeight:1.3 }}>{card.title}</p>
                        <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:"'DM Mono', monospace" }}>
                          🗓 {card.startTime ? new Date(card.startTime).toLocaleDateString('default',{day:'numeric',month:'short'}) : 'TBD'}
                          {(card.venue ?? card.location) ? ` · ${card.venue ?? card.location}` : ''}
                        </p>
                      </div>
                    </Link>
                  );
                }
 
                if (card._kind === 'blog') {
                  return (
                    <div key={card.id} style={{ ...baseStyle, border:'1px solid rgba(96,200,240,0.12)', cursor:'default' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
                      <div style={{ height:160, overflow:'hidden', background:'#111d2e' }}>
                        {card.imageUrl
                          ? <img src={card.imageUrl} alt={card.title} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.68)' }} />
                          : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#0d1f35,#0a1220)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:28, opacity:0.2, color:'#60c8f0' }}>✦</span></div>
                        }
                        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(to bottom,transparent,#181e2e)' }} />
                      </div>
                      <div style={{ padding:'14px 16px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                          {card.category && <span style={{ fontSize:8, letterSpacing:2, background:'rgba(96,200,240,0.15)', color:'#60c8f0', border:'1px solid rgba(96,200,240,0.25)', padding:'2px 8px', borderRadius:4, fontWeight:800, fontFamily:"'DM Mono', monospace", textTransform:'uppercase' }}>{card.category}</span>}
                          <span style={{ fontSize:8, letterSpacing:1.5, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Mono', monospace", textTransform:'uppercase' }}>From The Hub</span>
                        </div>
                        <p style={{ fontFamily:"'Playfair Display', serif", fontSize:15, fontWeight:700, color:'#fff', marginBottom:5, lineHeight:1.3 }}>{card.title}</p>
                        <p style={{ fontSize:11, color:'rgba(255,255,255,0.38)', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                          {card.summary || card.content?.substring(0,80) + '…'}
                        </p>
                      </div>
                    </div>
                  );
                }
 
                return (
                  <div key="info" style={{ ...baseStyle, border:'1px solid rgba(240,192,64,0.15)', cursor:'default' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
                    <div style={{ padding:'28px 24px 26px' }}>
                      <p style={{ fontSize:9, letterSpacing:3, color:'rgba(240,192,64,0.55)', textTransform:'uppercase', fontFamily:"'DM Mono', monospace", marginBottom:18 }}>Why TketEnt</p>
                      {[{ icon:'🎟', stat:'500+', label:'Events Listed' }, { icon:'👥', stat:'50K+', label:'Tickets Sold' }, { icon:'📍', stat:'20+', label:'Cities in Kenya' }].map(row => (
                        <div key={row.label} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                          <span style={{ fontSize:18, width:28, textAlign:'center', flexShrink:0 }}>{row.icon}</span>
                          <div>
                            <p style={{ fontFamily:"'DM Mono', monospace", fontSize:18, fontWeight:700, color:'#f0c040', lineHeight:1 }}>{row.stat}</p>
                            <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', letterSpacing:1, textTransform:'uppercase', fontFamily:"'DM Mono', monospace", marginTop:2 }}>{row.label}</p>
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                        <p style={{ fontSize:11, color:'rgba(255,255,255,0.28)', fontStyle:'italic', fontFamily:"'Playfair Display', serif", lineHeight:1.5 }}>"Kenya's most trusted events platform."</p>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </section>
 
      <div className="divider" />
 
      {/* ── FEATURED EVENTS ─────────────────────────────────────────────── */}
      <section style={{ padding:'72px 0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:36, flexWrap:'wrap', gap:16 }}>
            <div>
              <p className="eyebrow">Curated for you</p>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:30, fontWeight:700, letterSpacing:-0.5 }}>
                Featured Events<span style={{ color:'#f0c040' }}>.</span>
              </h2>
            </div>
            <Link to="/events" className="view-all">View all →</Link>
          </div>
          <FeaturedEvents />
        </div>
      </section>
 
      <div className="divider" />
 
      {/* ── BLOG SHOWCASE ───────────────────────────────────────────────── */}
      <section style={{ padding:'72px 0', position:'relative' }}>
        <div style={{ position:'absolute', left:'5%', top:'30%', width:380, height:280, background:'radial-gradient(ellipse,rgba(96,200,240,0.04) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
            <div>
              <p className="eyebrow">Stories & Guides</p>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:30, fontWeight:700, letterSpacing:-0.5 }}>
                From The Hub<span style={{ color:'#f0c040' }}>.</span>
              </h2>
            </div>
            <Link to="/the-hub" className="view-all">All articles →</Link>
          </div>
 
          {loadingBlogs ? (
            <div className="blog-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <div className="skeleton" style={{ height:420 }} />
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:118 }} />)}
              </div>
            </div>
          ) : blogs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 32px', background:'linear-gradient(160deg,#141927,#0f1521)', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:20 }}>
              <p style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', color:'rgba(255,255,255,0.3)', fontSize:16 }}>Our writers are crafting something special.</p>
            </div>
          ) : (
            <div className="blog-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>
              {blogs[0] && (
                <div className="blog-featured">
                  <div style={{ overflow:'hidden', height:260 }}>
                    <img
                      src={blogs[0].imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'}
                      alt={blogs[0].title} className="b-img"
                      style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.72)', display:'block' }}
                    />
                  </div>
                  <div style={{ padding:'24px 26px 28px' }}>
                    {blogs[0].category && <span style={{ fontSize:9, letterSpacing:2, background:'#f0c040', color:'#0a0d14', padding:'3px 10px', borderRadius:4, fontWeight:800, fontFamily:"'DM Mono', monospace", textTransform:'uppercase', marginBottom:14, display:'inline-block' }}>{blogs[0].category}</span>}
                    <p className="b-title" style={{ fontSize:22, marginBottom:10 }}>{blogs[0].title}</p>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.65 }}>
                      {blogs[0].summary || blogs[0].content?.substring(0,110) + '…'}
                    </p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:18 }}>
                      <span style={{ fontSize:10, color:'rgba(255,255,255,0.22)', fontFamily:"'DM Mono', monospace" }}>
                        {new Date(blogs[0].createdAt || Date.now()).toLocaleDateString('default',{day:'numeric',month:'short',year:'numeric'})}
                      </span>
                      {blogs[0].event && (
  <Link to={`/events/${blogs[0].event.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.25)', borderRadius: 8, padding: '8px 14px', textDecoration: 'none' }}>
    <span style={{ fontSize: 11, color: '#f0c040', fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>🎟 Get tickets → {blogs[0].event.title}</span>
  </Link>
)}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {blogs.slice(1,4).map((post, i) => (
                  <div key={post.id} className="blog-side" style={{ animation:`fadeUp 0.45s ease ${i*0.08+0.1}s both` }}>
                    <div style={{ width:108, flexShrink:0, overflow:'hidden', background:'#1a1f2e' }}>
                      <img
                        src={post.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=70'}
                        alt={post.title} className="b-img"
                        style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.7)', display:'block', minHeight:100 }}
                      />
                    </div>
                    <div style={{ padding:'14px 16px', flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:6 }}>
                      {post.category && <span style={{ fontSize:8, letterSpacing:2, color:'#f0c040', textTransform:'uppercase', fontFamily:"'DM Mono', monospace" }}>{post.category}</span>}
                      <p className="b-title" style={{ fontSize:14 }}>{post.title}</p>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,0.22)', fontFamily:"'DM Mono', monospace" }}>
                        {new Date(post.createdAt || Date.now()).toLocaleDateString('default',{day:'numeric',month:'short'})}
                      </p>
                      {post.event && (
  <Link to={`/events/${post.event.id}`} style={{ fontSize: 9, color: '#f0c040', fontFamily: "'DM Mono',monospace", textDecoration: 'none', display: 'block', marginTop: 4 }}>
    🎟 {post.event.title}
  </Link>
)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
 
      <div className="divider" />
 

 {/* ── ORGANIZER CTA ── */}
{!user?.role || user.role === 'USER' ? (
  <section style={{ padding: '72px 28px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(96,200,240,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 48, alignItems: 'center', position: 'relative' }}>
      <div>
        <p style={{ fontSize: 9, letterSpacing: 4, color: 'rgba(96,200,240,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace", marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          For Event Creators
          <span style={{ flex: '0 0 36px', height: 1, background: 'rgba(96,200,240,0.3)', display: 'inline-block' }} />
        </p>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700, lineHeight: 1.18, marginBottom: 18 }}>
          Have an event idea?<br /><span style={{ color: '#60c8f0' }}>Let's make it happen.</span>
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.8, marginBottom: 32, maxWidth: 420 }}>
          TketEnt gives Kenyan event organizers a professional home. Create your event, sell tickets, check in attendees, and receive your payout — all in one place.
        </p>
        <Link to="/apply-organizer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(96,200,240,0.1)', border: '1px solid rgba(96,200,240,0.3)', color: '#60c8f0', borderRadius: 12, padding: '14px 28px', fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(96,200,240,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(96,200,240,0.1)'; }}
        >
          Apply to be an Organizer →
        </Link>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 14, fontFamily: "'DM Mono',monospace" }}>Free to apply · Reviewed within 48 hours</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { icon: '🎟', title: 'Sell Tickets', desc: 'Multiple ticket tiers with real-time availability tracking' },
          { icon: '📊', title: 'Live Analytics', desc: 'Track sales, check-ins, revenue and audience ratings' },
          { icon: '✅', title: 'Easy Check-in', desc: 'QR code scanning at the door, right from your phone' },
          { icon: '💰', title: 'Fast Payouts', desc: 'Request your earnings anytime via M-Pesa' },
        ].map(f => (
          <div key={f.title} style={{ background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px' }}>
            <span style={{ fontSize: 22, display: 'block', marginBottom: 10 }}>{f.icon}</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{f.title}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
) : null}

<div className="divider" />


      {/* ── CTA BAND ────────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 28px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(240,192,64,0.055) 0%, transparent 65%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center', position:'relative' }}>
          <p style={{ fontSize:9, letterSpacing:4, color:'rgba(240,192,64,0.5)', textTransform:'uppercase', fontFamily:"'DM Mono', monospace", marginBottom:16 }}>Ready?</p>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(26px,4.5vw,40px)', fontWeight:700, lineHeight:1.18, marginBottom:18 }}>
            Your next great night<br /><span style={{ color:'#f0c040' }}>starts here.</span>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.38)', lineHeight:1.75, marginBottom:36 }}>
            Join thousands discovering Kenya's best events every week.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/events" className="cta-primary">Browse Events</Link>
            {!user && <Link to="/signup" className="cta-ghost">Create Account</Link>}
          </div>
        </div>
      </section>
 
      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', background:'#07090f', padding:'28px 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:16, color:'#f0c040', fontWeight:700 }}>✦ TketEnt</span>
          <div style={{ display:'flex', gap:22, flexWrap:'wrap' }}>
  <Link to="/events" className="footer-link">Events</Link>
  <Link to="/the-hub" className="footer-link">Blog</Link>
  <Link to="/terms/user" className="footer-link">Terms of Use</Link>
  <Link to="/terms/organizer" className="footer-link">Organizer Terms</Link>
  {!user && <Link to="/signin" className="footer-link">Sign In</Link>}
</div>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.18)', fontFamily:"'DM Mono', monospace" }}>© {new Date().getFullYear()} TketEnt</p>
        </div>
      </footer>
 
    </div>
  );
};
 
export default LandingPage;
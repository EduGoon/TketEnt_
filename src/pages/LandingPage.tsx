import React from 'react';
import FeaturedEvents from './FeaturedEvents';
import { Link } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';
 
const LandingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [trendingEvents, setTrendingEvents] = React.useState<any[]>([]);
  const [blogs, setBlogs] = React.useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = React.useState(true);
  const [loadingEvents, setLoadingEvents] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
 
  React.useEffect(() => {
    fetch('https://skyent-backend-403800080245.us-central1.run.app/api/v1/api/events/trending')
      .then(r => r.json())
      .then(data => setTrendingEvents(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setTrendingEvents([]))
      .finally(() => setLoadingEvents(false));
 
    fetch('https://skyent-backend-403800080245.us-central1.run.app/api/v1/api/blogs/')
      .then(r => r.json())
      .then(data => setBlogs(Array.isArray(data) ? data.slice(0, 4) : (data?.data ?? []).slice(0, 4)))
      .catch(() => setBlogs([]))
      .finally(() => setLoadingBlogs(false));
  }, []);
 
  const closeMobileMenu = () => setMobileMenuOpen(false);
 
  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; corner-shape: round; }
 
        @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeLeft  { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer   { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float     { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-glow{ 0%,100%{box-shadow:0 0 20px rgba(240,192,64,0.2)} 50%{box-shadow:0 0 40px rgba(240,192,64,0.45)} }
        @keyframes ticker    { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
 
        .nav-link { color:rgba(255,255,255,0.52); font-size:13px; font-weight:500; text-decoration:none; padding:6px 14px; border-radius:8px; transition:all 0.2s; font-family:'DM Sans',sans-serif; background:none; border:none; cursor:pointer; }
        .nav-link:hover { color:#fff; background:rgba(255,255,255,0.07); }
        .nav-cta { background:#f0c040; color:#0a0d14; border:none; border-radius:8px; padding:7px 18px; font-size:13px; font-weight:700; cursor:pointer; text-decoration:none; font-family:'DM Sans',sans-serif; transition:opacity 0.2s,transform 0.15s; }
        .nav-cta:hover { opacity:0.87; transform:translateY(-1px); }
 
        .cta-primary { background:#f0c040; color:#0a0d14; border:none; border-radius:12px; padding:16px 36px; font-size:15px; font-weight:700; cursor:pointer; text-decoration:none; font-family:'DM Sans',sans-serif; transition:opacity 0.2s,transform 0.2s; letter-spacing:0.3px; display:inline-flex; align-items:center; gap:8px; }
        .cta-primary:hover { opacity:0.88; transform:translateY(-2px); }
        .cta-ghost { background:transparent; color:rgba(255,255,255,0.65); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:16px 36px; font-size:15px; font-weight:500; cursor:pointer; text-decoration:none; font-family:'DM Sans',sans-serif; transition:all 0.2s; display:inline-flex; align-items:center; gap:8px; }
        .cta-ghost:hover { border-color:rgba(255,255,255,0.35); color:#fff; background:rgba(255,255,255,0.05); }
 
        .step-card { background:linear-gradient(160deg,#141927,#0f1521); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:28px 24px; transition:all 0.35s; position:relative; overflow:hidden; }
        .step-card::before { content:''; position:absolute; inset:0; opacity:0; transition:opacity 0.35s; background:linear-gradient(160deg,rgba(240,192,64,0.04),transparent); }
        .step-card:hover { border-color:rgba(240,192,64,0.25); transform:translateY(-6px); box-shadow:0 24px 60px rgba(0,0,0,0.5); }
        .step-card:hover::before { opacity:1; }
 
        .why-card { background:linear-gradient(160deg,#141927,#0f1521); border:1px solid rgba(255,255,255,0.07); border-radius:18px; padding:24px 22px; transition:all 0.3s; }
        .why-card:hover { border-color:rgba(96,200,240,0.3); transform:translateY(-4px); }
 
        .blog-featured { background:linear-gradient(160deg,#141927,#0f1521); border:1px solid rgba(255,255,255,0.07); border-radius:20px; overflow:hidden; transition:all 0.3s; cursor:pointer; text-decoration:none; display:block; }
        .blog-featured:hover { border-color:rgba(240,192,64,0.3); transform:translateY(-4px); box-shadow:0 28px 60px rgba(0,0,0,0.5); }
        .blog-featured:hover .b-img { transform:scale(1.04); }
        .blog-featured:hover .b-title { color:#f0c040; }
        .blog-side { background:linear-gradient(160deg,#141927,#0f1521); border:1px solid rgba(255,255,255,0.06); border-radius:14px; overflow:hidden; transition:all 0.3s; cursor:pointer; text-decoration:none; display:flex; }
        .blog-side:hover { border-color:rgba(240,192,64,0.25); transform:translateX(5px); }
        .blog-side:hover .b-title { color:#f0c040; }
 
        .b-img { transition:transform 0.5s ease; }
        .b-title { font-family:'Playfair Display',serif; font-weight:700; color:#fff; line-height:1.3; transition:color 0.25s; }
 
        .eyebrow { font-size:9px; letter-spacing:4px; color:rgba(240,192,64,0.6); text-transform:uppercase; font-family:'DM Mono',monospace; margin-bottom:14px; display:flex; align-items:center; gap:12px; }
        .eyebrow::after { content:''; flex:0 0 36px; height:1px; background:rgba(240,192,64,0.3); }
        .view-all { font-size:10px; letter-spacing:2px; color:rgba(255,255,255,0.3); text-transform:uppercase; font-family:'DM Mono',monospace; text-decoration:none; transition:color 0.2s; display:inline-flex; align-items:center; gap:6px; }
        .view-all:hover { color:#f0c040; }
 
        .skeleton { background:linear-gradient(160deg,#141927,#0f1521); border-radius:14px; border:1px solid rgba(255,255,255,0.05); position:relative; overflow:hidden; }
        .skeleton::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent); animation:shimmer 1.8s infinite; }
 
        .divider { height:1px; background:linear-gradient(to right,transparent,rgba(255,255,255,0.07),transparent); }
        .footer-link { color:rgba(255,255,255,0.32); text-decoration:none; font-size:13px; transition:color 0.2s; }
        .footer-link:hover { color:rgba(255,255,255,0.75); }
 
        .mpesa-pill { background:rgba(0,168,56,0.12); border:1px solid rgba(0,168,56,0.3); color:#00a838; border-radius:20px; padding:4px 12px; font-size:10px; font-weight:700; font-family:'DM Mono',monospace; letter-spacing:1px; display:inline-flex; align-items:center; gap:6px; }
        .mpesa-btn { background:linear-gradient(135deg,#00a838,#007a2a); color:#fff; border:none; border-radius:12px; padding:14px 24px; font-size:14px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; display:inline-flex; align-items:center; gap:10px; box-shadow:0 8px 24px rgba(0,168,56,0.3); animation:pulse-glow 3s ease-in-out infinite; }
 
        .social-link { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:10px; padding:10px 16px; text-decoration:none; color:rgba(255,255,255,0.6); font-size:13px; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .social-link:hover { background:rgba(255,255,255,0.08); color:#fff; border-color:rgba(255,255,255,0.18); transform:translateY(-2px); }
 
        .ticker-wrap { overflow:hidden; padding:14px 0; background:rgba(240,192,64,0.04); border-top:1px solid rgba(240,192,64,0.1); border-bottom:1px solid rgba(240,192,64,0.1); }
        .ticker-inner { display:flex; gap:0; white-space:nowrap; animation:ticker 28s linear infinite; }
        .ticker-item { padding:0 40px; font-size:11px; letter-spacing:3px; color:rgba(240,192,64,0.5); text-transform:uppercase; font-family:'DM Mono',monospace; display:inline-flex; align-items:center; gap:16px; }
        .ticker-item::after { content:'✦'; color:rgba(240,192,64,0.3); }
 
        .hamburger { display:none; flex-direction:column; justify-content:center; align-items:center; width:38px; height:38px; gap:5px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:9px; cursor:pointer; transition:background 0.2s; flex-shrink:0; }
        .hamburger:hover { background:rgba(255,255,255,0.1); }
        .hamburger span { display:block; width:18px; height:1.5px; background:rgba(255,255,255,0.7); border-radius:2px; transition:all 0.25s; }
        .mobile-menu { position:absolute; top:64px; left:0; right:0; background:rgba(10,13,20,0.99); border-bottom:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(20px); padding:12px 20px 18px; display:flex; flex-direction:column; gap:2px; animation:slideDown 0.2s ease forwards; z-index:199; }
        .mobile-nav-link { color:rgba(255,255,255,0.6); font-size:15px; font-weight:500; text-decoration:none; padding:12px 14px; border-radius:9px; transition:all 0.2s; font-family:'DM Sans',sans-serif; background:none; border:none; cursor:pointer; text-align:left; width:100%; display:block; }
        .mobile-nav-link:hover { color:#fff; background:rgba(255,255,255,0.06); }
        .mobile-nav-cta { background:#f0c040; color:#0a0d14; border:none; border-radius:9px; padding:12px 14px; font-size:15px; font-weight:700; cursor:pointer; text-decoration:none; font-family:'DM Sans',sans-serif; transition:opacity 0.2s; margin-top:8px; text-align:center; display:block; }
        .mobile-nav-logout { color:rgba(248,113,113,0.75); font-size:15px; font-weight:500; padding:12px 14px; border-radius:9px; border:none; background:none; cursor:pointer; font-family:'DM Sans',sans-serif; text-align:left; width:100%; transition:all 0.2s; display:block; }
        .mobile-divider { height:1px; background:rgba(255,255,255,0.07); margin:6px 0; }
 
        @media (max-width:680px) { .desktop-nav{display:none!important;} .hamburger{display:flex!important;} }
        @media (max-width:860px) { .hero-grid{grid-template-columns:1fr!important;} .hero-cards{display:none!important;} .blog-grid{grid-template-columns:1fr!important;} .steps-grid{grid-template-columns:1fr 1fr!important;} .why-grid{grid-template-columns:1fr 1fr!important;} .mpesa-grid{grid-template-columns:1fr!important;} }
        @media (max-width:520px) { .steps-grid{grid-template-columns:1fr!important;} .why-grid{grid-template-columns:1fr!important;} }
      `}</style>
 
      {/* ── NAV ── */}
      <header style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(10,13,20,0.97)', backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:200 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
          <span style={{ fontSize:20, fontWeight:700, color:'#f0c040', fontFamily:"'Playfair Display',serif", letterSpacing:-0.5 }}>✦ TketEnt</span>
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
          <button className="hamburger" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Toggle menu">
            <span style={mobileMenuOpen ? { transform:'rotate(45deg) translate(3px,5px)' } : {}} />
            <span style={mobileMenuOpen ? { opacity:0 } : {}} />
            <span style={mobileMenuOpen ? { transform:'rotate(-45deg) translate(3px,-5px)' } : {}} />
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="mobile-menu">
            <Link to="/events" className="mobile-nav-link" onClick={closeMobileMenu}>Events</Link>
            <Link to="/the-hub" className="mobile-nav-link" onClick={closeMobileMenu}>The Hub</Link>
            <div className="mobile-divider" />
            {user ? (
              <>
                <Link to="/account" className="mobile-nav-link" onClick={closeMobileMenu}>My Account</Link>
                {user.role === 'ORGANIZER' && <Link to="/organizer/dashboard" className="mobile-nav-link" onClick={closeMobileMenu} style={{ color:'#f0c040' }}>🎪 My Events</Link>}
                {user.role === 'ADMIN' && <Link to="/admin" className="mobile-nav-link" onClick={closeMobileMenu} style={{ color:'#f0c040' }}>✦ Admin Dashboard</Link>}
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
 
      {/* ── HERO ── */}
      <section style={{ position:'relative', overflow:'hidden', minHeight:580 }}>
        <div style={{ position:'absolute', inset:0, zIndex:0, background:'radial-gradient(ellipse 70% 60% at 70% 40%,rgba(240,192,64,0.07) 0%,transparent 55%),radial-gradient(ellipse 50% 70% at 5% 70%,rgba(96,200,240,0.05) 0%,transparent 55%),#0a0d14' }} />
        <div style={{ position:'absolute', right:-140, top:-140, width:540, height:540, borderRadius:'50%', border:'1px solid rgba(240,192,64,0.05)', zIndex:0, pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:-70, top:-70, width:380, height:380, borderRadius:'50%', border:'1px dashed rgba(240,192,64,0.07)', zIndex:0, pointerEvents:'none' }} />
        <div className="hero-grid" style={{ maxWidth:1100, margin:'0 auto', padding:'80px 28px 72px', display:'grid', gridTemplateColumns:'1fr 420px', gap:56, alignItems:'center', position:'relative', zIndex:1 }}>
          <div style={{ animation:'fadeUp 0.6s ease forwards' }}>
            <p className="eyebrow">Kenya's Events Platform</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(38px,5.5vw,64px)', fontWeight:700, lineHeight:1.08, letterSpacing:-2, marginBottom:22, color:'#fff' }}>
              Every night<br />
              <span style={{ color:'#f0c040' }}>deserves</span> a<br />
              <em style={{ fontStyle:'italic', color:'rgba(255,255,255,0.55)' }}>story.</em>
            </h1>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.48)', lineHeight:1.8, maxWidth:400, marginBottom:36 }}>
              Discover concerts, festivals and experiences across Kenya. Book your seat with M-Pesa in seconds. Live the moment.
            </p>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:32 }}>
              <Link to="/events" className="cta-primary">Explore Events →</Link>
              {!user ? <Link to="/signup" className="cta-ghost">Get Started</Link> : <Link to="/account" className="cta-ghost">My Tickets</Link>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <span className="mpesa-pill">
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#00a838', display:'inline-block' }} />
                M-Pesa Payments
              </span>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)', fontFamily:"'DM Mono',monospace" }}>Instant · Secure · No card needed</span>
            </div>
            <div style={{ display:'flex', gap:32, marginTop:44, paddingTop:28, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              {[{ val:'500+', label:'Events' }, { val:'50K+', label:'Tickets Sold' }, { val:'100+', label:'Venues' }].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily:"'DM Mono',monospace", fontSize:20, fontWeight:700, color:'#f0c040', marginBottom:3 }}>{s.val}</p>
                  <p style={{ fontSize:9, color:'rgba(255,255,255,0.28)', letterSpacing:2, textTransform:'uppercase', fontFamily:"'DM Mono',monospace" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
 
          <div className="hero-cards" style={{ position:'relative', height:440, animation:'fadeLeft 0.7s ease 0.15s both' }}>
            {(() => {
              const eventCards = trendingEvents.slice(0,2).map(ev => ({ ...ev, _kind:'event' as const }));
              const blogCards  = blogs.slice(0,2).map(b => ({ ...b, _kind:'blog' as const }));
              const deck: any[] = [];
              let ei = 0, bi = 0;
              while (deck.length < 3) {
                if (deck.length % 2 === 0 && ei < eventCards.length) deck.push(eventCards[ei++]);
                else if (bi < blogCards.length) deck.push(blogCards[bi++]);
                else if (ei < eventCards.length) deck.push(eventCards[ei++]);
                else break;
              }
              if (deck.length < 3) deck.push({ _kind:'info' as const, id:'__info' });
              const configs = [{ top:0, right:0, rotate:3, z:12 }, { top:36, right:28, rotate:-2, z:11 }, { top:68, right:52, rotate:4, z:10 }];
              return deck.slice(0,3).map((card, i) => {
                const c = configs[i];
                const baseStyle: React.CSSProperties = { position:'absolute', top:c.top, right:c.right, width:300, transform:`rotate(${c.rotate}deg)`, zIndex:c.z, borderRadius:16, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.6)', background:'linear-gradient(160deg,#181e2e,#111827)', border:'1px solid rgba(255,255,255,0.08)', textDecoration:'none', transition:'transform 0.3s,box-shadow 0.3s', display:'block' };
                const handleEnter = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.transform='rotate(0deg) scale(1.02)'; e.currentTarget.style.zIndex='20'; e.currentTarget.style.boxShadow='0 28px 70px rgba(0,0,0,0.7)'; };
                const handleLeave = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.transform=`rotate(${c.rotate}deg) scale(1)`; e.currentTarget.style.zIndex=String(c.z); e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,0.6)'; };
                if (card._kind === 'event') return (
                  <Link key={card.id} to={`/events/${card.id}`} style={baseStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
                    <div style={{ height:160, overflow:'hidden', background:'#1a1f2e' }}>
                      {card.imageUrl ? <img src={card.imageUrl} alt={card.title} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.72)' }} /> : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1a2540,#0d1523)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:28, opacity:0.2 }}>✦</span></div>}
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(to bottom,transparent,#181e2e)' }} />
                    </div>
                    <div style={{ padding:'14px 16px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                        {card.category && <span style={{ fontSize:8, letterSpacing:2, background:'#f0c040', color:'#0a0d14', padding:'2px 8px', borderRadius:4, fontWeight:800, fontFamily:"'DM Mono',monospace", textTransform:'uppercase' }}>{card.category}</span>}
                        <span style={{ fontSize:8, letterSpacing:1.5, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Mono',monospace", textTransform:'uppercase' }}>Event</span>
                      </div>
                      <p style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:'#fff', marginBottom:5, lineHeight:1.3 }}>{card.title}</p>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:"'DM Mono',monospace" }}>🗓 {card.startTime ? new Date(card.startTime).toLocaleDateString('default',{day:'numeric',month:'short'}) : 'TBD'}{(card.venue??card.location) ? ` · ${card.venue??card.location}` : ''}</p>
                    </div>
                  </Link>
                );
                if (card._kind === 'blog') return (
                  <div key={card.id} style={{ ...baseStyle, border:'1px solid rgba(96,200,240,0.12)', cursor:'default' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
                    <div style={{ height:160, overflow:'hidden', background:'#111d2e' }}>
                      {card.imageUrl ? <img src={card.imageUrl} alt={card.title} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.68)' }} /> : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#0d1f35,#0a1220)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:28, opacity:0.2, color:'#60c8f0' }}>✦</span></div>}
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(to bottom,transparent,#181e2e)' }} />
                    </div>
                    <div style={{ padding:'14px 16px 16px' }}>
                      <span style={{ fontSize:8, letterSpacing:1.5, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Mono',monospace", textTransform:'uppercase' }}>From The Hub</span>
                      <p style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:'#fff', marginBottom:5, lineHeight:1.3, marginTop:6 }}>{card.title}</p>
                      <p style={{ fontSize:11, color:'rgba(255,255,255,0.38)', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{card.summary || card.content?.substring(0,80) + '…'}</p>
                    </div>
                  </div>
                );
                return (
                  <div key="info" style={{ ...baseStyle, border:'1px solid rgba(240,192,64,0.15)', cursor:'default' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
                    <div style={{ padding:'28px 24px 26px' }}>
                      <p style={{ fontSize:9, letterSpacing:3, color:'rgba(240,192,64,0.55)', textTransform:'uppercase', fontFamily:"'DM Mono',monospace", marginBottom:18 }}>Why TketEnt</p>
                      {[{ icon:'🎟', stat:'500+', label:'Events Listed' }, { icon:'👥', stat:'50K+', label:'Tickets Sold' }, { icon:'📍', stat:'20+', label:'Cities in Kenya' }].map(row => (
                        <div key={row.label} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                          <span style={{ fontSize:18, width:28, textAlign:'center', flexShrink:0 }}>{row.icon}</span>
                          <div>
                            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:'#f0c040', lineHeight:1 }}>{row.stat}</p>
                            <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', letterSpacing:1, textTransform:'uppercase', fontFamily:"'DM Mono',monospace", marginTop:2 }}>{row.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </section>
 
      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...Array(2)].map((_, ri) => (
            ['Concerts', 'Festivals', 'Comedy Nights', 'Tech Talks', 'Food Fests', 'Fashion Shows', 'Networking Events', 'Sports', 'Art Exhibitions', 'Campus Events'].map((t, i) => (
              <span key={`${ri}-${i}`} className="ticker-item">{t}</span>
            ))
          ))}
        </div>
      </div>
 
      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:'88px 0', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-200, top:'20%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(240,192,64,0.04) 0%,transparent 60%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px', position:'relative' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p className="eyebrow" style={{ justifyContent:'center' }}>Simple as it gets</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,40px)', fontWeight:700, letterSpacing:-0.5 }}>How TketEnt Works<span style={{ color:'#f0c040' }}>.</span></h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.38)', marginTop:12, maxWidth:440, margin:'12px auto 0' }}>From discovery to check-in in under 2 minutes.</p>
          </div>
          <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
            {[
              { step:'01', icon:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="17" stroke="rgba(240,192,64,0.3)" strokeWidth="1"/><path d="M11 18l4 4 10-10" stroke="#f0c040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="24" cy="11" r="3" fill="rgba(240,192,64,0.15)" stroke="#f0c040" strokeWidth="1"/></svg>, title:'Discover Events', desc:'Browse concerts, festivals and experiences happening near you across Kenya.', color:'#f0c040' },
              { step:'02', icon:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="17" stroke="rgba(96,200,240,0.3)" strokeWidth="1"/><rect x="10" y="10" width="16" height="16" rx="3" stroke="#60c8f0" strokeWidth="1.5" fill="rgba(96,200,240,0.08)"/><path d="M14 18h8M18 14v8" stroke="#60c8f0" strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Select Your Tickets', desc:'Choose ticket type and quantity. See real-time availability and pricing.', color:'#60c8f0' },
              { step:'03', icon:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="17" stroke="rgba(0,168,56,0.4)" strokeWidth="1"/><rect x="9" y="13" width="18" height="12" rx="2" fill="rgba(0,168,56,0.1)" stroke="#00a838" strokeWidth="1.5"/><path d="M13 18h4M13 21h6" stroke="#00a838" strokeWidth="1.5" strokeLinecap="round"/><circle cx="23" cy="18" r="2.5" fill="#00a838" opacity="0.8"/></svg>, title:'Pay with M-Pesa', desc:'Enter your Safaricom number. Confirm the STK push prompt. Done.', color:'#00a838' },
              { step:'04', icon:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="17" stroke="rgba(167,139,250,0.3)" strokeWidth="1"/><rect x="11" y="8" width="14" height="20" rx="2" fill="rgba(167,139,250,0.08)" stroke="#a78bfa" strokeWidth="1.5"/><rect x="14" y="12" width="8" height="8" rx="1" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1"/><path d="M14 23h8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Get Your QR Ticket', desc:'Your ticket lands in your account instantly. Show the QR at the door.', color:'#a78bfa' },
            ].map((s, i) => (
              <div key={s.step} className="step-card" style={{ animation:`fadeUp 0.5s ease ${i*0.1}s both` }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  {s.icon}
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:28, fontWeight:700, color:`${s.color}1a`, lineHeight:1 }}>{s.step}</span>
                </div>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'#fff', marginBottom:8 }}>{s.title}</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', lineHeight:1.7 }}>{s.desc}</p>
                <div style={{ height:2, background:`linear-gradient(to right,${s.color}44,transparent)`, borderRadius:1, marginTop:20 }} />
              </div>
            ))}
          </div>
        </div>
      </section>
 
      <div className="divider" />
 
      {/* ── M-PESA SECTION ── */}
      <section style={{ padding:'88px 0', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 50% 60% at 50% 50%,rgba(0,168,56,0.05) 0%,transparent 60%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px', position:'relative' }}>
          <div className="mpesa-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
            {/* Phone graphic */}
            <div style={{ display:'flex', justifyContent:'center', animation:'fadeUp 0.6s ease both' }}>
              <div style={{ position:'relative', width:320, height:400 }}>
                <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:220, height:390, background:'linear-gradient(160deg,#141927,#0a0f1a)', border:'2px solid rgba(255,255,255,0.1)', borderRadius:32, boxShadow:'0 40px 80px rgba(0,0,0,0.7)', overflow:'hidden', zIndex:2 }}>
                  <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:80, height:20, background:'#0a0d14', borderRadius:'0 0 14px 14px', zIndex:3 }} />
                  <div style={{ padding:'28px 16px 16px', height:'100%', display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ background:'linear-gradient(135deg,#00a838,#007a2a)', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>📱</div>
                      <div>
                        <p style={{ fontSize:9, color:'rgba(255,255,255,0.7)', fontFamily:"'DM Mono',monospace", letterSpacing:1 }}>M-PESA</p>
                        <p style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Payment Request</p>
                      </div>
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'14px', textAlign:'center' }}>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:"'DM Mono',monospace", letterSpacing:1, marginBottom:4 }}>AMOUNT</p>
                      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:26, fontWeight:700, color:'#f0c040' }}>KSH 500</p>
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                      {[{ label:'To', val:'TketEnt' }, { label:'Event', val:'Nairobi Jazz Night' }, { label:'Ticket', val:'VIP × 1' }].map(r => (
                        <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Mono',monospace" }}>{r.label}</span>
                          <span style={{ fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:'rgba(0,168,56,0.08)', border:'1px solid rgba(0,168,56,0.25)', borderRadius:10, padding:'12px 14px' }}>
                      <p style={{ fontSize:10, color:'rgba(0,168,56,0.8)', fontFamily:"'DM Mono',monospace", letterSpacing:1, marginBottom:8 }}>ENTER M-PESA PIN</p>
                      <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                        {[1,2,3,4].map(d => (
                          <div key={d} style={{ width:28, height:28, borderRadius:6, background:'rgba(0,168,56,0.15)', border:'1px solid rgba(0,168,56,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <div style={{ width:8, height:8, borderRadius:'50%', background:'#00a838', opacity:0.8 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ background:'linear-gradient(135deg,#00a838,#007a2a)', borderRadius:10, padding:'12px', textAlign:'center' }}>
                      <p style={{ fontSize:12, fontWeight:700, color:'#fff' }}>✓ Confirm Payment</p>
                    </div>
                  </div>
                </div>
                <div style={{ position:'absolute', right:-20, top:30, background:'linear-gradient(135deg,#1a2e1e,#0f1f12)', border:'1px solid rgba(0,168,56,0.35)', borderRadius:14, padding:'10px 14px', zIndex:5, animation:'float 4s ease-in-out infinite', boxShadow:'0 12px 32px rgba(0,0,0,0.5)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(0,168,56,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>✓</div>
                    <div>
                      <p style={{ fontSize:10, fontWeight:700, color:'#00a838' }}>Payment Confirmed</p>
                      <p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontFamily:"'DM Mono',monospace" }}>Ticket sent to account</p>
                    </div>
                  </div>
                </div>
                <div style={{ position:'absolute', left:-30, bottom:60, background:'linear-gradient(160deg,#141927,#0f1521)', border:'1px solid rgba(167,139,250,0.3)', borderRadius:14, padding:'10px 14px', zIndex:5, animation:'float 4s ease-in-out 1.5s infinite', boxShadow:'0 12px 32px rgba(0,0,0,0.5)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, background:'rgba(167,139,250,0.1)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🎟</div>
                    <div>
                      <p style={{ fontSize:10, fontWeight:700, color:'#a78bfa' }}>Your Ticket</p>
                      <p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontFamily:"'DM Mono',monospace" }}>QR ready to scan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Copy */}
            <div style={{ animation:'fadeUp 0.6s ease 0.15s both' }}>
              <p className="eyebrow">Payments</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(26px,3.5vw,38px)', fontWeight:700, lineHeight:1.18, marginBottom:20 }}>Pay with M-Pesa.<br /><span style={{ color:'#00a838' }}>The Kenyan way.</span></h2>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.42)', lineHeight:1.8, marginBottom:32, maxWidth:420 }}>No bank cards. No international fees. No complicated checkout. Just enter your Safaricom number, confirm the prompt, and your ticket is secured.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:36 }}>
                {[
                  { icon:'⚡', title:'Instant confirmation', desc:'Your ticket activates the moment payment goes through' },
                  { icon:'🔒', title:'Fully secure', desc:'Payments processed via official Safaricom Daraja API' },
                  { icon:'📲', title:'No app needed', desc:'Works on any Safaricom line — no smartphone required' },
                ].map(f => (
                  <div key={f.title} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'rgba(0,168,56,0.1)', border:'1px solid rgba(0,168,56,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{f.icon}</div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:3 }}>{f.title}</p>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', lineHeight:1.6 }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mpesa-btn" style={{ display:'inline-flex', cursor:'default' }}>
                <span style={{ width:10, height:10, borderRadius:'50%', background:'rgba(255,255,255,0.5)', display:'inline-block' }} />
                M-Pesa Integrated
              </div>
            </div>
          </div>
        </div>
      </section>
 
      <div className="divider" />
 
      {/* ── FEATURED EVENTS — only when content exists ── */}
      {!loadingEvents && trendingEvents.length > 0 && (
        <>
          <section style={{ padding:'72px 0' }}>
            <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px' }}>
              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:36, flexWrap:'wrap', gap:16 }}>
                <div>
                  <p className="eyebrow">Curated for you</p>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, letterSpacing:-0.5 }}>Featured Events<span style={{ color:'#f0c040' }}>.</span></h2>
                </div>
                <Link to="/events" className="view-all">View all →</Link>
              </div>
              <FeaturedEvents />
            </div>
          </section>
          <div className="divider" />
        </>
      )}
 
      {/* ── WHY TKETENT ── */}
      <section style={{ padding:'88px 0', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', left:-200, top:'30%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(96,200,240,0.04) 0%,transparent 60%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px', position:'relative' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p className="eyebrow" style={{ justifyContent:'center' }}>Why choose us</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,40px)', fontWeight:700, letterSpacing:-0.5 }}>Built for Kenya<span style={{ color:'#f0c040' }}>.</span> By Kenyans<span style={{ color:'#60c8f0' }}>.</span></h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.38)', marginTop:12 }}>Everything your typical ticketing platform gets wrong — we got right.</p>
          </div>
          <div className="why-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {[
              { icon:'📱', title:'M-Pesa First', desc:'Every Kenyan has M-Pesa. We built payments around that reality, not around international card processors.', color:'#00a838', tag:'No card needed' },
              { icon:'🎟', title:'QR Check-In', desc:'Organizers scan tickets right from their phone. No printers, no lists, no chaos at the door.', color:'#f0c040', tag:'Instant scanning' },
              { icon:'📊', title:'Real Analytics', desc:'Live sales tracking, check-in counts, revenue dashboards. Know your numbers in real time.', color:'#60c8f0', tag:'For organizers' },
              { icon:'💰', title:'Fast Payouts', desc:'Request your earnings after the event. We release directly to your M-Pesa or bank account.', color:'#a78bfa', tag:'M-Pesa payouts' },
              { icon:'🇰🇪', title:'Kenya-Built', desc:'Designed specifically for Kenyan venues, Kenyan pricing, Kenyan audience behavior. Not a foreign clone.', color:'#f87171', tag:'Local first' },
              { icon:'🔐', title:'Secure & Reliable', desc:"Every transaction is verified through Safaricom's official API. No fake tickets, no fraud.", color:'#34d399', tag:'Official Daraja API' },
            ].map((w, i) => (
              <div key={w.title} className="why-card" style={{ animation:`fadeUp 0.5s ease ${i*0.08}s both` }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${w.color}14`, border:`1px solid ${w.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{w.icon}</div>
                  <span style={{ fontSize:8, letterSpacing:1.5, color:w.color, background:`${w.color}14`, border:`1px solid ${w.color}25`, borderRadius:20, padding:'3px 10px', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', fontWeight:700 }}>{w.tag}</span>
                </div>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'#fff', marginBottom:8 }}>{w.title}</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', lineHeight:1.7 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      <div className="divider" />
 
      {/* ── BLOG — only when content exists ── */}
      {!loadingBlogs && blogs.length > 0 && (
        <>
          <section style={{ padding:'72px 0', position:'relative' }}>
            <div style={{ position:'absolute', left:'5%', top:'30%', width:380, height:280, background:'radial-gradient(ellipse,rgba(96,200,240,0.04) 0%,transparent 70%)', pointerEvents:'none' }} />
            <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px', position:'relative' }}>
              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
                <div>
                  <p className="eyebrow">Stories & Guides</p>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, letterSpacing:-0.5 }}>From The Hub<span style={{ color:'#f0c040' }}>.</span></h2>
                </div>
                <Link to="/the-hub" className="view-all">All articles →</Link>
              </div>
              <div className="blog-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>
                {blogs[0] && (
                  <div className="blog-featured">
                    <div style={{ overflow:'hidden', height:260 }}>
                      <img src={blogs[0].imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'} alt={blogs[0].title} className="b-img" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.72)', display:'block' }} />
                    </div>
                    <div style={{ padding:'24px 26px 28px' }}>
                      {blogs[0].category && <span style={{ fontSize:9, letterSpacing:2, background:'#f0c040', color:'#0a0d14', padding:'3px 10px', borderRadius:4, fontWeight:800, fontFamily:"'DM Mono',monospace", textTransform:'uppercase', marginBottom:14, display:'inline-block' }}>{blogs[0].category}</span>}
                      <p className="b-title" style={{ fontSize:22, marginBottom:10 }}>{blogs[0].title}</p>
                      <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.65 }}>{blogs[0].summary || blogs[0].content?.substring(0,110) + '…'}</p>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:18, flexWrap:'wrap', gap:10 }}>
                        <span style={{ fontSize:10, color:'rgba(255,255,255,0.22)', fontFamily:"'DM Mono',monospace" }}>{new Date(blogs[0].createdAt || Date.now()).toLocaleDateString('default',{day:'numeric',month:'short',year:'numeric'})}</span>
                        {blogs[0].event && <Link to={`/events/${blogs[0].event.id}`} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(240,192,64,0.1)', border:'1px solid rgba(240,192,64,0.25)', borderRadius:8, padding:'8px 14px', textDecoration:'none' }}><span style={{ fontSize:11, color:'#f0c040', fontFamily:"'DM Mono',monospace", fontWeight:600 }}>🎟 Get tickets → {blogs[0].event.title}</span></Link>}
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {blogs.slice(1,4).map((post, i) => (
                    <div key={post.id} className="blog-side" style={{ animation:`fadeUp 0.45s ease ${i*0.08+0.1}s both` }}>
                      <div style={{ width:108, flexShrink:0, overflow:'hidden', background:'#1a1f2e' }}>
                        <img src={post.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=70'} alt={post.title} className="b-img" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.7)', display:'block', minHeight:100 }} />
                      </div>
                      <div style={{ padding:'14px 16px', flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:6 }}>
                        {post.category && <span style={{ fontSize:8, letterSpacing:2, color:'#f0c040', textTransform:'uppercase', fontFamily:"'DM Mono',monospace" }}>{post.category}</span>}
                        <p className="b-title" style={{ fontSize:14 }}>{post.title}</p>
                        <p style={{ fontSize:10, color:'rgba(255,255,255,0.22)', fontFamily:"'DM Mono',monospace" }}>{new Date(post.createdAt || Date.now()).toLocaleDateString('default',{day:'numeric',month:'short'})}</p>
                        {post.event && <Link to={`/events/${post.event.id}`} style={{ fontSize:9, color:'#f0c040', fontFamily:"'DM Mono',monospace", textDecoration:'none', display:'block', marginTop:4 }}>🎟 {post.event.title}</Link>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <div className="divider" />
        </>
      )}
 
      {/* ── ORGANIZER CTA ── */}
      {(!user?.role || user.role === 'USER') && (
        <>
          <section style={{ padding:'72px 28px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 60% at 30% 50%,rgba(96,200,240,0.04) 0%,transparent 60%)', pointerEvents:'none' }} />
            <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:48, alignItems:'center', position:'relative' }}>
              <div>
                <p style={{ fontSize:9, letterSpacing:4, color:'rgba(96,200,240,0.6)', textTransform:'uppercase', fontFamily:"'DM Mono',monospace", marginBottom:14, display:'flex', alignItems:'center', gap:12 }}>For Event Creators<span style={{ flex:'0 0 36px', height:1, background:'rgba(96,200,240,0.3)', display:'inline-block' }} /></p>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(24px,3.5vw,36px)', fontWeight:700, lineHeight:1.18, marginBottom:18 }}>Have an event idea?<br /><span style={{ color:'#60c8f0' }}>Let's make it happen.</span></h2>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.42)', lineHeight:1.8, marginBottom:32, maxWidth:420 }}>TketEnt gives Kenyan event organizers a professional home. Create your event, sell tickets, check in attendees, and receive your payout — all in one place.</p>
                <Link to="/apply-organizer" style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(96,200,240,0.1)', border:'1px solid rgba(96,200,240,0.3)', color:'#60c8f0', borderRadius:12, padding:'14px 28px', fontSize:14, fontWeight:700, textDecoration:'none', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(96,200,240,0.18)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='rgba(96,200,240,0.1)'}>Apply to be an Organizer →</Link>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:14, fontFamily:"'DM Mono',monospace" }}>Free to apply · Reviewed within 48 hours</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[{ icon:'🎟', title:'Sell Tickets', desc:'Multiple ticket tiers with real-time availability tracking' }, { icon:'📊', title:'Live Analytics', desc:'Track sales, check-ins, revenue and audience ratings' }, { icon:'✅', title:'Easy Check-in', desc:'QR code scanning at the door, right from your phone' }, { icon:'💰', title:'Fast Payouts', desc:'Request your earnings anytime via M-Pesa' }].map(f => (
                  <div key={f.title} style={{ background:'linear-gradient(160deg,#141927,#0f1521)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'20px 18px' }}>
                    <span style={{ fontSize:22, display:'block', marginBottom:10 }}>{f.icon}</span>
                    <p style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:6 }}>{f.title}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', lineHeight:1.6 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className="divider" />
        </>
      )}
 
      {/* ── CTA BAND ── */}
      <section style={{ padding:'80px 28px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 80% at 50% 50%,rgba(240,192,64,0.055) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center', position:'relative' }}>
          <p style={{ fontSize:9, letterSpacing:4, color:'rgba(240,192,64,0.5)', textTransform:'uppercase', fontFamily:"'DM Mono',monospace", marginBottom:16 }}>Ready?</p>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(26px,4.5vw,40px)', fontWeight:700, lineHeight:1.18, marginBottom:18 }}>Your next great night<br /><span style={{ color:'#f0c040' }}>starts here.</span></h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.38)', lineHeight:1.75, marginBottom:36 }}>Join thousands discovering Kenya's best events every week.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/events" className="cta-primary">Browse Events</Link>
            {!user && <Link to="/signup" className="cta-ghost">Create Account</Link>}
          </div>
        </div>
      </section>
 
      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', background:'#07090f', padding:'40px 28px 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:32, marginBottom:32, paddingBottom:28, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#f0c040', fontWeight:700, display:'block', marginBottom:8 }}>✦ TketEnt</span>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', lineHeight:1.7, maxWidth:220 }}>Kenya's events ticketing platform. Discover, book, experience.</p>
            </div>
            <div>
              <p style={{ fontSize:9, letterSpacing:3, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', fontFamily:"'DM Mono',monospace", marginBottom:14 }}>Follow Us</p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <a href="https://twitter.com/tketent" target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Twitter / X
                </a>
                <a href="https://instagram.com/tketent" target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                  Instagram
                </a>
                <a href="https://tiktok.com/@tketent" target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z"/></svg>
                  TikTok
                </a>
                <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.787 23.213l4.287-1.373A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.322 0-4.476-.703-6.272-1.904l-.449-.267-3.093.99.897-3.282-.292-.476A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
            <div style={{ display:'flex', gap:22, flexWrap:'wrap' }}>
              <Link to="/events" className="footer-link">Events</Link>
              <Link to="/the-hub" className="footer-link">Blog</Link>
              <Link to="/terms/user" className="footer-link">Terms of Use</Link>
              <Link to="/terms/organizer" className="footer-link">Organizer Terms</Link>
              {!user && <Link to="/signin" className="footer-link">Sign In</Link>}
            </div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.18)', fontFamily:"'DM Mono',monospace" }}>© {new Date().getFullYear()} TketEnt · Made in Kenya 🇰🇪</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
 
export default LandingPage;
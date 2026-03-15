import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as eventService from '../services/historyService';

export default function OrganizerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [organizer, setOrganizer]   = useState<any>(null);
  const [events, setEvents]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const resp = await eventService.getOrganizerPublicProfile(id);
        const data = resp?.data ?? resp;
        setOrganizer(data.organizer ?? data);
        setEvents(data.events ?? []);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const now      = new Date();
  const upcoming = events.filter(e => new Date(e.startTime ?? e.date) >= now && e.status === 'PUBLISHED');
  const past     = events.filter(e => new Date(e.startTime ?? e.date) < now || e.status === 'ENDED');

  const displayed = activeTab === 'upcoming' ? upcoming : past;

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
    .skeleton{background:linear-gradient(160deg,#141927,#0f1521);border-radius:16px;border:1px solid rgba(255,255,255,0.05);position:relative;overflow:hidden;}
    .skeleton::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent);animation:shimmer 1.8s infinite;}
    .ev-card{background:linear-gradient(160deg,#141927,#0f1521);border-radius:14px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;transition:border-color 0.3s,transform 0.3s;text-decoration:none;display:block;color:#fff;}
    .ev-card:hover{border-color:rgba(240,192,64,0.28);transform:translateY(-4px);}
    .ev-card:hover .ev-title{color:#f0c040;}
    .ev-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#fff;transition:color 0.25s;margin-bottom:6px;line-height:1.3;}
    .ghost-btn{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);border-radius:8px;padding:7px 16px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:none;transition:all 0.2s;display:inline-block;}
    .ghost-btn:hover{background:rgba(255,255,255,0.1);color:#fff;}
  `;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{sharedStyles}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 14, color: '#f0c040' }}>✦</div>
        <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', fontSize: 16 }}>Loading organizer…</p>
      </div>
    </div>
  );

  if (!organizer) return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{sharedStyles}</style>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', fontSize: 16 }}>Organizer not found.</p>
        <Link to="/events" className="ghost-btn" style={{ marginTop: 20, display: 'inline-block' }}>← Back to Events</Link>
      </div>
    </div>
  );

  const profile = organizer.organizerProfile ?? organizer;
  const name    = profile.organizationName ?? `${organizer.firstName} ${organizer.lastName}`;
  const initial = name?.[0]?.toUpperCase() ?? '?';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{sharedStyles}</style>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,13,20,0.96)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontSize: 17, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display',serif", textDecoration: 'none' }}>✦ TketEnt</Link>
          <Link to="/events" className="ghost-btn">← Events</Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg,#0f1521,#0a0d14)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '52px 24px 44px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#f0c040,#c8920a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#0a0d14', flexShrink: 0, boxShadow: '0 8px 32px rgba(240,192,64,0.25)' }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 9, letterSpacing: 4, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>Event Organizer</p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,4vw,40px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>{name}</h1>
            {profile.bio && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 560, marginBottom: 20 }}>{profile.bio}</p>}

            {/* Stats */}
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {[
                { val: events.length,   label: 'Total Events' },
                { val: upcoming.length, label: 'Upcoming' },
                { val: past.length,     label: 'Past Events' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 22, fontWeight: 700, color: '#f0c040', lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono',monospace", marginTop: 4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Events */}
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 4, width: 'fit-content', marginBottom: 36 }}>
          {(['upcoming', 'past'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ background: activeTab === tab ? '#f0c040' : 'none', color: activeTab === tab ? '#0a0d14' : 'rgba(255,255,255,0.45)', border: 'none', borderRadius: 9, padding: '9px 20px', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {tab} ({tab === 'upcoming' ? upcoming.length : past.length})
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 32px', background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 20 }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>
              {activeTab === 'upcoming' ? 'No upcoming events at the moment.' : 'No past events yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
            {displayed.map((ev: any, idx: number) => {
              const firstPrice = ev.ticketTypes?.[0]?.price;
              const totalCap   = ev.ticketTypes?.reduce((s: number, t: any) => s + (t.quantity ?? 0), 0) ?? 0;
              const totalSold  = ev.ticketTypes?.reduce((s: number, t: any) => s + (t.sold ?? 0), 0) ?? 0;
              const remaining  = totalCap - totalSold;
              const isLowStock = totalCap > 0 && remaining > 0 && remaining <= 10;
              const isSoldOut  = totalCap > 0 && remaining === 0;
              const eventStart = ev.startTime ?? ev.date;

              return (
                <Link key={ev.id} to={`/events/${ev.id}`} className="ev-card" style={{ animation: `fadeUp 0.45s ease ${idx * 0.06}s both` }}>
                  <div style={{ position: 'relative', overflow: 'hidden', height: 180 }}>
                    {ev.imageUrl
                      ? <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a2540,#0d1523)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 28, opacity: 0.2 }}>✦</span></div>
                    }
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,#141927 100%)' }} />
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 5 }}>
                      {ev.category && <span style={{ background: '#f0c040', color: '#0a0d14', padding: '2px 8px', borderRadius: 4, fontSize: 8, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono',monospace" }}>{ev.category}</span>}
                      {isLowStock && <span style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '2px 8px', borderRadius: 20, fontSize: 8, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>⚡ {remaining} left</span>}
                      {isSoldOut && <span style={{ background: 'rgba(107,114,128,0.2)', color: '#9ca3af', padding: '2px 8px', borderRadius: 20, fontSize: 8, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>Sold Out</span>}
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px 18px' }}>
                    <p className="ev-title">{ev.title}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono',monospace", marginBottom: 12 }}>
                      🗓 {eventStart ? new Date(eventStart).toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                      {(ev.venue ?? ev.location) ? ` · ${ev.venue ?? ev.location}` : ''}
                    </p>
                    {firstPrice != null && !isSoldOut && (
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#f0c040', fontFamily: "'DM Mono',monospace" }}>KSH {firstPrice.toLocaleString()}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../utilities/types';
import * as eventService from '../services/historyService';
import { useAuth } from '../utilities/AuthContext';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFiltered] = useState<Event[]>([]);
  const [trendingIds, setTrendingIds] = useState<Set<string>>(new Set());
  const [nearbyIds, setNearbyIds] = useState<Set<string>>(new Set());
  const [nearbyDistances, setNearbyDist] = useState<Record<string, number>>({});
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const askedLocation = useRef(false);

  useEffect(() => {
    fetchEvents();
    if (user?.id) {
      eventService.listFavorites().then(resp => {
        const data = resp.data || resp;
        if (Array.isArray(data)) {
          const map: Record<string, boolean> = {};
          data.forEach((f: any) => { const id = f.eventId || f.id; if (id) map[id] = true; });
          setFavorites(map);
        }
      }).catch(() => {});
    }
  }, [user?.id]);

  useEffect(() => {
    if (events.length === 0 || askedLocation.current) return;
    askedLocation.current = true;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const { latitude, longitude } = pos.coords;
        const resp = await eventService.getNearbyEvents(latitude, longitude);
        const data = resp?.data || [];
        const ids = new Set<string>();
        const dists: Record<string, number> = {};
        data.forEach((e: any) => { ids.add(e.id); dists[e.id] = e.distanceKm; });
        setNearbyIds(ids);
        setNearbyDist(dists);
      } catch {}
    }, () => {}, { timeout: 10000 });
  }, [events]);

  useEffect(() => {
    eventService.getTrendingEvents().then(resp => {
      const data = resp?.data ?? [];
      setTrendingIds(new Set(data.map((e: any) => e.id)));
    }).catch(() => {});
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const resp = await eventService.listAllevents();
      const data = resp.data || (Array.isArray(resp) ? resp : []);
      setEvents(data);
      setFiltered(data);
    } catch { setFiltered([]); }
    finally { setLoading(false); }
  };

  const applyFilters = (all: Event[], kw: string, cat: string, date: string) => {
    let r = [...all];
    if (kw.trim()) {
      const low = kw.toLowerCase();
      r = r.filter(e => e.title?.toLowerCase().includes(low) || e.description?.toLowerCase().includes(low));
    }
    if (cat !== 'All') r = r.filter(e => e.category === cat);
    if (date) {
      const sel = new Date(date);
      r = r.filter(e => new Date(e.startTime ?? e.date ?? '') >= sel);
    }
    return r;
  };

  const handleKeyword = (v: string) => { setKeyword(v); setFiltered(applyFilters(events, v, categoryFilter, dateFilter)); };
  const handleCategory = (v: string) => { setCategoryFilter(v); setFiltered(applyFilters(events, keyword, v, dateFilter)); };
  const handleDate = (v: string) => { setDateFilter(v); setFiltered(applyFilters(events, keyword, categoryFilter, v)); };

  const categories = ['All', ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))];

  // LOGIC: Separation for the UI
  const nearbyList = filteredEvents.filter(e => nearbyIds.has(e.id)).sort((a, b) => (nearbyDistances[a.id] || 0) - (nearbyDistances[b.id] || 0));
  const otherList = filteredEvents.filter(e => !nearbyIds.has(e.id)).sort(( b) => (trendingIds.has(b.id) ? -1 : 1));

  const EventCard = ({ event, idx }: { event: Event, idx: number, isNearbySection?: boolean }) => {
    const isFavorite = favorites[event.id] || false;
    const isTrending = trendingIds.has(event.id);
    const distance = nearbyDistances[event.id];
    const firstPrice = event.ticketTypes?.[0]?.price;
    const eventStart = event.startTime ?? event.date;

    const handleFav = async (e: any) => {
      e.preventDefault();
      if (!isFavorite) { await eventService.addFavorite(event.id); setFavorites(p => ({ ...p, [event.id]: true })); }
      else { await eventService.removeFavorite(event.id); setFavorites(p => ({ ...p, [event.id]: false })); }
    };

    return (
      <div key={event.id} className="ev-card" style={{ animation: `fadeUp 0.45s ease ${idx * 0.05}s both` }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src={event.imageUrl} alt={event.title} className="ev-img" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 45%,#141927 100%)' }} />
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {event.category && <div className="cat-tag">{event.category}</div>}
            {isTrending && <span className="badge-green">🔥 Trending</span>}
            {distance !== undefined && <span className="badge-green">📍 {distance}km away</span>}
          </div>
          <button onClick={handleFav} className="fav-btn" style={{ color: isFavorite ? '#f0c040' : '#fff' }}>{isFavorite ? '★' : '☆'}</button>
        </div>
        <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <p className="ev-title">{event.title}</p>
          <p style={{ fontSize: 12, color: '#60c8f0', marginBottom: 3, fontFamily: "'DM Mono'" }}>📍 {event.venue || event.location}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>🗓 {eventStart ? new Date(eventStart).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'TBD'}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#f0c040', fontFamily: "'DM Mono'" }}>{firstPrice ? `KSH ${firstPrice.toLocaleString()}` : 'Free'}</p>
            <Link to={`/events/${event.id}`} className="view-btn">Details →</Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com');
        .ev-card{background:linear-gradient(160deg,#141927 0%,#0f1521 100%);border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;transition:all 0.3s;display:flex;flex-direction:column;}
        .ev-card:hover{border-color:rgba(240,192,64,0.28);transform:translateY(-5px);box-shadow:0 24px 56px rgba(0,0,0,0.55);}
        .ev-img{width:100%;height:200px;object-fit:cover;transition:transform 0.5s ease;filter:brightness(0.8);}
        .ev-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;margin-bottom:8px;}
        .field-input,.field-select{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 14px;color:#fff;font-size:13px;outline:none;}
        .cat-pill{padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;font-family:'DM Mono';transition:0.2s;}
        .cat-pill.active{background:#f0c040;color:#0a0d14;}
        .cat-pill.inactive{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.4);border:1px solid rgba(255,255,255,0.08);}
        .view-btn{background:rgba(240,192,64,0.1);border:1px solid rgba(240,192,64,0.25);color:#f0c040;padding:8px 16px;border-radius:8px;font-size:12px;text-decoration:none;font-family:'DM Mono';}
        .badge-green{background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);color:#4ade80;font-size:8px;letter-spacing:1.5px;padding:2px 8px;border-radius:20px;font-family:'DM Mono';text-transform:uppercase;font-weight:800;}
        .cat-tag{background:#f0c040;color:#0a0d14;padding:3px 10px;border-radius:5px;font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;font-family:'DM Mono';}
        .fav-btn{background:rgba(10,13,20,0.7);border:1px solid rgba(255,255,255,0.15);border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;position:absolute;top:10px;right:10px;backdrop-filter:blur(8px);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,13,20,0.96)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display'" }}>✦ TketEnt</span>
          <Link to="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Home</Link>
        </div>
      </header>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '52px 24px 36px', animation: 'fadeUp 0.5s ease' }}>
        <p style={{ fontSize: 9, letterSpacing: 4, color: 'rgba(240,192,64,0.6)', fontFamily: "'DM Mono'", textTransform: 'uppercase', marginBottom: 10 }}>Discover</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 3, height: 44, background: '#f0c040', borderRadius: 2 }} />
          <h1 style={{ fontFamily: "'Playfair Display'", fontSize: 42, fontWeight: 700 }}>Upcoming Events<span style={{ color: '#f0c040' }}>.</span></h1>
        </div>
      </div>

      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 32 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <input type="text" value={keyword} onChange={e => handleKeyword(e.target.value)} className="field-input" placeholder="Search events..." style={{ flex: 1 }} />
            <select value={categoryFilter} onChange={e => handleCategory(e.target.value)} className="field-select">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={dateFilter} onChange={e => handleDate(e.target.value)} className="field-input" />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => handleCategory(cat)} className={`cat-pill ${categoryFilter === cat ? 'active' : 'inactive'}`}>{cat}</button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 0 80px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading events...</p>
          ) : (
            <>
              {nearbyList.length > 0 && (
                <div style={{ marginBottom: 60 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <span style={{ color: '#4ade80', fontSize: 18 }}>📍</span>
                    <h2 style={{ fontSize: 10, letterSpacing: 3, color: '#4ade80', fontFamily: "'DM Mono'", textTransform: 'uppercase' }}>Nearby Your Location</h2>
                    <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(74,222,128,0.2), transparent)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
                    {nearbyList.map((e, idx) => <EventCard key={e.id} event={e} idx={idx} isNearbySection />)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <h2 style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono'", textTransform: 'uppercase' }}>
                  {nearbyList.length > 0 ? 'Explore More' : 'All Events'}
                </h2>
                <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
                {otherList.map((e, idx) => <EventCard key={e.id} event={e} idx={idx + nearbyList.length} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventsPage;

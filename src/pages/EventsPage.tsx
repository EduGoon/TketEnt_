import React, { useState, useEffect, useRef, useMemo } from 'react';
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

  // 1. Initial Load (Events only)
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const resp = await eventService.listAllevents();
        const data = resp.data || (Array.isArray(resp) ? resp : []);
        setEvents(data);
        setFiltered(data);
      } catch { setFiltered([]); }
      finally { setLoading(false); }
    };
    init();

    eventService.getTrendingEvents().then(r => {
      const d = r?.data ?? [];
      setTrendingIds(new Set(d.map((e: any) => e.id)));
    }).catch(() => {});
  }, []);

  // 2. Load Favorites (Separate to avoid page blinking)
  useEffect(() => {
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

  // 3. Geolocation
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

  const categories = useMemo(() => 
    ['All', ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))], 
    [events]
  );

  const handleFilter = (kw: string, cat: string, date: string) => {
    setKeyword(kw);
    setCategoryFilter(cat);
    setDateFilter(date);
    
    let r = [...events];
    if (kw.trim()) {
      const low = kw.toLowerCase();
      r = r.filter(e => e.title?.toLowerCase().includes(low) || e.description?.toLowerCase().includes(low));
    }
    if (cat !== 'All') r = r.filter(e => e.category === cat);
    if (date) {
      const sel = new Date(date);
      r = r.filter(e => new Date(e.startTime ?? e.date ?? '') >= sel);
    }
    setFiltered(r);
  };

  const nearbyList = filteredEvents.filter(e => nearbyIds.has(e.id)).sort((a, b) => (nearbyDistances[a.id] || 0) - (nearbyDistances[b.id] || 0));
  const otherList = filteredEvents.filter(e => !nearbyIds.has(e.id)).sort((b) => (trendingIds.has(b.id) ? -1 : 1));

  const EventCard = ({ event, idx }: { event: Event, idx: number }) => {
    const isFav = favorites[event.id] || false;
    const isTrend = trendingIds.has(event.id);
    const dist = nearbyDistances[event.id];
    const price = event.ticketTypes?.[0]?.price;
    const start = event.startTime ?? event.date;

    const toggleFav = async (e: any) => {
      e.preventDefault();
      const next = !isFav;
      setFavorites(p => ({ ...p, [event.id]: next }));
      try {
        next ? await eventService.addFavorite(event.id) : await eventService.removeFavorite(event.id);
      } catch { setFavorites(p => ({ ...p, [event.id]: !next })); }
    };

    return (
      <div className="ev-card" style={{ animation: `fadeUp 0.5s ease ${idx * 0.04}s both` }}>
        <div className="card-media">
          <img src={event.imageUrl} alt={event.title} className="ev-img" />
          {/* SCRIM: Darkens top area so badges POP even on bright images */}
          <div className="card-scrim" />
          
          <div className="badge-stack">
            {event.category && <div className="cat-tag">{event.category}</div>}
            {isTrend && <span className="badge-green">🔥 Trending</span>}
            {dist !== undefined && <span className="badge-green">📍 {dist}km away</span>}
          </div>
          <button onClick={toggleFav} className="fav-btn" style={{ color: isFav ? '#f0c040' : '#fff' }}>
            {isFav ? '★' : '☆'}
          </button>
        </div>
        <div className="card-body">
          <p className="ev-title">{event.title}</p>
          <p className="ev-meta">📍 {event.venue || event.location}</p>
          <p className="ev-date">🗓 {start ? new Date(start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'TBD'}</p>
          <div className="card-footer">
            <p className="ev-price">{price ? `KSH ${price.toLocaleString()}` : 'Free'}</p>
            <Link to={`/events/${event.id}`} className="view-btn">Details →</Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com');
        
        .page-wrap { min-height: 100vh; background: #0a0d14; color: #fff; font-family: 'DM Sans', sans-serif; }
        .container { maxWidth: 1060px; margin: 0 auto; padding: 0 24px; }
        
        /* Layout Fixes */
        .filter-grid { display: flex; gap: 16px; margin-bottom: 24px; }
        @media (max-width: 768px) {
          .filter-grid { flex-direction: column; }
          .filter-grid input[type="date"] { width: 100%; -webkit-appearance: none; min-height: 44px; }
          .filter-grid input[type="date"]::before { content: attr(placeholder); color: rgba(255,255,255,0.3); margin-right: 10px; }
        }

        /* Card Visuals */
        .ev-card { background: #141927; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden; display: flex; flex-direction: column; transition: 0.3s ease; }
        .ev-card:hover { transform: translateY(-6px); border-color: #f0c040; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .card-media { position: relative; height: 200px; overflow: hidden; }
        .ev-img { width: 100%; height: 100%; object-fit: cover; }
        .card-scrim { position: absolute; top: 0; left: 0; right: 0; height: 60px; background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%); pointer-events: none; }
        
        /* Badges & Typography */
        .badge-stack { position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; flex-wrap: wrap; z-index: 2; }
        .badge-green { background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); border: 1px solid #4ade80; color: #4ade80; font-size: 8px; padding: 3px 8px; border-radius: 20px; font-family: 'DM Mono'; font-weight: 800; text-transform: uppercase; }
        .cat-tag { background: #f0c040; color: #0a0d14; padding: 3px 10px; border-radius: 6px; font-size: 9px; font-weight: 800; font-family: 'DM Mono'; text-transform: uppercase; }
        .ev-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .ev-meta { font-size: 12px; color: #60c8f0; font-family: 'DM Mono'; }
        .ev-date { font-size: 11px; color: rgba(255,255,255,0.3); margin: 4px 0 16px; }
        .ev-price { font-size: 17px; font-weight: 700; color: #f0c040; font-family: 'DM Mono'; }
        
        /* Controls */
        .field-input, .field-select { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; color: #fff; font-size: 14px; outline: none; transition: 0.2s; }
        .field-input:focus { border-color: #f0c040; }
        .cat-pill { padding: 8px 16px; border-radius: 30px; font-size: 11px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: 'DM Mono'; border: 1px solid transparent; }
        .cat-pill.active { background: #f0c040; color: #0a0d14; }
        .cat-pill.inactive { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); border-color: rgba(255,255,255,0.1); }
        .view-btn { background: rgba(240,192,64,0.1); border: 1px solid rgba(240,192,64,0.3); color: #f0c040; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 12px; font-family: 'DM Mono'; transition: 0.2s; }
        .view-btn:hover { background: #f0c040; color: #0a0d14; }
        .fav-btn { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; width: 36px; height: 36px; position: absolute; top: 10px; right: 10px; cursor: pointer; backdrop-filter: blur(6px); z-index: 3; }
        
        @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <header style={{ height: 64, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,13,20,0.9)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <div className="container" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#f0c040', fontFamily: 'Playfair Display' }}>✦ TketEnt</span>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13 }}>Home</Link>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 48 }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 44, fontWeight: 700 }}>Events Near You<span style={{ color: '#f0c040' }}>.</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Discover curated experiences in your city.</p>
        </div>

        <section className="filter-grid">
          <input type="text" className="field-input" placeholder="Search events..." style={{ flex: 2 }} value={keyword} onChange={e => handleFilter(e.target.value, categoryFilter, dateFilter)} />
          <select className="field-select" style={{ flex: 1 }} value={categoryFilter} onChange={e => handleFilter(keyword, e.target.value, dateFilter)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" className="field-input" placeholder="Select Date" style={{ flex: 1 }} value={dateFilter} onChange={e => handleFilter(keyword, categoryFilter, e.target.value)} />
        </section>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 48 }}>
          {categories.map(c => (
            <button key={c} className={`cat-pill ${categoryFilter === c ? 'active' : 'inactive'}`} onClick={() => handleFilter(keyword, c, dateFilter)}>{c}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.5 }}>Syncing events...</div>
        ) : (
          <>
            {nearbyList.length > 0 && (
              <div style={{ marginBottom: 64 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <h2 style={{ fontSize: 11, letterSpacing: 3, color: '#4ade80', fontFamily: 'DM Mono', textTransform: 'uppercase' }}>📍 Strictly Local</h2>
                  <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(74,222,128,0.2), transparent)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 24 }}>
                  {nearbyList.map((e, i) => <EventCard key={e.id} event={e} idx={i} />)}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <h2 style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono', textTransform: 'uppercase' }}>
                {nearbyList.length > 0 ? 'Widen Your Search' : 'All Published Events'}
              </h2>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 24, paddingBottom: 100 }}>
              {otherList.map((e, i) => <EventCard key={e.id} event={e} idx={i + nearbyList.length} />)}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default EventsPage;

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

  // Initial Load: Events & Favorites
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [eventResp, favResp, trendResp] = await Promise.allSettled([
          eventService.listAllevents(),
          user?.id ? eventService.listFavorites() : Promise.resolve({ data: [] }),
          eventService.getTrendingEvents()
        ]);

        if (eventResp.status === 'fulfilled') {
          const data = eventResp.value.data || (Array.isArray(eventResp.value) ? eventResp.value : []);
          setEvents(data);
          setFiltered(data);
        }

        if (favResp.status === 'fulfilled') {
          const favData = favResp.value.data || favResp.value;
          if (Array.isArray(favData)) {
            const map: Record<string, boolean> = {};
            favData.forEach((f: any) => { const id = f.eventId || f.id; if (id) map[id] = true; });
            setFavorites(map);
          }
        }

        if (trendResp.status === 'fulfilled') {
          const data = trendResp.value?.data ?? [];
          setTrendingIds(new Set(data.map((e: any) => e.id)));
        }
      } catch (err) {
        console.error("Failed to load events page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user?.id]);

  // Handle Geolocation
  useEffect(() => {
    if (events.length === 0 || askedLocation.current) return;
    askedLocation.current = true;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resp = await eventService.getNearbyEvents(latitude, longitude);
          const nearbyArray = resp?.data || [];
          
          if (Array.isArray(nearbyArray)) {
            const ids = new Set<string>();
            const distances: Record<string, number> = {};
            nearbyArray.forEach((e: any) => {
              if (e?.id) {
                ids.add(e.id);
                distances[e.id] = e.distanceKm;
              }
            });
            setNearbyIds(ids);
            setNearbyDist(distances);
          }
        } catch (err) {
          // Fail silently in UI
        }
      },
      () => {}, // Ignore denial
      { timeout: 8000 }
    );
  }, [events]);

  const applyFilters = (all: Event[], kw: string, cat: string, date: string) => {
    let r = [...all];
    if (kw.trim()) {
      const low = kw.toLowerCase();
      r = r.filter(e => e.title?.toLowerCase().includes(low) || e.description?.toLowerCase().includes(low));
    }
    if (cat && cat !== 'All') r = r.filter(e => e.category === cat);
    if (date) {
      const sel = new Date(date);
      r = r.filter(e => {
        const d = new Date(e.startTime ?? e.date ?? '');
        return !isNaN(d.getTime()) && d >= sel;
      });
    }
    return r;
  };

  const handleKeyword = (v: string) => { setKeyword(v); setFiltered(applyFilters(events, v, categoryFilter, dateFilter)); };
  const handleCategory = (v: string) => { setCategoryFilter(v); setFiltered(applyFilters(events, keyword, v, dateFilter)); };
  const handleDate = (v: string) => { setDateFilter(v); setFiltered(applyFilters(events, keyword, categoryFilter, v)); };

  // Logic: Separate filtered events into "Nearby" and "Others"
  const nearbyList = filteredEvents.filter(e => nearbyIds.has(e.id))
    .sort((a, b) => (nearbyDistances[a.id] || 0) - (nearbyDistances[b.id] || 0));
  
  const otherList = filteredEvents.filter(e => !nearbyIds.has(e.id))
    .sort((a, b) => (trendingIds.has(b.id) ? 1 : 0) - (trendingIds.has(a.id) ? 1 : 0));

  const categories = ['All', ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))];

  // Shared Event Card Component for consistency
  const EventCard = ({ event, idx }: { event: Event, idx: number }) => {
    const isFavorite = favorites[event.id] || false;
    const isTrending = trendingIds.has(event.id);
    const isNearby = nearbyIds.has(event.id);
    const distance = nearbyDistances[event.id];
    const eventStart = event.startTime ?? event.date;
    const firstPrice = event.ticketTypes?.[0]?.price;

    const handleFavorite = async (e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (!isFavorite) {
        await eventService.addFavorite(event.id);
        setFavorites(p => ({ ...p, [event.id]: true }));
      } else {
        await eventService.removeFavorite(event.id);
        setFavorites(p => ({ ...p, [event.id]: false }));
      }
    };

    return (
      <div key={event.id} className="ev-card" style={{ animation: `fadeUp 0.45s ease ${idx * 0.05}s both` }}>
        <div style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
          <img src={event.imageUrl || ''} alt={event.title} className="ev-img" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 45%,#141927 100%)' }} />
          
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 5 }}>
            {event.category && <div style={{ background: '#f0c040', color: '#0a0d14', padding: '3px 10px', borderRadius: 5, fontSize: 9, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>{event.category}</div>}
            {isTrending && <span className="badge-trending">🔥 Trending</span>}
            {isNearby && distance !== undefined && <span className="badge-nearby">📍 {distance}km</span>}
          </div>

          <button onClick={handleFavorite} style={{ position: 'absolute', top: 10, right: 10, background: isFavorite ? '#f0c040' : 'rgba(10,13,20,0.6)', border: 'none', borderRadius: 8, width: 34, height: 34, color: isFavorite ? '#0a0d14' : '#fff', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
            {isFavorite ? '★' : '☆'}
          </button>
        </div>

        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <p className="ev-title">{event.title}</p>
          <p style={{ fontSize: 12, color: '#60c8f0', fontFamily: "'DM Mono',monospace" }}>📍 {event.venue || event.location}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>🗓 {eventStart ? new Date(eventStart).toLocaleDateString() : 'TBD'}</p>
          
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#f0c040' }}>{firstPrice ? `KSH ${firstPrice.toLocaleString()}` : 'Free'}</p>
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
        .ev-card{background:#141927;border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;display:flex;flex-direction:column;transition:all 0.3s;}
        .ev-card:hover{transform:translateY(-5px);border-color:#f0c040;box-shadow:0 12px 30px rgba(0,0,0,0.4);}
        .ev-img{width:100%;height:100%;object-fit:cover;transition:0.5s;}
        .ev-title{font-family:'Playfair Display',serif;font-size:18px;margin-bottom:8px;}
        .field-input,.field-select{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px;color:#fff;outline:none;}
        .view-btn{background:rgba(240,192,64,0.1);color:#f0c040;padding:8px 12px;border-radius:8px;text-decoration:none;font-size:12px;font-family:'DM Mono';}
        .badge-nearby{background:rgba(96,200,240,0.1);color:#60c8f0;padding:2px 8px;border-radius:20px;font-size:9px;font-family:'DM Mono';}
        .badge-trending{background:rgba(240,192,64,0.1);color:#f0c040;padding:2px 8px;border-radius:20px;font-size:9px;font-family:'DM Mono';}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <header style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#f0c040', fontFamily: 'Playfair Display' }}>✦ TketEnt</span>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</Link>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 40, marginBottom: 30 }}>Upcoming Events<span style={{ color: '#f0c040' }}>.</span></h1>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: 15, marginBottom: 40, flexWrap: 'wrap' }}>
          <input className="field-input" placeholder="Search..." value={keyword} onChange={e => handleKeyword(e.target.value)} />
          <select className="field-select" value={categoryFilter} onChange={e => handleCategory(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" className="field-input" value={dateFilter} onChange={e => handleDate(e.target.value)} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading events...</div>
        ) : (
          <>
            {/* NEARBY SECTION - Only shows if there are nearby events */}
            {nearbyList.length > 0 && (
              <section style={{ marginBottom: 60 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 18 }}>📍</span>
                  <h2 style={{ fontSize: 14, letterSpacing: 2, fontFamily: 'DM Mono', color: '#60c8f0', textTransform: 'uppercase' }}>Near Your Location</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
                  {nearbyList.map((event, i) => <EventCard key={event.id} event={event} idx={i} />)}
                </div>
              </section>
            )}

            {/* MAIN DISCOVERY SECTION */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.2)' }} />
                <h2 style={{ fontSize: 14, letterSpacing: 2, fontFamily: 'DM Mono', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                  {nearbyList.length > 0 ? 'More to Explore' : 'All Events'}
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
                {otherList.map((event, i) => <EventCard key={event.id} event={event} idx={i + nearbyList.length} />)}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default EventsPage;

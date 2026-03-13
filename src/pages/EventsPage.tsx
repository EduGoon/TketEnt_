import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../utilities/types';
import * as eventService from '../services/historyService';
import { useAuth } from '../utilities/AuthContext';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<{ [eventId: string]: boolean }>({});
 const { user } = useAuth();

useEffect(() => {
    const loadInitialData = async () => {
      setFavorites({});
      await fetchEvents();
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const resp = await eventService.listFavorites();
        const favData = resp.data || resp;
        if (Array.isArray(favData)) {
          const map: { [key: string]: boolean } = {};
          favData.forEach((f: any) => {
            const id = f.eventId || f.id;
            if (id) map[id] = true;
          });
          setFavorites(map);
        }
      } catch (err) {
        console.error("Failed to sync favorites", err);
      }
    };
    loadInitialData();
  }, [user?.id]);

  
  // ── Single source of truth for filtering — runs entirely client-side ──
  const applyFilters = (
    allEvents: Event[],
    kw: string,
    cat: string,
    date: string,
  ): Event[] => {
    let result = [...allEvents];
 
    if (kw.trim() !== '') {
      const lower = kw.toLowerCase();
      result = result.filter(e =>
        e.title?.toLowerCase().includes(lower) ||
        e.description?.toLowerCase().includes(lower)
      );
    }
 
    if (cat && cat !== 'All') {
      result = result.filter(e => e.category === cat);
    }
 
        if (date) {
      const selectedDate = new Date(date);
      result = result.filter(e => {
        const eventDate = new Date(e.startTime ?? e.date ?? ''); 
        
        // Check if the date is actually valid before comparing
        if (isNaN(eventDate.getTime())) return false;
        
        return eventDate >= selectedDate;
      });
    }
 
    return result;
  };
 
  const fetchEvents = async (params: any = {}) => {
    setLoading(true);
    try {
      const resp = await eventService.listAllevents(params);
      const data = resp.data || (Array.isArray(resp) ? resp : []);
      setEvents(data);
      // On initial load filters are all at default — show everything
      setFilteredEvents(data);
    } catch (err) {
      console.error('Failed to load events', err);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };
 
  const categories = ['All', ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))];
 
  // ── Filter handlers — all purely client-side on the already-loaded events ──
  const handleKeyword = (value: string) => {
    setKeyword(value);
    setFilteredEvents(applyFilters(events, value, categoryFilter, dateFilter));
  };
 
  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    setFilteredEvents(applyFilters(events, keyword, category, dateFilter));
  };
 
  const handleDateFilter = (date: string) => {
    setDateFilter(date);
    setFilteredEvents(applyFilters(events, keyword, categoryFilter, date));
  };
 
  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
 
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes headerIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
 
        .ev-card {
          background: linear-gradient(160deg, #141927 0%, #0f1521 100%);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          display: flex;
          flex-direction: column;
        }
        .ev-card:hover {
          border-color: rgba(240,192,64,0.28);
          transform: translateY(-5px);
          box-shadow: 0 24px 56px rgba(0,0,0,0.55);
        }
        .ev-card:hover .ev-img { transform: scale(1.06); }
        .ev-card:hover .ev-title { color: #f0c040; }
        .ev-card:hover .ev-arrow { transform: translateX(4px); }
 
        .ev-img {
          width: 100%; height: 200px; object-fit: cover;
          transition: transform 0.5s ease;
          filter: brightness(0.78);
        }
 
        .ev-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px; font-weight: 700;
          color: #fff; line-height: 1.3;
          transition: color 0.25s;
          margin-bottom: 8px;
        }
 
        .ev-arrow { display: inline-block; transition: transform 0.2s; }
 
        .field-wrap { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-size: 9px; letter-spacing: 2.5px; color: rgba(240,192,64,0.6);
          text-transform: uppercase; font-family: 'DM Mono', monospace;
        }
        .field-input, .field-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 10px 14px;
          font-size: 13px; color: #fff;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
          min-width: 160px;
        }
        .field-input:focus, .field-select:focus { border-color: rgba(240,192,64,0.5); }
        .field-input::placeholder { color: rgba(255,255,255,0.25); }
        .field-select option { background: #141927; color: #fff; }
        input[type='date']::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
 
        .ghost-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6); border-radius: 8px;
          padding: 7px 16px; font-size: 13px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; text-decoration: none;
          transition: all 0.2s;
        }
        .ghost-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
 
        .view-btn {
          background: rgba(240,192,64,0.1);
          border: 1px solid rgba(240,192,64,0.25);
          color: #f0c040; border-radius: 8px;
          padding: 8px 16px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'DM Mono', sans-serif;
          text-decoration: none; letter-spacing: 0.5px;
          transition: all 0.2s; white-space: nowrap;
        }
        .view-btn:hover { background: rgba(240,192,64,0.2); }
 
        .skeleton {
          height: 360px;
          background: linear-gradient(160deg, #141927, #0f1521);
          border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);
          position: relative; overflow: hidden;
        }
        .skeleton::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
          animation: shimmer 1.8s infinite;
        }
 
        .cat-pill {
          padding: 5px 14px; border-radius: 20px; font-size: 11px;
          font-weight: 600; cursor: pointer; border: none;
          font-family: 'DM Mono', monospace; letter-spacing: 0.5px;
          transition: all 0.2s; white-space: nowrap;
        }
        .cat-pill.active { background: #f0c040; color: #0a0d14; }
        .cat-pill.inactive { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.08); }
        .cat-pill.inactive:hover { background: rgba(255,255,255,0.1); color: #fff; }
      `}</style>
 
      {/* ── Sticky Nav ── */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,13,20,0.96)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100, animation: 'headerIn 0.4s ease forwards' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display', serif", letterSpacing: -0.3 }}>✦ Venue</span>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/" className="ghost-btn">← Home</Link>
          </nav>
        </div>
      </header>
 
      {/* ── Hero heading ── */}
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '52px 24px 36px', animation: 'fadeUp 0.5s ease forwards' }}>
        <p style={{ fontSize: 9, letterSpacing: 4, color: 'rgba(240,192,64,0.65)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>Discover</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 3, height: 44, background: '#f0c040', borderRadius: 2, flexShrink: 0 }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 }}>
            Upcoming Events<span style={{ color: '#f0c040' }}>.</span>
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 10, marginLeft: 17, paddingLeft: 14, borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          Find and book the best events near you.
        </p>
      </div>
 
      {/* ── Filters ── */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px 0' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>
          <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="field-wrap" style={{ flex: '1 1 180px' }}>
              <label className="field-label">Search</label>
              <input
                type="text"
                value={keyword}
                onChange={e => handleKeyword(e.target.value)}
                className="field-input"
                placeholder="Event name or keyword"
              />
            </div>
            <div className="field-wrap">
              <label className="field-label">Category</label>
              <select value={categoryFilter} onChange={e => handleCategoryFilter(e.target.value)} className="field-select">
                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div className="field-wrap">
              <label className="field-label">Date From</label>
              <input type="date" value={dateFilter} onChange={e => handleDateFilter(e.target.value)} className="field-input" />
            </div>
          </form>
 
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
              {categories.map(cat => (
                <button key={cat} type="button" className={`cat-pill ${categoryFilter === cat ? 'active' : 'inactive'}`} onClick={() => handleCategoryFilter(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
 
      {/* ── Events Grid ── */}
      <section style={{ padding: '48px 0 80px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 24 }}>
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" />)}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 32px', background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>✦</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: 6 }}>No events found.</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>TRY ADJUSTING YOUR FILTERS</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono', monospace", marginBottom: 24 }}>
                {filteredEvents.length} EVENT{filteredEvents.length !== 1 ? 'S' : ''}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 24 }}>
                {filteredEvents.map((event, idx) => {
                  const firstPrice = event.ticketTypes?.[0]?.price;
                  const eventStart = event.startTime ?? event.date;
                  const venue = event.venue ?? event.location;
                  const isFavorite = favorites[event.id] || false;
 
                  const handleFavorite = async () => {
                    if (!isFavorite) {
                      await eventService.addFavorite(event.id);
                      setFavorites(prev => ({ ...prev, [event.id]: true }));
                    } else {
                      await eventService.removeFavorite(event.id);
                      setFavorites(prev => ({ ...prev, [event.id]: false }));
                    }
                  };
 
                  return (
                    <div key={event.id} className="ev-card" style={{ animation: `fadeUp 0.45s ease ${idx * 0.06}s both` }}>
                      <div style={{ position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={event.imageUrl} alt={event.title} className="ev-img" />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, #141927 100%)' }} />
                        {event.category && (
                          <div style={{ position: 'absolute', top: 14, left: 14, background: '#f0c040', color: '#0a0d14', padding: '3px 10px', borderRadius: 5, fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
                            {event.category}
                          </div>
                        )}
                        <button
                          onClick={handleFavorite}
                          style={{ position: 'absolute', top: 12, right: 12, background: isFavorite ? 'rgba(240,192,64,0.9)' : 'rgba(10,13,20,0.7)', border: `1px solid ${isFavorite ? '#f0c040' : 'rgba(255,255,255,0.15)'}`, borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s', color: isFavorite ? '#0a0d14' : 'rgba(255,255,255,0.7)' }}
                          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {isFavorite ? '★' : '☆'}
                        </button>
                      </div>
 
                      <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <p className="ev-title">{event.title}</p>
                        <p style={{ fontSize: 12, color: '#60c8f0', marginBottom: 3, fontFamily: "'DM Mono', monospace" }}>📍 {venue}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
                          🗓 {eventStart ? new Date(eventStart).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date TBD'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
                          {firstPrice != null && (
                            <div>
                              <p style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono', monospace", marginBottom: 2 }}>FROM</p>
                              <p style={{ fontSize: 17, fontWeight: 700, color: '#f0c040', fontFamily: "'DM Mono', monospace" }}>
                                KSH {firstPrice.toLocaleString()}
                                {event.ticketTypes.length > 1 && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>& up</span>}
                              </p>
                            </div>
                          )}
                          <Link to={`/events/${event.id}`} className="view-btn">View Details <span className="ev-arrow">→</span></Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
 
export default EventsPage;
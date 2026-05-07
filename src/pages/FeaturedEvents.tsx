import React from 'react';
import { Link } from 'react-router-dom';
import * as eventService from '../services/historyService';
import { Event } from '../utilities/types';
import { buildEventPath } from '../utilities/url';

const FeaturedEvents: React.FC = () => {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    eventService.listAllevents()
      .then(resp => setEvents((resp.data || []).slice(0, 6)))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 300, background: 'linear-gradient(160deg,#141927,#0f1521)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)', animation: 'shimmer 1.8s infinite' }} />
        </div>
      ))}
    </div>
  );

  if (events.length === 0) return (
    <div style={{ textAlign: 'center', padding: '48px 24px', background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 20 }}>
      <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>No events yet — check back soon.</p>
    </div>
  );

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
        {events.map((event, idx) => {
          const firstPrice = event.ticketTypes?.[0]?.price;
          const eventStart = event.startTime ?? event.date;
          const venue      = event.venue ?? event.location;
          const totalCap   = event.ticketTypes?.reduce((s, t) => s + (t.quantity ?? 0), 0) ?? 0;
          const totalSold  = event.ticketTypes?.reduce((s, t) => s + (t.sold ?? 0), 0) ?? 0;
          const remaining  = totalCap - totalSold;
          const isLowStock = totalCap > 0 && remaining > 0 && remaining <= 10;
          const isSoldOut  = totalCap > 0 && remaining === 0;

          return (
            <Link
              key={event.id}
              to={buildEventPath(event.id, event.title)}
              style={{
                textDecoration: 'none', display: 'flex', flexDirection: 'column',
                background: 'linear-gradient(160deg,#141927,#0f1521)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, overflow: 'hidden',
                transition: 'border-color 0.3s, transform 0.3s',
                animation: `fadeUp 0.45s ease ${idx * 0.08}s both`,
                color: '#fff',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,192,64,0.28)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', height: 180, overflow: 'hidden', flexShrink: 0 }}>
                {event.imageUrl
                  ? <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.78)', transition: 'transform 0.5s ease' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a2540,#0d1523)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 32, opacity: 0.15 }}>✦</span></div>
                }
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 45%,#141927 100%)' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {event.category && <span style={{ background: '#f0c040', color: '#0a0d14', padding: '2px 8px', borderRadius: 4, fontSize: 8, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono',monospace" }}>{event.category}</span>}
                  {isLowStock && <span style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '2px 8px', borderRadius: 20, fontSize: 8, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>⚡ {remaining} left</span>}
                  {isSoldOut && <span style={{ background: 'rgba(107,114,128,0.2)', color: '#9ca3af', padding: '2px 8px', borderRadius: 20, fontSize: 8, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>Sold Out</span>}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 8 }}>{event.title}</p>
                {venue && <p style={{ fontSize: 11, color: '#60c8f0', fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>📍 {venue}</p>}
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', fontFamily: "'DM Mono',monospace", marginBottom: 14 }}>
                  🗓 {eventStart ? new Date(eventStart).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date TBD'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {firstPrice != null && !isSoldOut ? (
                    <div>
                      <p style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>FROM</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#f0c040', fontFamily: "'DM Mono',monospace" }}>
                        KSH {firstPrice.toLocaleString()}
                        {(event.ticketTypes?.length ?? 0) > 1 && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>& up</span>}
                      </p>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{isSoldOut ? 'Sold Out' : ''}</span>
                  )}
                  <span style={{ background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.25)', color: '#f0c040', borderRadius: 8, padding: '7px 14px', fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono',monospace", letterSpacing: 0.5 }}>
                    View →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default FeaturedEvents;
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';
import * as ticketService from '../services/ticketService';
import * as eventService from '../services/historyService';
import { useSeo } from '../utilities/seo';
import { buildEventUrl } from '../utilities/url';

/* ── Reviews Section ─────────────────────────────────────────────────────── */
function ReviewsSection({ eventId, user }: { eventId: string; user: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const fetchReviews = async () => {
    try {
      const data = await eventService.getEventReviews(eventId);
      setReviews(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) { console.error('Failed to fetch reviews', err); }
  };

  useEffect(() => { fetchReviews(); }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await eventService.createReview({ eventId, rating, comment });
      setRating(0); setComment('');
      await fetchReviews();
    } catch { setError('Failed to submit review'); }
    setSubmitting(false);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ width: 3, height: 28, background: '#f0c040', borderRadius: 2, flexShrink: 0 }} />
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#fff' }}>Reviews</h3>
        {avgRating && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: 10, padding: '6px 14px' }}>
            <span style={{ color: '#f0c040', fontSize: 18 }}>★</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#f0c040', fontFamily: "'DM Mono', monospace" }}>{avgRating}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono', monospace" }}>/ 5</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', fontSize: 15 }}>No reviews yet — be the first.</p>
          </div>
        ) : reviews.map((r, idx) => (
          <div key={idx} style={{ background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 22px', animation: `fadeUp 0.4s ease ${idx * 0.05}s both` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <p style={{ fontWeight: 600, color: '#fff', fontSize: 14, marginBottom: 4 }}>{r.user?.firstName ?? r.user?.name ?? r.userName ?? 'Anonymous'}</p>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? '#f0c040' : 'rgba(255,255,255,0.15)', fontSize: 14 }}>★</span>)}
                </div>
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono', monospace", letterSpacing: 0.5 }}>
                {new Date(r.createdAt).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{r.comment}</p>
          </div>
        ))}
      </div>

      {user && (
        <div style={{ background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(240,192,64,0.15)', borderRadius: 14, padding: '24px 26px' }}>
          <p style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>Leave a Review</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button" onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: 26, color: star <= (hoverRating || rating) ? '#f0c040' : 'rgba(255,255,255,0.15)', transition: 'color 0.15s, transform 0.15s', transform: star <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)' }}>★</button>
              ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience…" required
              style={{ width: '100%', minHeight: 90, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#fff', fontFamily: "'DM Sans', sans-serif", resize: 'vertical', outline: 'none', marginBottom: 14, lineHeight: 1.6 }}
              onFocus={e => (e.target.style.borderColor = 'rgba(240,192,64,0.45)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <button type="submit" disabled={submitting || rating === 0}
              style={{ background: rating > 0 ? '#f0c040' : 'rgba(255,255,255,0.08)', color: rating > 0 ? '#0a0d14' : 'rgba(255,255,255,0.35)', border: 'none', borderRadius: 9, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: rating > 0 ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.25s' }}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
            {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 10 }}>{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
}

/* ── Map Directions Card ─────────────────────────────────────────────────── */
function MapDirectionsCard({ event }: { event: any }) {
const hasLocation = event.address || (event.latitude != null && event.longitude != null);

if (!hasLocation) return null;

  const query = event.address
    ? encodeURIComponent(event.address)
    : `${event.latitude},${event.longitude}`;

  const mapsUrl = event.address
    ? `https://www.google.com/maps/search/?api=1&query=${query}`
    : `https://www.google.com/maps?q=${event.latitude},${event.longitude}`;

  // Fallback: use OpenStreetMap embed which needs no API key
 const osmEmbedUrl = event.latitude != null && event.longitude != null
  ? `https://www.openstreetmap.org/export/embed.html?bbox=${event.longitude - 0.01},${event.latitude - 0.01},${event.longitude + 0.01},${event.latitude + 0.01}&layer=mapnik&marker=${event.latitude},${event.longitude}`
  : null;

  return (
    <div style={{ marginBottom: 32 }}>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', textDecoration: 'none', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', cursor: 'pointer' }}
      >
        {/* Map embed */}
        {osmEmbedUrl ? (
          <div style={{ position: 'relative', height: 180, overflow: 'hidden', pointerEvents: 'none' }}>
            <iframe
              src={osmEmbedUrl}
              style={{ width: '100%', height: '220px', border: 'none', marginTop: -20, filter: 'brightness(0.7) saturate(0.6) hue-rotate(180deg) invert(0.08)' }}
              title="Event location map"
              scrolling="no"
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(10,13,20,0.9) 100%)' }} />
          </div>
        ) : (
          <div style={{ height: 180, background: 'linear-gradient(160deg,#141927,#0f1521)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Decorative map grid */}
            <svg width="100%" height="180" style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
              <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60c8f0" strokeWidth="0.5"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <circle cx="50%" cy="50%" r="4" fill="#f0c040" />
              <circle cx="50%" cy="50%" r="12" fill="none" stroke="#f0c040" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="50%" cy="50%" r="24" fill="none" stroke="#f0c040" strokeWidth="0.5" opacity="0.5" />
            </svg>
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📍</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Mono',monospace" }}>{event.address ?? `${event.latitude?.toFixed(4)}, ${event.longitude?.toFixed(4)}`}</p>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div style={{ background: 'linear-gradient(160deg,#141927,#0f1521)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Google Maps pin icon */}
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(96,200,240,0.12)', border: '1px solid rgba(96,200,240,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#60c8f0"/>
                <circle cx="12" cy="9" r="2.5" fill="#0a0d14"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#60c8f0', marginBottom: 1 }}>Get Directions</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono',monospace", maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {event.address ?? `${event.latitude?.toFixed(5)}, ${event.longitude?.toFixed(5)}`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(96,200,240,0.1)', border: '1px solid rgba(96,200,240,0.2)', borderRadius: 8, padding: '6px 12px' }}>
            {/* Google Maps G logo */}
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span style={{ fontSize: 10, color: '#60c8f0', fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>Maps →</span>
          </div>
        </div>
      </a>
    </div>
  );
}

/* ── Ticket Panel ────────────────────────────────────────────────────────── */
function TicketPanel({ ticketTypes, selectedTickets, handleTicketChange, totalPrice, handlePurchase, user, email, setEmail, purchasing, paymentState }: any) {
  const isFree = !ticketTypes || ticketTypes.length === 0;
  const allSoldOut = !isFree && ticketTypes.every((t: any) => (t.available ?? 0) === 0);

  if (isFree) {
    return (
      <div style={{ background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ padding: '24px 22px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>🎉</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399', fontFamily: "'DM Mono',monospace", letterSpacing: 2, textTransform: 'uppercase' }}>Free Entry</span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#34d399', fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>KSH 0</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 20 }}>This event is completely free. No payment required — just show up and enjoy.</p>
          {!user && (
            <Link to="/signin" style={{ display: 'block', background: '#34d399', color: '#0a0d14', borderRadius: 11, padding: '13px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans',sans-serif", marginBottom: 8 }}>Sign In to RSVP</Link>
          )}
          {user && (
            <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 12, color: 'rgba(52,211,153,0.8)', fontFamily: "'DM Mono',monospace" }}>📍 Save the date and show up!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(240,192,64,0.18)', borderRadius: 18, overflow: 'hidden' }}>
      <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>🎟 Get Tickets</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono', monospace" }}>Select type & quantity</p>
      </div>
      <div style={{ padding: '20px 22px' }}>
        {ticketTypes.map((ticket: any) => {
          const soldOut  = (ticket.available ?? 0) === 0;
          const lowStock = !soldOut && (ticket.available ?? 0) <= 5;
          const maxQty   = Math.min(10, ticket.available ?? 0);
          return (
            <div key={ticket.id} className="ticket-row" style={{ opacity: soldOut ? 0.5 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{ticket.type}</p>
                  <p style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: soldOut ? '#f87171' : lowStock ? '#fb923c' : 'rgba(255,255,255,0.3)' }}>
                    {soldOut ? 'Sold out' : `${ticket.available} left${lowStock ? ' — hurry!' : ''}`}
                  </p>
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: soldOut ? 'rgba(255,255,255,0.2)' : '#f0c040', fontFamily: "'DM Mono', monospace" }}>KSH {(ticket.price ?? 0).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>Qty</p>
                <select value={selectedTickets[ticket.id] || 0} onChange={e => handleTicketChange(ticket.id, parseInt(e.target.value))} disabled={soldOut || purchasing} className="qty-select">
                  {[...Array(maxQty + 1).keys()].map(num => <option key={num} value={num}>{num}</option>)}
                </select>
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 8, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {totalPrice > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>TOTAL</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#f0c040', fontFamily: "'DM Mono', monospace" }}>KSH {(totalPrice ?? 0).toLocaleString()}</p>
            </div>
          )}

          {totalPrice > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>Email Address</p>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. user@example.com" disabled={purchasing}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#fff', fontFamily: "'DM Mono', monospace", outline: 'none', boxSizing: 'border-box' }} />
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 5, fontFamily: "'DM Mono', monospace" }}>We'll send payment confirmation and digital tickets to this email</p>
            </div>
          )}

          {paymentState === 'waiting' && (
            <div style={{ marginBottom: 14, padding: '12px 14px', background: 'rgba(240,192,64,0.08)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(240,192,64,0.3)', borderTop: '2px solid #f0c040', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#f0c040', marginBottom: 2 }}>Processing Payment</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono', monospace" }}>Redirecting to Paystack...</p>
                </div>
              </div>
            </div>
          )}

          {paymentState === 'failed' && (
            <div style={{ marginBottom: 14, padding: '12px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
              <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>✕ Payment failed or cancelled</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontFamily: "'DM Mono', monospace" }}>Please try again</p>
            </div>
          )}

          <button onClick={handlePurchase} disabled={allSoldOut || totalPrice === 0 || purchasing || !email}
            style={{ width: '100%', background: allSoldOut ? 'rgba(255,255,255,0.04)' : (totalPrice === 0 || !email) ? 'rgba(255,255,255,0.06)' : purchasing ? 'rgba(240,192,64,0.6)' : '#f0c040', color: allSoldOut || totalPrice === 0 || !email ? 'rgba(255,255,255,0.25)' : '#0a0d14', border: 'none', borderRadius: 11, padding: '14px 24px', fontSize: 14, fontWeight: 700, cursor: (allSoldOut || totalPrice === 0 || purchasing || !email) ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}>
            {purchasing ? 'Processing…' : allSoldOut ? 'No Tickets Available' : totalPrice === 0 ? 'Select Tickets Above' : !email ? 'Enter Email Address' : 'Purchase Ticket'}
          </button>
          {totalPrice > 0 && email && !purchasing && !allSoldOut && (
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 8, fontFamily: "'DM Mono', monospace" }}>powered by Paystack</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileTicketPanel({ ticketTypes, selectedTickets, handleTicketChange, totalPrice, handlePurchase, user, email, setEmail, purchasing, paymentState }: any) {
  const [expanded, setExpanded] = useState(false);
  const isFree = !ticketTypes || ticketTypes.length === 0;
  const allSoldOut = !isFree && ticketTypes.every((t: any) => (t.available ?? 0) === 0);

  return (
    <div className="ticket-panel-mobile">
      <div className="mobile-panel-collapsed" onClick={() => setExpanded(e => !e)}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: 2, color: isFree ? 'rgba(52,211,153,0.6)' : 'rgba(240,192,64,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 3 }}>🎟 {isFree ? 'Free Event' : 'Get Tickets'}</p>
          {isFree
            ? <p style={{ fontSize: 16, fontWeight: 700, color: '#34d399', fontFamily: "'DM Mono', monospace" }}>Free Entry</p>
            : totalPrice > 0
              ? <p style={{ fontSize: 16, fontWeight: 700, color: '#f0c040', fontFamily: "'DM Mono', monospace" }}>KSH {totalPrice.toLocaleString()}</p>
              : <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono', monospace" }}>{allSoldOut ? 'Sold out' : 'Tap to select tickets'}</p>
          }
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isFree && totalPrice > 0 && email && !purchasing && (
            <button onClick={e => { e.stopPropagation(); handlePurchase(); }}
              style={{ background: '#f0c040', color: '#0a0d14', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Pay Now
            </button>
          )}
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block', lineHeight: 1 }}>⌃</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '0 16px 28px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <TicketPanel ticketTypes={ticketTypes} selectedTickets={selectedTickets} handleTicketChange={handleTicketChange} totalPrice={totalPrice} handlePurchase={handlePurchase} user={user} email={email} setEmail={setEmail} purchasing={purchasing} paymentState={paymentState} />
        </div>
      )}
    </div>
  );
}

/* ── Shareable Ticket Graphic ────────────────────────────────────────────── */
function ShareableTicket({ event, ticketType, userName }: { event: any; ticketType: string; userName: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 1080; canvas.height = 1080;
    const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
    bg.addColorStop(0, '#0a0d14'); bg.addColorStop(1, '#141927');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1080);
    ctx.beginPath(); ctx.arc(900, 180, 320, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240,192,64,0.04)'; ctx.fill();
    ctx.fillStyle = '#f0c040'; ctx.fillRect(80, 260, 6, 80);
    ctx.font = 'bold 36px serif'; ctx.fillStyle = '#f0c040'; ctx.fillText('✦ Eventify', 80, 120);
    ctx.font = 'bold 72px serif'; ctx.fillStyle = '#ffffff';
    const words = (event.title ?? '').split(' ');
    let line = '', lines: string[] = [], y = 300;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > 900 && line) { lines.push(line.trim()); line = word + ' '; } else line = test;
    }
    if (line) lines.push(line.trim());
    lines.slice(0, 3).forEach(l => { ctx.fillText(l, 80, y); y += 86; });
    const details = [
      event.startTime ? `📅 ${new Date(event.startTime).toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` : '',
      event.startTime ? `🕐 ${new Date(event.startTime).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}` : '',
      (event.venue ?? event.location) ? `📍 ${event.venue ?? event.location}` : '',
      ticketType ? `🎟 ${ticketType}` : '',
    ].filter(Boolean);
    ctx.font = '32px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.55)';
    let dy = y + 40;
    details.forEach(d => { ctx.fillText(d, 80, dy); dy += 48; });
    ctx.font = 'bold 28px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(`Reserved for ${userName}`, 80, 920);
    ctx.fillStyle = '#f0c040'; ctx.fillRect(80, 960, 920, 3);
    ctx.font = '22px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillText('Eventify.space', 80, 1010);
    if (event.imageUrl) {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload  = () => { ctx.globalAlpha = 0.18; ctx.drawImage(img, 600, 0, 480, 480); ctx.globalAlpha = 1; setReady(true); };
      img.onerror = () => setReady(true);
      img.src = event.imageUrl;
    } else { setReady(true); }
  }, [event, ticketType, userName]);

  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${event.title?.replace(/\s+/g, '-') ?? 'ticket'}-Eventify.png`;
    link.href = canvas.toDataURL('image/png'); link.click();
  };

  const shareWhatsapp = () => {
    const text = `I'm going to ${event.title}! 🎉\n${event.startTime ? new Date(event.startTime).toLocaleDateString() : ''}\n${event.venue ?? ''}\n\nGet tickets: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ marginTop: 32, background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(240,192,64,0.15)', borderRadius: 16, padding: '24px' }}>
      <p style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace", marginBottom: 14 }}>Share Your Ticket</p>
      <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 10, display: ready ? 'block' : 'none', marginBottom: 14 }} />
      {!ready && <div style={{ height: 200, background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Generating graphic…</span></div>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={download} style={{ background: '#f0c040', color: '#0a0d14', border: 'none', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>⬇ Download Graphic</button>
        <button onClick={shareWhatsapp} style={{ background: 'rgba(37,211,102,0.12)', color: '#25d366', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>WhatsApp</button>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string; slug?: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [purchaseSuccess, _setPurchaseSuccess] = useState(false);
  const [shareMeta, setShareMeta] = useState<any>(null);
  const [email, setEmail] = useState(user?.email ?? '');
  const [purchasing, setPurchasing] = useState(false);
  const [paymentState, setPaymentState] = useState<'idle' | 'waiting' | 'failed'>('idle');
  const [relatedEvents, setRelatedEvents] = useState<any[]>([]);
  const [lastPurchasedTicketType, _setLastPurchasedTicketType] = useState('');

  const canonicalUrl = event ? buildEventUrl(event.id, event.title) : (typeof window !== 'undefined' ? window.location.href : 'https://eventify.space');
  const eventTitle = event?.title || 'Event Details';
  const eventDescription = event?.description
    ? event.description.slice(0, 160)
    : 'Discover this event on Eventify. Browse tickets, schedule details, venue information and secure checkout for live experiences.';

  useSeo({
    title: event ? `${eventTitle} | Eventify` : 'Eventify Event Details',
    description: event ? `${event.description?.substring(0, 155) ?? eventDescription}` : eventDescription,
    keywords: event ? `event tickets,${event.category ?? 'events'},${eventTitle},buy tickets,live events` : 'event tickets,events,live tickets,book events',
    url: canonicalUrl,
    image: event?.imageUrl || undefined,
    type: 'event',
    jsonLd: event ? {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: eventTitle,
      description: eventDescription,
      startDate: event.startTime || event.date || undefined,
      endDate: event.endTime || undefined,
      url: canonicalUrl,
      eventStatus: event.status || 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: event.venue || event.location || 'Event venue',
        address: event.address || event.location || undefined,
      },
      image: event?.imageUrl ? [event.imageUrl] : undefined,
      organizer: {
        '@type': 'Organization',
        name: event.organizerName || (event.organizer?.name ?? 'Eventify'),
        url: 'https://eventify.space',
      },
      offers: event?.ticketTypes?.length ? {
        '@type': 'Offer',
        url: canonicalUrl,
        availability: 'https://schema.org/InStock',
        priceCurrency: 'KES',
        price: event.ticketTypes[0]?.price,
      } : undefined,
      performer: event.organizer ? { '@type': 'Organization', name: event.organizer.name || event.organizer } : undefined,
    } : undefined,
  });

  useEffect(() => {
    const load = async () => {
      if (id) {
        try {
          const e = await eventService.getEvent(id);
          setEvent(e);
          const meta = await eventService.getEventShareMeta(id);
          setShareMeta(meta?.data ?? meta ?? {
            title: e.title,
            url: buildEventUrl(id, e.title),
            description: e.description?.slice(0, 160),
            image: e.imageUrl,
          });
          eventService.incrementEventView(id).catch(() => {});
          eventService.getRelatedEvents(id).then(resp => setRelatedEvents(resp?.data ?? [])).catch(() => {});
        } catch (err) { console.error('Failed to load event', err); }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const ticketTypes = (event?.ticketTypes ?? []).map((tt: any) => ({
    id: tt.id, type: tt.name, price: tt.price, available: tt.quantity - tt.sold,
  }));

  const isFreeEvent = ticketTypes.length === 0;

  const handleTicketChange = (id: string, quantity: number) => {
    setSelectedTickets(prev => ({ ...prev, [id]: quantity }));
  };

  const totalPrice = Object.entries(selectedTickets).reduce((sum, [id, qty]) => {
    const t = ticketTypes.find((t: any) => t.id === id);
    return sum + (t ? t.price * qty : 0);
  }, 0);

  const handlePurchase = async () => {
    if (!event || !email) return;
    setPurchasing(true);
    setPaymentState('idle');
    try {
      // Collect all selected tickets with quantities
      const tickets = Object.entries(selectedTickets)
        .filter(([, qty]) => qty > 0)
        .map(([ticketTypeId, qty]) => ({ ticketTypeId, quantity: qty }));

      if (tickets.length === 0) {
        setPaymentState('failed');
        setPurchasing(false);
        return;
      }

      // Send all tickets in a single request to calculate correct total
      const result = await ticketService.purchaseMultipleTickets(event.id, tickets, email);
      setPaymentState('waiting');
      setSelectedTickets({});
      // Redirect to Paystack with correct total amount
      window.location.href = result.authorization_url;
    } catch (err: any) {
      console.error('Purchase failed', err);
      setPaymentState('failed');
      setPurchasing(false);
    }
  };

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; corner-shape: round; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes headerIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{sharedStyles}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 14, color: '#f0c040' }}>✦</div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', fontSize: 16 }}>Loading event…</p>
      </div>
    </div>
  );

  if (!event) return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{sharedStyles}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 14, color: 'rgba(255,255,255,0.2)' }}>✦</div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', fontSize: 16 }}>Event not found.</p>
        <Link to="/events" style={{ display: 'inline-block', marginTop: 20, fontSize: 12, color: '#f0c040', fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>← Back to Events</Link>
      </div>
    </div>
  );

  if (purchaseSuccess) return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{sharedStyles}</style>
      <div style={{ width: '100%', maxWidth: 440, background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: 20, padding: '48px 40px', textAlign: 'center', animation: 'fadeUp 0.5s ease forwards' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(126,217,154,0.12)', border: '1px solid rgba(126,217,154,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 20px' }}>✓</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Purchase Successful!</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Your tickets have been added to your account.</p>
        <ShareableTicket event={event} ticketType={lastPurchasedTicketType} userName={user?.firstName ?? 'You'} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
          <Link to="/account" style={{ background: '#f0c040', color: '#0a0d14', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>View My Tickets</Link>
          <Link to="/events" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 24px', fontWeight: 500, fontSize: 14, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>Browse More Events</Link>
        </div>
      </div>
    </div>
  );

  // Share links with real social logos
  const shareUrl = shareMeta?.url || (event ? buildEventUrl(event.id, event.title) : window.location.href);
  const shareLinks = shareMeta ? [
    {
      href: `https://wa.me/?text=${encodeURIComponent(shareMeta.title + ' ' + shareUrl)}`,
      label: 'WhatsApp',
      bg: 'rgba(37,211,102,0.12)',
      color: '#25d366',
      border: 'rgba(37,211,102,0.25)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.787 23.213l4.287-1.373A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.322 0-4.476-.703-6.272-1.904l-.449-.267-3.093.99.897-3.282-.292-.476A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      ),
    },
    {
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMeta.title)}&url=${encodeURIComponent(shareMeta.url)}`,
      label: 'Twitter / X',
      bg: 'rgba(0,0,0,0.3)',
      color: '#fff',
      border: 'rgba(255,255,255,0.15)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareMeta.url)}`,
      label: 'Facebook',
      bg: 'rgba(24,119,242,0.12)',
      color: '#1877f2',
      border: 'rgba(24,119,242,0.25)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877f2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      href: `https://www.instagram.com/`,
      label: 'Instagram',
      bg: 'rgba(225,48,108,0.12)',
      color: '#e1306c',
      border: 'rgba(225,48,108,0.25)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e1306c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="1" fill="#e1306c" stroke="none"/>
        </svg>
      ),
    },
  ] : [];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        ${sharedStyles}
        .ghost-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); border-radius: 8px; padding: 7px 16px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; transition: all 0.2s; display: inline-block; }
        .ghost-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .ticket-row { background: linear-gradient(160deg,#141927,#0f1521); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px 20px; margin-bottom: 12px; transition: border-color 0.25s; }
        .ticket-row:hover { border-color: rgba(240,192,64,0.25); }
        .qty-select { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 7px 12px; font-size: 13px; color: #fff; font-family: 'DM Mono', monospace; outline: none; cursor: pointer; transition: border-color 0.2s; }
        .qty-select:focus { border-color: rgba(240,192,64,0.5); }
        .qty-select option { background: #141927; }
        .share-btn { display: inline-flex; align-items: center; gap: 8px; border-radius: 10px; padding: 10px 16px; font-size: 12px; font-weight: 600; text-decoration: none; font-family: 'DM Mono', monospace; letter-spacing: 0.3px; transition: opacity 0.2s, transform 0.15s; border-width: 1px; border-style: solid; cursor: pointer; }
        .share-btn:hover { opacity: 0.82; transform: translateY(-2px); }
        .ticket-panel-desktop { display: block; }
        .ticket-panel-mobile { display: none; }
        @media (max-width: 768px) {
          .event-body-grid { grid-template-columns: 1fr !important; }
          .ticket-panel-desktop { display: none !important; }
          .ticket-panel-mobile { display: block; position: fixed; bottom: 0; left: 0; right: 0; z-index: 200; background: rgba(10,13,20,0.98); border-top: 1px solid rgba(240,192,64,0.18); backdrop-filter: blur(16px); max-height: 85vh; overflow-y: auto; }
          .mobile-panel-collapsed { padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
          .hero-banner { height: 260px !important; }
          .event-body-padding { padding: 28px 16px 180px !important; }
        }
      `}</style>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,13,20,0.96)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100, animation: 'headerIn 0.4s ease forwards' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontSize: 17, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display', serif", letterSpacing: -0.3, textDecoration: 'none' }}>✦ Eventify</Link>
          <Link to="/events" className="ghost-btn">← Back</Link>
        </div>
      </header>

      {/* Hero */}
      <div className="hero-banner" style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        <img src={event?.imageUrl ?? ''} alt={event?.title ?? 'Event'} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,13,20,0.2) 0%, rgba(10,13,20,0.85) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxWidth: 1060, margin: '0 auto', padding: '0 16px 28px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {event.category && (
              <div style={{ background: '#f0c040', color: '#0a0d14', padding: '4px 12px', borderRadius: 6, fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>{event.category}</div>
            )}
            {isFreeEvent && (
              <div style={{ background: 'rgba(52,211,153,0.2)', color: '#34d399', padding: '4px 12px', borderRadius: 6, fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", border: '1px solid rgba(52,211,153,0.35)' }}>🎉 Free Entry</div>
            )}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 5vw, 48px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{event.title}</h1>
        </div>
      </div>

      {/* Body */}
      <div className="event-body-padding" style={{ maxWidth: 1060, margin: '0 auto', padding: '48px 24px 100px' }}>
        <div className="event-body-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48, alignItems: 'start' }}>

          {/* Left */}
          <div style={{ animation: 'fadeUp 0.5s ease 0.05s both', minWidth: 0 }}>
            {/* Meta info */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { icon: '🗓', label: 'Starts', value: event.startTime ? new Date(event.startTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD' },
                { icon: '🏁', label: 'Ends', value: event.endTime ? new Date(event.endTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD' },
                { icon: '📍', label: 'Venue', value: event.venue ?? event.location ?? '—' },
              ].map(m => (
                <div key={m.label}>
                  <p style={{ fontSize: 9, letterSpacing: 2.5, color: 'rgba(240,192,64,0.55)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 5 }}>{m.icon} {m.label}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Mono', monospace" }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Map Directions Card */}
            <MapDirectionsCard event={event} />

            {/* About */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 3, height: 24, background: '#f0c040', borderRadius: 2, flexShrink: 0 }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>About This Event</h2>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, letterSpacing: 0.15 }}>{event.description}</p>

              {/* Organizer */}
              {(event.organizer?.organizerProfile?.organizationName || event.organizer?.firstName) && (
                <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#f0c040,#c8920a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#0a0d14', flexShrink: 0 }}>
                    {(event.organizer?.organizerProfile?.organizationName ?? event.organizer?.firstName ?? '?')[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace", marginBottom: 3 }}>Organized by</p>
                    <Link to={`/host/${event.organizer?.id}`} style={{ fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f0c040')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
                    >
                      {event.organizer?.organizerProfile?.organizationName ?? `${event.organizer?.firstName} ${event.organizer?.lastName}`} →
                    </Link>
                    {event.organizer?.organizerProfile?.bio && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3, lineHeight: 1.5 }}>{event.organizer.organizerProfile.bio}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Share */}
            {shareMeta && (
              <div style={{ marginBottom: 40 }}>
                <p style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>Share this event</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {shareLinks.map(link => (
                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="share-btn"
                      style={{ background: link.bg, color: link.color, borderColor: link.border }}>
                      {link.icon}
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <ReviewsSection eventId={event.id} user={user} />
          </div>

          {/* Right — desktop only */}
          <div className="ticket-panel-desktop" style={{ position: 'sticky', top: 76, animation: 'fadeUp 0.5s ease 0.12s both' }}>
            <TicketPanel ticketTypes={ticketTypes} selectedTickets={selectedTickets} handleTicketChange={handleTicketChange} totalPrice={totalPrice} handlePurchase={handlePurchase} user={user} email={email} setEmail={setEmail} purchasing={purchasing} paymentState={paymentState} />
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div style={{ marginTop: 64, paddingTop: 48, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <div style={{ width: 3, height: 24, background: '#f0c040', borderRadius: 2, flexShrink: 0 }} />
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>You Might Also Like</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
              {relatedEvents.map((ev: any) => {
                const firstPrice = ev.ticketTypes?.[0]?.price;
                const isEvFree = !ev.ticketTypes || ev.ticketTypes.length === 0;
                const totalCap  = ev.ticketTypes?.reduce((s: number, t: any) => s + (t.quantity ?? 0), 0) ?? 0;
                const totalSold = ev.ticketTypes?.reduce((s: number, t: any) => s + (t.sold ?? 0), 0) ?? 0;
                const remaining = totalCap - totalSold;
                const isLowStock = totalCap > 0 && remaining > 0 && remaining <= 10;
                const eventStart = ev.startTime ?? ev.date;
                return (
                  <Link key={ev.id} to={`/events/${ev.id}`} style={{ textDecoration: 'none', display: 'block', background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.3s,transform 0.3s', color: '#fff' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,192,64,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ height: 140, overflow: 'hidden', position: 'relative' }}>
                      {ev.imageUrl
                        ? <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)' }} />
                        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a2540,#0d1523)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 28, opacity: 0.2 }}>✦</span></div>
                      }
                      {ev.category && <span style={{ position: 'absolute', top: 10, left: 10, background: '#f0c040', color: '#0a0d14', padding: '2px 8px', borderRadius: 4, fontSize: 8, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono',monospace" }}>{ev.category}</span>}
                      {isLowStock && <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '2px 8px', borderRadius: 20, fontSize: 8, fontWeight: 800, letterSpacing: 1, fontFamily: "'DM Mono',monospace" }}>⚡ {remaining} left</span>}
                      {isEvFree && <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '2px 8px', borderRadius: 20, fontSize: 8, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>FREE</span>}
                    </div>
                    <div style={{ padding: '14px 16px 18px' }}>
                      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{ev.title}</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono',monospace", marginBottom: 10 }}>
                        🗓 {eventStart ? new Date(eventStart).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                      </p>
                      {isEvFree
                        ? <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399', fontFamily: "'DM Mono',monospace" }}>Free</p>
                        : firstPrice != null && <p style={{ fontSize: 14, fontWeight: 700, color: '#f0c040', fontFamily: "'DM Mono',monospace" }}>KSH {firstPrice.toLocaleString()}</p>
                      }
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom drawer */}
      <MobileTicketPanel ticketTypes={ticketTypes} selectedTickets={selectedTickets} handleTicketChange={handleTicketChange} totalPrice={totalPrice} handlePurchase={handlePurchase} user={user} email={email} setEmail={setEmail} purchasing={purchasing} paymentState={paymentState} />
    </div>
  );
};

export default EventDetailsPage;
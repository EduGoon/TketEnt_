import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';
import * as ticketService from '../services/ticketService';
import * as eventService from '../services/historyService';
 
/* ── Reviews Section ────────────────────────────────────────────────────── */
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
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };
 
  useEffect(() => { fetchReviews(); }, [eventId]);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await eventService.createReview({ eventId, rating, comment });
      setRating(0);
      setComment('');
      await fetchReviews();
    } catch (err) {
      setError('Failed to submit review');
    }
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
                  {[1,2,3,4,5].map(s => (<span key={s} style={{ color: s <= r.rating ? '#f0c040' : 'rgba(255,255,255,0.15)', fontSize: 14 }}>★</span>))}
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
                <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: 26, color: star <= (hoverRating || rating) ? '#f0c040' : 'rgba(255,255,255,0.15)', transition: 'color 0.15s, transform 0.15s', transform: star <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)' }}>★</button>
              ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience…" required
              style={{ width: '100%', minHeight: 90, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#fff', fontFamily: "'DM Sans', sans-serif", resize: 'vertical', outline: 'none', marginBottom: 14, lineHeight: 1.6, transition: 'border-color 0.2s' }}
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
 
/* ── Shared Ticket Panel ─────────────────────────────────────────────────── */
function TicketPanel({ ticketTypes, selectedTickets, handleTicketChange, totalPrice, handlePurchase, user, phoneNumber, setPhoneNumber, purchasing, paymentState }: any) {
  const allSoldOut = ticketTypes.every((t: any) => (t.available ?? 0) === 0);

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
                  {[...Array(maxQty + 1).keys()].map(num => (<option key={num} value={num}>{num}</option>))}
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

          {/* Phone number input */}
          {user && totalPrice > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>M-Pesa Number</p>
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0712345678"
                disabled={purchasing}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#fff', fontFamily: "'DM Mono', monospace", outline: 'none', boxSizing: 'border-box' as const }}
              />
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 5, fontFamily: "'DM Mono', monospace" }}>
                You'll receive an M-Pesa prompt on this number
              </p>
            </div>
          )}

          {/* Payment state feedback */}
          {paymentState === 'waiting' && (
            <div style={{ marginBottom: 14, padding: '12px 14px', background: 'rgba(240,192,64,0.08)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(240,192,64,0.3)', borderTop: '2px solid #f0c040', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#f0c040', marginBottom: 2 }}>Check your phone</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono', monospace" }}>Enter your M-Pesa PIN to complete payment</p>
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

          <button
            onClick={handlePurchase}
            disabled={!user || allSoldOut || totalPrice === 0 || purchasing || !phoneNumber}
            style={{
              width: '100%',
              background: allSoldOut ? 'rgba(255,255,255,0.04)' : (!user || totalPrice === 0 || !phoneNumber) ? 'rgba(255,255,255,0.06)' : purchasing ? 'rgba(240,192,64,0.6)' : '#f0c040',
              color: allSoldOut || !user || totalPrice === 0 || !phoneNumber ? 'rgba(255,255,255,0.25)' : '#0a0d14',
              border: 'none', borderRadius: 11, padding: '14px 24px',
              fontSize: 14, fontWeight: 700,
              cursor: (!user || allSoldOut || totalPrice === 0 || purchasing || !phoneNumber) ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}
          >
            {purchasing ? 'Processing…' : allSoldOut ? 'No Tickets Available' : !user ? 'Sign In to Buy' : totalPrice === 0 ? 'Select Tickets Above' : !phoneNumber ? 'Enter M-Pesa Number' : 'Pay with M-Pesa'}
          </button>
          {!user && !allSoldOut && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', textAlign: 'center', marginTop: 10, fontFamily: "'DM Mono', monospace" }}>Sign in to complete your purchase</p>
          )}
        </div>
      </div>
    </div>
  );
}
 
function MobileTicketPanel({ ticketTypes, selectedTickets, handleTicketChange, totalPrice, handlePurchase, user, phoneNumber, setPhoneNumber, purchasing, paymentState }: any) {
  const [expanded, setExpanded] = useState(false);
  const allSoldOut = ticketTypes.every((t: any) => (t.available ?? 0) === 0);

  return (
    <div className="ticket-panel-mobile">
      <div className="mobile-panel-collapsed" onClick={() => setExpanded(e => !e)}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 3 }}>🎟 Get Tickets</p>
          {totalPrice > 0
            ? <p style={{ fontSize: 16, fontWeight: 700, color: '#f0c040', fontFamily: "'DM Mono', monospace" }}>KSH {totalPrice.toLocaleString()}</p>
            : <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono', monospace" }}>{allSoldOut ? 'Sold out' : 'Tap to select tickets'}</p>
          }
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {totalPrice > 0 && phoneNumber && !purchasing && (
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
<TicketPanel ticketTypes={ticketTypes} selectedTickets={selectedTickets} handleTicketChange={handleTicketChange} totalPrice={totalPrice} handlePurchase={handlePurchase} user={user} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} purchasing={purchasing} paymentState={paymentState} />        </div>
      )}
    </div>
  );
}
 
/* ── Main Page ──────────────────────────────────────────────────────────── */
const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
 const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [shareMeta, setShareMeta] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone ?? '');
  const [purchasing, setPurchasing] = useState(false);
  const [paymentState, setPaymentState] = useState<'idle' | 'waiting' | 'failed'>('idle');
  const [_checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
 
  useEffect(() => {
    const load = async () => {
      if (id) {
        try {
          const e = await eventService.getEvent(id);
          setEvent(e);
          const meta = await eventService.getEventShareMeta(id);
          setShareMeta(meta?.data ?? meta);
        } catch (err) { console.error('Failed to load event', err); }
      }
      setLoading(false);
    };
    load();
  }, [id]);
 
  const ticketTypes = (event?.ticketTypes ?? []).map((tt: any) => ({
    id: tt.id, type: tt.name, price: tt.price, available: tt.quantity - tt.sold,
  }));
 
  const handleTicketChange = (id: string, quantity: number) => {
    setSelectedTickets(prev => ({ ...prev, [id]: quantity }));
  };
 
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [id, qty]) => {
    const t = ticketTypes.find((t: any) => t.id === id);
    return sum + (t ? t.price * qty : 0);
  }, 0);
 
 const handlePurchase = async () => {
    if (!user || !event || !phoneNumber) return;
    setPurchasing(true);
    setPaymentState('idle');

    try {
      // Initiate STK push
      const results = await Promise.all(
        Object.entries(selectedTickets)
          .filter(([, qty]) => qty > 0)
          .map(([ticketTypeId, qty]) =>
            ticketService.purchaseTickets(event.id, ticketTypeId, qty, phoneNumber)
          )
      );

      const firstResult = results[0];
      setCheckoutRequestId(firstResult.checkoutRequestId);
      setPaymentState('waiting');
      setSelectedTickets({});

      // Poll every 3 seconds for up to 2 minutes
      let attempts = 0;
      const maxAttempts = 40;

      const poll = async () => {
        attempts++;
        try {
          const status = await ticketService.pollPaymentStatus(firstResult.checkoutRequestId);
          if (status.status === 'COMPLETED') {
            setPurchaseSuccess(true);
            setPaymentState('idle');
            setPurchasing(false);
            return;
          }
          if (status.status === 'FAILED') {
            setPaymentState('failed');
            setPurchasing(false);
            return;
          }
          // Still pending
          if (attempts < maxAttempts) {
            setTimeout(poll, 3000);
          } else {
            // Timeout — tell user to check their account
            setPaymentState('failed');
            setPurchasing(false);
          }
        } catch {
          if (attempts < maxAttempts) setTimeout(poll, 3000);
          else { setPaymentState('failed'); setPurchasing(false); }
        }
      };

      setTimeout(poll, 3000);

    } catch (err: any) {
      console.error('Purchase failed', err);
      setPaymentState('failed');
      setPurchasing(false);
    }
  };
 
  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
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
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>Your tickets have been added to your account.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link to="/account" style={{ background: '#f0c040', color: '#0a0d14', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>View My Tickets</Link>
          <Link to="/events" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 24px', fontWeight: 500, fontSize: 14, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>Browse More Events</Link>
        </div>
      </div>
    </div>
  );
 
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
        .share-link { display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 600; text-decoration: none; font-family: 'DM Mono', monospace; letter-spacing: 0.5px; transition: opacity 0.2s, transform 0.15s; }
        .share-link:hover { opacity: 0.82; transform: translateY(-1px); }
 
        .ticket-panel-desktop { display: block; }
        .ticket-panel-mobile { display: none; }
 
        @media (max-width: 768px) {
          .event-body-grid { grid-template-columns: 1fr !important; }
          .ticket-panel-desktop { display: none !important; }
          .ticket-panel-mobile {
            display: block;
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
            background: rgba(10,13,20,0.98);
            border-top: 1px solid rgba(240,192,64,0.18);
            backdrop-filter: blur(16px);
            max-height: 85vh; overflow-y: auto;
          }
          .mobile-panel-collapsed { padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
          .hero-banner { height: 260px !important; }
          .event-body-padding { padding: 28px 16px 180px !important; }
        }
      `}</style>
 
      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,13,20,0.96)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100, animation: 'headerIn 0.4s ease forwards' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display', serif", letterSpacing: -0.3 }}>✦ Venue</span>
          <Link to="/events" className="ghost-btn">← Back</Link>
        </div>
      </header>
 
      {/* Hero */}
      <div className="hero-banner" style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        <img src={event?.imageUrl ?? ''} alt={event?.title ?? 'Event'} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,13,20,0.2) 0%, rgba(10,13,20,0.85) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxWidth: 1060, margin: '0 auto', padding: '0 16px 28px' }}>
          {event.category && (
            <div style={{ display: 'inline-block', background: '#f0c040', color: '#0a0d14', padding: '4px 12px', borderRadius: 6, marginBottom: 12, fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>{event.category}</div>
          )}
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 5vw, 48px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{event.title}</h1>
        </div>
      </div>
 
      {/* Body */}
      <div className="event-body-padding" style={{ maxWidth: 1060, margin: '0 auto', padding: '48px 24px 100px' }}>
        <div className="event-body-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48, alignItems: 'start' }}>
 
          {/* Left */}
          <div style={{ animation: 'fadeUp 0.5s ease 0.05s both', minWidth: 0 }}>
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
 
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 3, height: 24, background: '#f0c040', borderRadius: 2, flexShrink: 0 }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>About This Event</h2>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, letterSpacing: 0.15 }}>{event.description}</p>
              {(event.organizer?.organizerProfile?.organizationName || event.organizer?.firstName) && (
  <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#f0c040,#c8920a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#0a0d14', flexShrink: 0 }}>
      {(event.organizer?.organizerProfile?.organizationName ?? event.organizer?.firstName ?? '?')[0]}
    </div>
    <div>
      <p style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace", marginBottom: 3 }}>Organized by</p>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
        {event.organizer?.organizerProfile?.organizationName ?? `${event.organizer?.firstName} ${event.organizer?.lastName}`}
      </p>
      {event.organizer?.organizerProfile?.bio && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3, lineHeight: 1.5 }}>{event.organizer.organizerProfile.bio}</p>
      )}
    </div>
  </div>
)}
            </div>
 
            {shareMeta && (
              <div style={{ marginBottom: 40 }}>
                <p style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>Share this event</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareMeta.title + ' ' + shareMeta.url)}`} target="_blank" rel="noopener noreferrer" className="share-link" style={{ background: 'rgba(37,211,102,0.15)', color: '#25d366', border: '1px solid rgba(37,211,102,0.25)' }}>WhatsApp</a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMeta.title)}&url=${encodeURIComponent(shareMeta.url)}`} target="_blank" rel="noopener noreferrer" className="share-link" style={{ background: 'rgba(29,161,242,0.12)', color: '#1da1f2', border: '1px solid rgba(29,161,242,0.25)' }}>Twitter / X</a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareMeta.url)}`} target="_blank" rel="noopener noreferrer" className="share-link" style={{ background: 'rgba(24,119,242,0.12)', color: '#1877f2', border: '1px solid rgba(24,119,242,0.25)' }}>Facebook</a>
                </div>
              </div>
            )}
 
            <ReviewsSection eventId={event.id} user={user} />
          </div>
 
          {/* Right — desktop only */}
          <div className="ticket-panel-desktop" style={{ position: 'sticky', top: 76, animation: 'fadeUp 0.5s ease 0.12s both' }}>
<TicketPanel ticketTypes={ticketTypes} selectedTickets={selectedTickets} handleTicketChange={handleTicketChange} totalPrice={totalPrice} handlePurchase={handlePurchase} user={user} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} purchasing={purchasing} paymentState={paymentState} />          </div>
        </div>
      </div>
 
      {/* Mobile bottom drawer */}
<MobileTicketPanel ticketTypes={ticketTypes} selectedTickets={selectedTickets} handleTicketChange={handleTicketChange} totalPrice={totalPrice} handlePurchase={handlePurchase} user={user} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} purchasing={purchasing} paymentState={paymentState} />    </div>
  );
};
 
export default EventDetailsPage;
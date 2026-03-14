import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';
import * as organizerService from '../services/organizerService';
import { Event, Payout, OrganizerProfile } from '../utilities/types';

// ── Tab types ─────────────────────────────────────────────────
type Tab = 'events' | 'checkin' | 'payouts' | 'profile';

// ── Shared styles ─────────────────────────────────────────────
const S = {
  page:    { minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" } as React.CSSProperties,
  card:    { background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 } as React.CSSProperties,
  label:   { fontSize: 9, letterSpacing: 3, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase' as const, fontFamily: "'DM Mono',monospace", marginBottom: 6, display: 'block' },
  input:   { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff', fontFamily: "'DM Sans',sans-serif", outline: 'none', width: '100%' } as React.CSSProperties,
  btn:     { background: '#f0c040', color: '#0a0d14', border: 'none', borderRadius: 9, padding: '11px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'opacity 0.2s' } as React.CSSProperties,
  ghost:   { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '11px 24px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" } as React.CSSProperties,
  danger:  { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 9, padding: '11px 24px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" } as React.CSSProperties,
};

// ── Event Form ────────────────────────────────────────────────
function EventForm({ initial, onSave, onCancel, saving }: {
  initial?: Partial<Event>;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    date: initial?.date ? initial.date.substring(0, 10) : '',
    startTime: initial?.startTime ? initial.startTime.substring(11, 16) : '',
    endTime: initial?.endTime ? initial.endTime.substring(11, 16) : '',
    venue: initial?.venue ?? '',
    location: initial?.location ?? '',
    category: initial?.category ?? '',
    status: initial?.status ?? 'DRAFT',
    imageUrl: initial?.imageUrl ?? '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl ?? '');
  const [tickets, setTickets] = useState<any[]>(
    initial?.ticketTypes?.length
      ? initial.ticketTypes.map(t => ({ name: t.name, price: t.price, quantity: t.quantity }))
      : [{ name: '', price: 0, quantity: 0 }]
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload: any = { ...form, ticketTypes: tickets };
    if (form.date) {
      payload.startTime = form.startTime ? new Date(`${form.date}T${form.startTime}`).toISOString() : undefined;
      payload.endTime   = form.endTime   ? new Date(`${form.date}T${form.endTime}`).toISOString()   : undefined;
      payload.date      = new Date(form.date).toISOString();
    }
    if (imageFile) {
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload  = () => res((reader.result as string).split(',')[1]);
        reader.onerror = () => rej(new Error('Read failed'));
      });
      payload.imageBase64 = base64;
      payload.imageName   = imageFile.name;
      delete payload.imageUrl;
    }
    onSave(payload);
  };

  const inputStyle = { ...S.input, marginBottom: 0 };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div><label style={S.label}>Title *</label><input style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
        <div><label style={S.label}>Category</label>
          <select style={{ ...inputStyle, background: '#141927' }} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
            <option value="">Select</option>
            {['Music','Art','Technology','Sports','Food','Comedy','Fashion','Business','Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1/-1' }}><label style={S.label}>Description</label><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' } as any} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
        <div><label style={S.label}>Date *</label><input type="date" style={inputStyle} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required /></div>
        <div><label style={S.label}>Start Time</label><input type="time" style={inputStyle} value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} /></div>
        <div><label style={S.label}>End Time</label><input type="time" style={inputStyle} value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} /></div>
        <div><label style={S.label}>Venue</label><input style={inputStyle} value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} /></div>
        <div><label style={S.label}>Location</label><input style={inputStyle} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
        <div>
          <label style={S.label}>Status</label>
          <select style={{ ...inputStyle, background: '#141927' }} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Image */}
      <div>
        <label style={S.label}>Event Image</label>
        {imagePreview && <img src={imagePreview} alt="preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 10, filter: 'brightness(0.8)' }} />}
        <input type="file" accept="image/*" onChange={handleFile} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }} />
        <div style={{ marginTop: 8 }}><label style={{ ...S.label, marginBottom: 4 }}>Or Image URL</label><input style={inputStyle} value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} disabled={!!imageFile} placeholder="https://..." /></div>
      </div>

      {/* Ticket types */}
      <div>
        <label style={S.label}>Ticket Types</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tickets.map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 36px', gap: 8, alignItems: 'center' }}>
              <input style={inputStyle} placeholder="Name (e.g. General)" value={t.name} onChange={e => setTickets(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
              <input type="number" style={inputStyle} placeholder="Price" value={t.price || ''} onChange={e => setTickets(prev => prev.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))} />
              <input type="number" style={inputStyle} placeholder="Qty" value={t.quantity || ''} onChange={e => setTickets(prev => prev.map((x, j) => j === i ? { ...x, quantity: Number(e.target.value) } : x))} />
              <button type="button" onClick={() => setTickets(prev => prev.filter((_, j) => j !== i))} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: 6, height: 36, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          ))}
          <button type="button" onClick={() => setTickets(prev => [...prev, { name: '', price: 0, quantity: 0 }])} style={{ ...S.ghost, padding: '8px 16px', fontSize: 12, width: 'fit-content' }}>+ Add Ticket Type</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="submit" style={S.btn} disabled={saving}>{saving ? 'Saving…' : initial?.id ? 'Update Event' : 'Create Event'}</button>
        <button type="button" style={S.ghost} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// ── Events Tab ────────────────────────────────────────────────
function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const resp = await organizerService.getOrganizerEvents();
      setEvents((resp?.data ?? resp) || []);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      if (editing) {
        await organizerService.updateOrganizerEvent(editing.id, data);
        showToast('Event updated');
      } else {
        await organizerService.createOrganizerEvent(data);
        showToast('Event created');
      }
      setShowForm(false); setEditing(null);
      loadEvents();
    } catch { showToast('Failed to save event'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await organizerService.deleteOrganizerEvent(id);
      showToast('Event deleted');
      loadEvents();
    } catch { showToast('Failed to delete'); }
  };

  const STATUS_COLOR: any = { PUBLISHED: '#22c55e', DRAFT: '#f0c040', CANCELLED: '#ef4444' };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 999, background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700 }}>My Events</h2>
        <button style={S.btn} onClick={() => { setEditing(null); setShowForm(true); }}>+ New Event</button>
      </div>

      {showForm && (
        <div style={{ ...S.card, marginBottom: 28 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 24 }}>{editing ? 'Edit Event' : 'Create New Event'}</h3>
          <EventForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} saving={saving} />
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 80, background: 'linear-gradient(160deg,#141927,#0f1521)', borderRadius: 14, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : events.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '60px 32px' }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>No events yet. Create your first event above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {events.map(ev => (
            <div key={ev.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
              {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0, filter: 'brightness(0.8)' }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono',monospace" }}>
                  {ev.startTime ? new Date(ev.startTime).toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                  {ev.venue ? ` · ${ev.venue}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 9, letterSpacing: 1.5, color: STATUS_COLOR[ev.status] ?? '#fff', background: `${STATUS_COLOR[ev.status]}18`, border: `1px solid ${STATUS_COLOR[ev.status]}44`, borderRadius: 20, padding: '3px 10px', fontFamily: "'DM Mono',monospace", textTransform: 'uppercase' }}>{ev.status}</span>
                <button style={{ ...S.ghost, padding: '7px 14px', fontSize: 12 }} onClick={() => { setEditing(ev); setShowForm(true); }}>Edit</button>
                <button style={{ ...S.danger, padding: '7px 14px', fontSize: 12 }} onClick={() => handleDelete(ev.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Check-in Tab ──────────────────────────────────────────────
function CheckInTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [ticketId, setTicketId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; attendee?: any } | null>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [loadingCheckIns, setLoadingCheckIns] = useState(false);

  useEffect(() => {
    organizerService.getOrganizerEvents()
      .then(resp => setEvents((resp?.data ?? resp) || []))
      .catch(() => setEvents([]));
  }, []);

  const loadCheckIns = async (eventId: string) => {
    setLoadingCheckIns(true);
    try {
      const resp = await organizerService.getEventCheckIns(eventId);
      setCheckIns(resp?.data ?? []);
    } catch { setCheckIns([]); }
    finally { setLoadingCheckIns(false); }
  };

  const handleSelectEvent = (ev: Event) => {
    setSelectedEvent(ev);
    setResult(null);
    setTicketId('');
    loadCheckIns(ev.id);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !ticketId.trim()) return;
    setScanning(true);
    setResult(null);
    try {
      const resp = await organizerService.scanTicket(ticketId.trim(), selectedEvent.id);
      setResult({ success: true, message: resp.message, attendee: resp.data });
      setTicketId('');
      loadCheckIns(selectedEvent.id);
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Check-in failed' });
    } finally { setScanning(false); }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Check-In</h2>

      {/* Event selector */}
      <div style={{ ...S.card, marginBottom: 24 }}>
        <label style={S.label}>Select Event</label>
        <select
          style={{ ...S.input, background: '#0f1521' }}
          value={selectedEvent?.id ?? ''}
          onChange={e => {
            const ev = events.find(x => x.id === e.target.value);
            if (ev) handleSelectEvent(ev);
          }}
        >
          <option value="">— Choose an event —</option>
          {events.filter(ev => ev.status === 'PUBLISHED').map(ev => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <>
          {/* Scanner */}
          <div style={{ ...S.card, marginBottom: 24 }}>
            <p style={{ ...S.label, marginBottom: 16 }}>Scan Ticket ID</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 16, lineHeight: 1.6 }}>
              Paste or type the ticket ID from the attendee's QR code. You can use a QR scanner app to copy the ID, then paste it here.
            </p>
            <form onSubmit={handleScan} style={{ display: 'flex', gap: 10 }}>
              <input
                style={{ ...S.input, flex: 1 }}
                value={ticketId}
                onChange={e => setTicketId(e.target.value)}
                placeholder="Paste ticket ID here…"
                autoFocus
              />
              <button type="submit" style={S.btn} disabled={scanning || !ticketId.trim()}>
                {scanning ? 'Checking…' : 'Check In'}
              </button>
            </form>

            {result && (
              <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 10, background: result.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${result.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: result.success ? '#22c55e' : '#ef4444', marginBottom: result.attendee ? 8 : 0 }}>
                  {result.success ? '✓' : '✕'} {result.message}
                </p>
                {result.attendee && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>👤 {result.attendee.attendee?.firstName} {result.attendee.attendee?.lastName}</span>
                    <span>🎟 {result.attendee.ticketType}</span>
                    <span>🕐 {new Date(result.attendee.checkedInAt).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Check-in log */}
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ ...S.label, marginBottom: 0 }}>Checked In — {checkIns.length} attendees</p>
              <button style={{ ...S.ghost, padding: '6px 12px', fontSize: 11 }} onClick={() => loadCheckIns(selectedEvent.id)}>↻ Refresh</button>
            </div>
            {loadingCheckIns ? (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px 0' }}>Loading…</p>
            ) : checkIns.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>No check-ins yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {checkIns.map((ci: any) => (
                  <div key={ci.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: 12 }}>
                    <div>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{ci.ticket?.user?.firstName} {ci.ticket?.user?.lastName}</span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 10 }}>{ci.ticket?.ticketTypeName}</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono',monospace" }}>
                      {new Date(ci.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Payouts Tab ───────────────────────────────────────────────
function PayoutsTab() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([
      organizerService.getOrganizerPayouts(),
      organizerService.getOrganizerEvents(),
    ]).then(([p, e]) => {
      setPayouts(p?.data ?? []);
      setEvents((e?.data ?? e) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleRequest = async () => {
    if (!selectedEventId) return;
    setRequesting(true);
    try {
      await organizerService.requestPayout(selectedEventId);
      showToast('Payout requested successfully');
      const resp = await organizerService.getOrganizerPayouts();
      setPayouts(resp?.data ?? []);
      setSelectedEventId('');
    } catch (err: any) {
      showToast(err.message || 'Failed to request payout');
    } finally { setRequesting(false); }
  };

  const STATUS_COLOR: any = { PENDING: '#f0c040', RELEASED: '#22c55e', REJECTED: '#ef4444' };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 999, background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13 }}>{toast}</div>}

      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Payouts</h2>

      {/* Request payout */}
      <div style={{ ...S.card, marginBottom: 28 }}>
        <p style={S.label}>Request Payout</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 16, lineHeight: 1.6 }}>
          Select a completed event to request a payout. Platform fee of 5% applies. Payouts are reviewed and released by admin.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select style={{ ...S.input, flex: 1, background: '#0f1521', minWidth: 200 }} value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
            <option value="">— Select event —</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
          <button style={S.btn} onClick={handleRequest} disabled={requesting || !selectedEventId}>
            {requesting ? 'Requesting…' : 'Request Payout'}
          </button>
        </div>
      </div>

      {/* Payout history */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2].map(i => <div key={i} style={{ height: 70, background: 'linear-gradient(160deg,#141927,#0f1521)', borderRadius: 14, opacity: 0.6 }} />)}
        </div>
      ) : payouts.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '48px 32px' }}>
          <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No payout requests yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {payouts.map(p => (
            <div key={p.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{p.event?.title ?? 'Event'}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono',monospace" }}>
                  Requested {new Date(p.requestedAt).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {p.releasedAt ? ` · Released ${new Date(p.releasedAt).toLocaleDateString()}` : ''}
                </p>
                {p.adminNote && <p style={{ fontSize: 11, color: 'rgba(239,68,68,0.7)', marginTop: 4 }}>Note: {p.adminNote}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: STATUS_COLOR[p.status], fontFamily: "'DM Mono',monospace" }}>
                  KSH {p.netAmount.toLocaleString()}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono',monospace" }}>
                  Gross KSH {p.grossAmount.toLocaleString()} · Fee KSH {p.platformFee.toLocaleString()}
                </p>
                <span style={{ fontSize: 9, letterSpacing: 1.5, color: STATUS_COLOR[p.status], background: `${STATUS_COLOR[p.status]}18`, border: `1px solid ${STATUS_COLOR[p.status]}44`, borderRadius: 20, padding: '2px 10px', fontFamily: "'DM Mono',monospace", textTransform: 'uppercase', display: 'inline-block', marginTop: 4 }}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────
function ProfileTab() {
  const [_profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [form, setForm] = useState({ organizationName: '', bio: '', mpesaPhone: '', paybillNumber: '', accountNumber: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    organizerService.getOrganizerProfile()
      .then(resp => {
        const p = resp?.data ?? resp;
        setProfile(p);
        setForm({ organizationName: p.organizationName ?? '', bio: p.bio ?? '', mpesaPhone: p.mpesaPhone ?? '', paybillNumber: p.paybillNumber ?? '', accountNumber: p.accountNumber ?? '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await organizerService.updateOrganizerProfile(form);
      setToast('Profile updated');
      setTimeout(() => setToast(''), 3000);
    } catch { setToast('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading profile…</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 999, background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13 }}>{toast}</div>}

      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Organizer Profile</h2>

      <form onSubmit={handleSave} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={S.label}>Organization Name</label>
          <input style={S.input} value={form.organizationName} onChange={e => setForm(p => ({ ...p, organizationName: e.target.value }))} />
        </div>
        <div>
          <label style={S.label}>Bio</label>
          <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' } as any} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
        </div>

        <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ ...S.label, marginBottom: 16, color: 'rgba(240,192,64,0.8)' }}>Payout Details</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16, lineHeight: 1.6 }}>
            This is where your event revenue will be sent after admin releases your payout. Provide either your personal M-Pesa number or a Paybill.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={S.label}>M-Pesa Phone Number</label>
              <input style={S.input} value={form.mpesaPhone} onChange={e => setForm(p => ({ ...p, mpesaPhone: e.target.value }))} placeholder="e.g. 0712345678" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={S.label}>Paybill Number</label>
                <input style={S.input} value={form.paybillNumber} onChange={e => setForm(p => ({ ...p, paybillNumber: e.target.value }))} placeholder="e.g. 522522" />
              </div>
              <div>
                <label style={S.label}>Account Number</label>
                <input style={S.input} value={form.accountNumber} onChange={e => setForm(p => ({ ...p, accountNumber: e.target.value }))} placeholder="e.g. Business name" />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" style={S.btn} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
      </form>
    </div>
  );
}

// ── Main OrganizerDashboard ───────────────────────────────────
export default function OrganizerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('events');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'events',  label: 'My Events',  icon: '🎪' },
    { id: 'checkin', label: 'Check-In',   icon: '✅' },
    { id: 'payouts', label: 'Payouts',    icon: '💰' },
    { id: 'profile', label: 'Profile',    icon: '⚙️' },
  ];

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        input[type='date']::-webkit-calendar-picker-indicator,
        input[type='time']::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        select option { background: #141927; }
      `}</style>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,13,20,0.97)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontSize: 18, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display',serif", textDecoration: 'none', letterSpacing: -0.3 }}>✦ SparkVybzEnt</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono',monospace" }}>
              {user?.firstName} {user?.lastName}
            </span>
            <span style={{ fontSize: 9, letterSpacing: 2, color: '#f0c040', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: 20, padding: '3px 10px', fontFamily: "'DM Mono',monospace", textTransform: 'uppercase' }}>ORGANIZER</span>
            <button onClick={logout} style={{ ...S.ghost, padding: '7px 14px', fontSize: 12 }}>Sign Out</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1060, margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* Hero */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>Organizer Portal</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginBottom: 6 }}>
            Welcome back, {user?.firstName}<span style={{ color: '#f0c040' }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Manage your events, check in attendees, and track your payouts.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 5, marginBottom: 36, width: 'fit-content', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#f0c040' : 'none',
                color: activeTab === tab.id ? '#0a0d14' : 'rgba(255,255,255,0.45)',
                border: 'none', borderRadius: 9, padding: '9px 18px',
                fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'events'  && <EventsTab />}
        {activeTab === 'checkin' && <CheckInTab />}
        {activeTab === 'payouts' && <PayoutsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>
    </div>
  );
}
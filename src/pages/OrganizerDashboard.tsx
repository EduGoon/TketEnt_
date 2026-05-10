import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';
import * as organizerService from '../services/organizerService';
import { Event, Payout, OrganizerProfile } from '../utilities/types';

type Tab = 'events' | 'checkin' | 'payouts' | 'profile' | 'analytics';

const BANK_OPTIONS = [
  { code: '001', name: 'Kenya Commercial Bank' },
  { code: '068', name: 'Equity Bank' },
  { code: '011', name: 'Co-operative Bank' },
  { code: '031', name: 'Standard Chartered Bank' },
  { code: '003', name: 'Absa Bank Kenya' },
  { code: '063', name: 'Diamond Trust Bank' },
  { code: '012', name: 'National Bank of Kenya' },
  { code: '070', name: 'Family Bank' },
  { code: '081', name: 'Sidian Bank' },
  { code: '057', name: 'I&M Bank' },
  { code: '019', name: 'Bank of Africa' },
  { code: '023', name: 'Consolidated Bank' },
  { code: '061', name: 'Credit Bank' },
  { code: '066', name: 'Development Bank' },
  { code: '043', name: 'Ecobank Kenya' },
  { code: '053', name: 'Guaranty Trust Bank' },
  { code: '050', name: 'Habib Bank' },
  { code: '070', name: 'K-Rep Bank' },
  { code: '041', name: 'NIC Bank' },
];

// ── SVG Icons ─────────────────────────────────────────────────
const Icon = {
  qr: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      <path d="M14 14h1v1h-1z M17 14h1v1h-1z M14 17h1v1h-1z M17 17h1v1h-1z M20 14h1v1h-1z M14 20h1v1h-1z M20 20h1v1h-1z"/>
    </svg>
  ),
  check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  x: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  camera: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  stop: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>
  ),
  refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  pin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  chevron: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

// ── Shared styles ─────────────────────────────────────────────
const S = {
  page:  { minHeight: '100vh', background: '#080b12', color: '#fff', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden' as const },
  label: { fontSize: 9, letterSpacing: 3, color: 'rgba(240,192,64,0.55)', textTransform: 'uppercase' as const, fontFamily: "'DM Mono',monospace", marginBottom: 6, display: 'block' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff', fontFamily: "'DM Sans',sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' as const } as React.CSSProperties,
  btn:   { background: '#f0c040', color: '#080b12', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const } as React.CSSProperties,
  ghost: { background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const } as React.CSSProperties,
  danger:{ background: 'transparent', color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const } as React.CSSProperties,
  card:  { background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 } as React.CSSProperties,
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', border: 'none', margin: '0' } as React.CSSProperties,
};

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 999, background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 12, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#22c55e', display: 'inline-flex' }}><Icon.check /></span>{msg}
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────
function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>{title}</h2>
      {action}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const colors: any = { PUBLISHED: '#22c55e', DRAFT: '#f0c040', CANCELLED: '#ef4444', PENDING: '#f0c040', RELEASED: '#22c55e', REJECTED: '#ef4444', ENDED: 'rgba(255,255,255,0.3)' };
  const c = colors[status] ?? 'rgba(255,255,255,0.4)';
  return (
    <span style={{ fontSize: 9, letterSpacing: 1.5, color: c, fontFamily: "'DM Mono',monospace", textTransform: 'uppercase' as const }}>
      {status}
    </span>
  );
}

// ── Event Form ────────────────────────────────────────────────
function EventForm({ initial, onSave, onCancel, saving }: {
  initial?: Partial<Event>;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const isInternalStorageUrl = (url: string) => /(?:firebasestorage\.googleapis\.com|storage\.googleapis\.com|appspot\.com\/o\/)/i.test(url);
  const initialImageUrl = initial?.imageUrl ?? '';
  const initialImageStoredInternally = initialImageUrl ? isInternalStorageUrl(initialImageUrl) : false;

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
    imageUrl: initialImageStoredInternally ? '' : initialImageUrl,
    address: (initial as any)?.address ?? '',
    latitude: (initial as any)?.latitude ?? '',
    longitude: (initial as any)?.longitude ?? '',
  });
  const [originalImageStoredInternally] = useState(initialImageStoredInternally);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialImageUrl);
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
      payload.address   = form.address   || undefined;
      payload.latitude  = form.latitude  ? parseFloat(form.latitude)  : undefined;
      payload.longitude = form.longitude ? parseFloat(form.longitude) : undefined;
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
    } else if (!form.imageUrl && originalImageStoredInternally) {
      delete payload.imageUrl;
    }
    onSave(payload);
  };

  const sel = { ...S.input, background: 'rgba(255,255,255,0.03)' };
  const rowGap = { display: 'flex', flexDirection: 'column' as const, gap: 5 };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={rowGap}>
        <label style={S.label}>Title *</label>
        <input style={S.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={rowGap}>
          <label style={S.label}>Category</label>
          <select style={sel} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
            <option value="">Select</option>
            {['Music','Art','Technology','Sports','Food','Comedy','Fashion','Business','Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={rowGap}>
          <label style={S.label}>Status</label>
          <select style={sel} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div style={rowGap}>
        <label style={S.label}>Description</label>
        <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' } as any} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 12 }}>
        <div style={rowGap}><label style={S.label}>Date *</label><input type="date" style={S.input} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required /></div>
        <div style={rowGap}><label style={S.label}>Start Time</label><input type="time" style={S.input} value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} /></div>
        <div style={rowGap}><label style={S.label}>End Time</label><input type="time" style={S.input} value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} /></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={rowGap}><label style={S.label}>Venue</label><input style={S.input} value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} /></div>
        <div style={rowGap}><label style={S.label}>Location</label><input style={S.input} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
      </div>

      <div style={rowGap}>
        <label style={S.label}>Map Address</label>
        <input style={S.input} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Full address e.g. KICC, Harambee Ave, Nairobi" />
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <input style={{ ...S.input, flex: 1 }} placeholder="Latitude" value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} />
          <input style={{ ...S.input, flex: 1 }} placeholder="Longitude" value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} />
          <button type="button" style={{ ...S.ghost, padding: '8px 12px', gap: 4, flexShrink: 0 }}
            onClick={() => navigator.geolocation?.getCurrentPosition(pos => setForm(p => ({ ...p, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) })), undefined, { enableHighAccuracy: true, timeout: 10000 })}>
            <Icon.pin /><span style={{ fontSize: 12 }}>My Location</span>
          </button>
        </div>
      </div>

      <div style={rowGap}>
        <label style={S.label}>Event Image</label>
        {imagePreview && <img src={imagePreview} alt="preview" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, filter: 'brightness(0.8)', marginBottom: 8 }} />}
        <input type="file" accept="image/*" onChange={handleFile} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', width: '100%' }} />
        <div style={{ marginTop: 8 }}>
          <label style={{ ...S.label, marginBottom: 4 }}>Or Image URL</label>
          <input style={S.input} value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} disabled={!!imageFile} placeholder="https://..." />
          {originalImageStoredInternally && !imageFile && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Current image stored internally — leave blank to keep it.</p>}
        </div>
      </div>

      <div style={rowGap}>
        <label style={S.label}>Ticket Types</label>
        {tickets.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input style={{ ...S.input, flex: '1 1 120px', minWidth: 0 }} placeholder="Name" value={t.name} onChange={e => setTickets(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
            <input type="number" style={{ ...S.input, width: 90, flex: '0 0 90px' }} placeholder="Price" value={t.price || ''} onChange={e => setTickets(prev => prev.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))} />
            <input type="number" style={{ ...S.input, width: 80, flex: '0 0 80px' }} placeholder="Qty" value={t.quantity || ''} onChange={e => setTickets(prev => prev.map((x, j) => j === i ? { ...x, quantity: Number(e.target.value) } : x))} />
            <button type="button" onClick={() => setTickets(prev => prev.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.6)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}><Icon.x /></button>
          </div>
        ))}
        <button type="button" onClick={() => setTickets(prev => [...prev, { name: '', price: 0, quantity: 0 }])} style={{ ...S.ghost, padding: '8px 14px', fontSize: 12, width: 'fit-content' }}><Icon.plus /><span>Add Ticket Type</span></button>
      </div>

      <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
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
    try { const resp = await organizerService.getOrganizerEvents(); setEvents((resp?.data ?? resp) || []); }
    catch { setEvents([]); }
    finally { setLoading(false); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      editing ? await organizerService.updateOrganizerEvent(editing.id, data) : await organizerService.createOrganizerEvent(data);
      showToast(editing ? 'Event updated' : 'Event created');
      setShowForm(false); setEditing(null); loadEvents();
    } catch { showToast('Failed to save event'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    try { await organizerService.deleteOrganizerEvent(id); showToast('Event deleted'); loadEvents(); }
    catch { showToast('Failed to delete'); }
  };

  const STATUS_COLOR: any = { PUBLISHED: '#22c55e', DRAFT: '#f0c040', CANCELLED: '#ef4444' };

  return (
    <div>
      <Toast msg={toast} />
      <SectionHeader
        title="Events"
        action={
          <button style={S.btn} onClick={() => { setEditing(null); setShowForm(true); }}>
            <Icon.plus /> New Event
          </button>
        }
      />

      {showForm && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700 }}>{editing ? 'Edit Event' : 'New Event'}</p>
            <button style={{ ...S.ghost, padding: '6px 12px', fontSize: 12 }} onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
          </div>
          <hr style={S.divider} />
          <div style={{ paddingTop: 24 }}>
            <EventForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} saving={saving} />
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 56, background: 'rgba(255,255,255,0.02)', borderRadius: 4, marginBottom: 1, opacity: 0.6 }} />)}
        </div>
      ) : events.length === 0 ? (
        <div style={{ paddingTop: 48, paddingBottom: 48, textAlign: 'center' as const }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, fontStyle: 'italic' }}>No events yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {events.map((ev, idx) => (
            <div key={ev.id}>
              {idx > 0 && <hr style={S.divider} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                {ev.imageUrl
                  ? <img src={ev.imageUrl} alt={ev.title} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0, filter: 'brightness(0.75)' }} />
                  : <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{ev.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono',monospace" }}>
                      {ev.startTime ? new Date(ev.startTime).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                      {ev.venue ? ` · ${ev.venue}` : ''}
                    </span>
                    <span style={{ color: STATUS_COLOR[ev.status] ?? '#fff', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase' as const, fontFamily: "'DM Mono',monospace" }}>{ev.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    title="Edit"
                    style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '7px', borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#fff')}
                    onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                    onClick={() => { setEditing(ev); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  ><Icon.edit /></button>
                  <button
                    title="Delete"
                    style={{ background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.4)', cursor: 'pointer', padding: '7px', borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseOut={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.4)')}
                    onClick={() => handleDelete(ev.id)}
                  ><Icon.trash /></button>
                </div>
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
  const [events, setEvents]               = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [ticketId, setTicketId]           = useState('');
  const [scanning, setScanning]           = useState(false);
  const [cameraActive, setCameraActive]   = useState(false);
  const [result, setResult]               = useState<{ success: boolean; message: string; attendee?: any } | null>(null);
  const [checkIns, setCheckIns]           = useState<any[]>([]);
  const [loadingCheckIns, setLoadingCheckIns] = useState(false);
  const [isMobile, setIsMobile]           = useState(false);
  const videoRef                          = useRef<HTMLVideoElement>(null);
  const codeReaderRef                     = useRef<any>(null);
  const processingRef                     = useRef(false);

  useEffect(() => { setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)); }, []);
  useEffect(() => {
    organizerService.getOrganizerEvents().then(resp => setEvents((resp?.data ?? resp) || [])).catch(() => setEvents([]));
  }, []);
  useEffect(() => { return () => { stopCamera(); }; }, []);

  const loadCheckIns = async (eventId: string) => {
    setLoadingCheckIns(true);
    try { const resp = await organizerService.getEventCheckIns(eventId); setCheckIns(resp?.data ?? []); }
    catch { setCheckIns([]); }
    finally { setLoadingCheckIns(false); }
  };

  const handleSelectEvent = (ev: Event) => {
    setSelectedEvent(ev); setResult(null); setTicketId(''); stopCamera(); loadCheckIns(ev.id);
  };

  const stopCamera = () => {
    if (codeReaderRef.current) { try { codeReaderRef.current.reset(); } catch {} codeReaderRef.current = null; }
    setCameraActive(false);
  };

  const startCamera = async () => {
    if (!videoRef.current) {
      setCameraActive(true);
      setTimeout(async () => {
        if (!videoRef.current) { setResult({ success: false, message: 'Camera UI failed to initialize.' }); setCameraActive(false); return; }
        await initCamera();
      }, 300);
      return;
    }
    await initCamera();
  };

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(t => t.stop());
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;
      setResult(null);
      await codeReader.decodeFromVideoDevice(undefined, videoRef.current!, (res, _err) => {
        if (!res || processingRef.current || !codeReaderRef.current) return;
        processingRef.current = true;
        const reader = codeReaderRef.current;
        codeReaderRef.current = null;
        setCameraActive(false);
        try { reader.reset(); } catch {}
        const text = res.getText();
        const ticketIdFromQR = text.startsWith('ticket:') ? text.replace('ticket:', '') : text;
        processCheckIn(ticketIdFromQR).finally(() => { setTimeout(() => { processingRef.current = false; }, 2000); });
      });
    } catch (err: any) { setCameraActive(false); setResult({ success: false, message: `Camera error: ${err?.message ?? String(err)}` }); }
  };

  const processCheckIn = async (id: string) => {
    if (!selectedEvent || !id.trim()) return;
    setScanning(true); setResult(null);
    try {
      const resp = await organizerService.scanTicket(id.trim(), selectedEvent.id);
      setResult({ success: true, message: resp.message, attendee: resp.data });
      setTicketId(''); loadCheckIns(selectedEvent.id);
    } catch (err: any) { setResult({ success: false, message: err.message || 'Check-in failed' }); }
    finally { setScanning(false); }
  };

  const handleManualScan = async (e: React.FormEvent) => { e.preventDefault(); await processCheckIn(ticketId); };

  return (
    <div>
      <SectionHeader title="Check-In" />

      {/* Event selector */}
      <div style={{ marginBottom: 32 }}>
        <label style={S.label}>Event</label>
        <select style={{ ...S.input, maxWidth: 400, background: 'rgba(255,255,255,0.03)' }} value={selectedEvent?.id ?? ''} onChange={e => { const ev = events.find(x => x.id === e.target.value); if (ev) handleSelectEvent(ev); }}>
          <option value="">Select a published event</option>
          {events.filter(ev => ev.status === 'PUBLISHED').map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
      </div>

      {selectedEvent && (
        <>
          <hr style={S.divider} />

          {/* Scanner section */}
          <div style={{ padding: '24px 0' }}>
            {/* Camera area */}
            {isMobile ? (
              <div style={{ marginBottom: 24 }}>
                {!cameraActive ? (
                  <button style={{ ...S.ghost, gap: 8 }} onClick={startCamera}>
                    <Icon.camera /><span>Scan QR Code</span>
                  </button>
                ) : (
                  <div>
                    <video ref={videoRef} style={{ width: '100%', maxWidth: 360, borderRadius: 10, background: '#000', display: 'block', maxHeight: 260, objectFit: 'cover' }} autoPlay playsInline muted />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                      <button style={{ ...S.ghost, gap: 6, padding: '8px 14px', fontSize: 12 }} onClick={stopCamera}><Icon.stop /><span>Stop Camera</span></button>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono',monospace" }}>Point at ticket QR</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <span style={{ color: 'rgba(255,255,255,0.2)', display: 'flex' }}><Icon.qr /></span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono',monospace" }}>Open on mobile to use camera scanning</span>
              </div>
            )}

            {/* Result */}
            {result && (
              <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, background: result.success ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)', borderLeft: `3px solid ${result.success ? '#22c55e' : '#ef4444'}` }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: result.success ? '#22c55e' : '#ef4444', marginBottom: result.attendee ? 6 : 0 }}>
                  {result.success ? '✓' : '✕'} {result.message}
                </p>
                {result.attendee && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Mono',monospace" }}>
                    {result.attendee.attendee?.firstName} {result.attendee.attendee?.lastName} · {result.attendee.ticketType} · {new Date(result.attendee.checkedInAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

            {/* Manual entry */}
            <form onSubmit={handleManualScan} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ ...S.label, margin: 0, flexShrink: 0, alignSelf: 'center' }}>Ticket ID</label>
              <input
                style={{ ...S.input, flex: '1 1 200px', maxWidth: 340 }}
                value={ticketId}
                onChange={e => setTicketId(e.target.value)}
                placeholder="Paste ticket ID…"
              />
              <button type="submit" style={{ ...S.btn, padding: '10px 18px' }} disabled={scanning || !ticketId.trim()}>
                {scanning ? 'Checking…' : 'Check In'}
              </button>
            </form>
          </div>

          <hr style={S.divider} />

          {/* Check-ins list */}
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                {checkIns.length > 0 ? <><strong style={{ color: '#fff' }}>{checkIns.length}</strong> checked in</> : 'No check-ins yet'}
              </span>
              <button style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }} onClick={() => loadCheckIns(selectedEvent.id)}>
                <Icon.refresh /><span>Refresh</span>
              </button>
            </div>

            {loadingCheckIns ? (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Mono',monospace" }}>Loading…</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {checkIns.map((ci: any, idx: number) => (
                  <div key={ci.id}>
                    {idx > 0 && <hr style={S.divider} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', fontSize: 13 }}>
                      <div>
                        <span style={{ color: '#fff', fontWeight: 500 }}>{ci.ticket?.user?.firstName} {ci.ticket?.user?.lastName}</span>
                        <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 10, fontSize: 12 }}>{ci.ticket?.ticketTypeName}</span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono',monospace", fontSize: 11 }}>
                        {new Date(ci.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
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
  const [payouts, setPayouts]           = useState<Payout[]>([]);
  const [events, setEvents]             = useState<Event[]>([]);
  const [loading, setLoading]           = useState(true);
  const [requesting, setRequesting]     = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [toast, setToast]               = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm]   = useState({ mpesaPhone: '', paybillNumber: '', accountNumber: '' });
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    Promise.all([organizerService.getOrganizerPayouts(), organizerService.getOrganizerEvents()])
      .then(([p, e]) => { setPayouts(p?.data ?? []); setEvents((e?.data ?? e) || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleRequest = async () => {
    if (!selectedEventId) return;
    try {
      const profileResp = await organizerService.getOrganizerProfile();
      const profile = profileResp?.data ?? profileResp;
      if (!profile?.mpesaPhone && !profile?.paybillNumber) {
        setPaymentForm({ mpesaPhone: profile?.mpesaPhone ?? '', paybillNumber: profile?.paybillNumber ?? '', accountNumber: profile?.accountNumber ?? '' });
        setShowPaymentForm(true); return;
      }
    } catch {}
    await submitPayoutRequest();
  };

  const savePaymentAndRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.mpesaPhone && !paymentForm.paybillNumber) { showToast('Provide a phone or bank details'); return; }
    setSavingPayment(true);
    try { await organizerService.updateOrganizerProfile(paymentForm); setShowPaymentForm(false); await submitPayoutRequest(); }
    catch { showToast('Failed to save payment details'); }
    finally { setSavingPayment(false); }
  };

  const submitPayoutRequest = async () => {
    setRequesting(true);
    try {
      await organizerService.requestPayout(selectedEventId);
      showToast('Payout requested');
      const resp = await organizerService.getOrganizerPayouts();
      setPayouts(resp?.data ?? []); setSelectedEventId('');
    } catch (err: any) { showToast(err.message || 'Failed to request payout'); }
    finally { setRequesting(false); }
  };

  const STATUS_COLOR: any = { PENDING: '#f0c040', RELEASED: '#22c55e', REJECTED: '#ef4444' };

  return (
    <div>
      <Toast msg={toast} />
      <SectionHeader title="Payouts" />

      {/* Request row */}
      <div style={{ marginBottom: 32 }}>
        <label style={S.label}>Request payout</label>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 12, lineHeight: 1.6 }}>Select a completed event. A 5% platform fee applies.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select style={{ ...S.input, maxWidth: 340, flex: '1 1 200px', background: 'rgba(255,255,255,0.03)' }} value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
            <option value="">Select event</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
          <button style={{ ...S.btn, flex: '0 0 auto' }} onClick={handleRequest} disabled={requesting || !selectedEventId}>
            {requesting ? 'Requesting…' : 'Request'}
          </button>
        </div>
      </div>

      <hr style={S.divider} />

      {/* Payouts list */}
      <div style={{ paddingTop: 4 }}>
        {loading ? (
          <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[1,2].map(i => <div key={i} style={{ height: 52, background: 'rgba(255,255,255,0.02)', borderRadius: 4 }} />)}
          </div>
        ) : payouts.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' as const }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, fontStyle: 'italic' }}>No payout requests yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {payouts.map((p, idx) => (
              <div key={p.id}>
                {idx > 0 && <hr style={S.divider} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{p.event?.title ?? 'Event'}</p>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontFamily: "'DM Mono',monospace" }}>
                        {new Date(p.requestedAt).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {p.releasedAt ? ` · Released ${new Date(p.releasedAt).toLocaleDateString()}` : ''}
                      </span>
                      {p.adminNote && <span style={{ fontSize: 11, color: 'rgba(239,68,68,0.6)' }}>{p.adminNote}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: STATUS_COLOR[p.status], fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>KSH {p.netAmount.toLocaleString()}</p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono',monospace" }}>Fee {p.platformFee.toLocaleString()}</span>
                      <Badge status={p.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment details modal */}
      {showPaymentForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowPaymentForm(false)}>
          <div style={{ background: '#0d1019', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 32, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, margin: '0 auto 22px' }} />
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Payment Details</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 22, lineHeight: 1.65 }}>Required for your Paystack recipient setup.</p>
            <form onSubmit={savePaymentAndRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={S.label}>Phone Number</label><input style={S.input} value={paymentForm.mpesaPhone} onChange={e => setPaymentForm(p => ({ ...p, mpesaPhone: e.target.value }))} placeholder="e.g. 0712345678" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={S.label}>Bank</label>
                  <select style={{ ...S.input, background: 'rgba(255,255,255,0.03)' }} value={paymentForm.paybillNumber} onChange={e => setPaymentForm(p => ({ ...p, paybillNumber: e.target.value }))}>
                    <option value="">Select Bank</option>
                    {BANK_OPTIONS.map(bank => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
                  </select>
                </div>
                <div><label style={S.label}>Account Number</label><input style={S.input} value={paymentForm.accountNumber} onChange={e => setPaymentForm(p => ({ ...p, accountNumber: e.target.value }))} placeholder="1234567890" /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" style={{ ...S.btn, flex: 1 }} disabled={savingPayment}>{savingPayment ? 'Saving…' : 'Save & Request'}</button>
                <button type="button" style={S.ghost} onClick={() => setShowPaymentForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Profile Tab (unchanged) ───────────────────────────────────
function ProfileTab() {
  const [_profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [form, setForm] = useState({ organizationName: '', bio: '', mpesaPhone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    organizerService.getOrganizerProfile()
      .then(resp => {
        const p = resp?.data ?? resp;
        setProfile(p);
        setForm({ organizationName: p.organizationName ?? '', bio: p.bio ?? '', mpesaPhone: p.mpesaPhone ?? '' });
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await organizerService.updateOrganizerProfile(form); setToast('Profile updated'); setTimeout(() => setToast(''), 3000); }
    catch { setToast('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading profile…</p>;

  return (
    <div>
      <Toast msg={toast} />
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: 24, letterSpacing: -0.3 }}>Profile</h2>
      <form onSubmit={handleSave} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label style={S.label}>Organization Name</label><input style={S.input} value={form.organizationName} onChange={e => setForm(p => ({ ...p, organizationName: e.target.value }))} /></div>
        <div><label style={S.label}>Bio</label><textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' } as any} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} /></div>
        <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ ...S.label, marginBottom: 12, color: 'rgba(240,192,64,0.8)' }}>Payout Details</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 14, lineHeight: 1.6 }}>Provide your phone number for payout setup.</p>
          <div><label style={S.label}>Phone Number</label><input style={S.input} value={form.mpesaPhone} onChange={e => setForm(p => ({ ...p, mpesaPhone: e.target.value }))} placeholder="e.g. 0712345678" /></div>
        </div>
        <button type="submit" style={S.btn} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
      </form>
    </div>
  );
}

// ── Analytics Tab (unchanged) ─────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    organizerService.getOrganizerAnalytics().then(resp => setData(resp?.data ?? null)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading analytics…</p>;
  if (!data) return <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No analytics available yet.</p>;

  const { totals, events } = data;
  const statCards = [
    { label: 'Total Revenue',   value: `KSH ${(totals.totalRevenue ?? 0).toLocaleString()}`,  color: '#f0c040' },
    { label: 'Tickets Sold',    value: (totals.totalTickets ?? 0).toLocaleString(),            color: '#60c8f0' },
    { label: 'Total Check-Ins', value: (totals.totalCheckIns ?? 0).toLocaleString(),           color: '#22c55e' },
    { label: 'Total Reviews',   value: (totals.totalReviews ?? 0).toLocaleString(),            color: '#a78bfa' },
    { label: 'Total Views',     value: (totals.totalViews ?? 0).toLocaleString(),              color: '#fb923c' },
    { label: 'Total Events',    value: (totals.totalEvents ?? 0).toLocaleString(),             color: 'rgba(255,255,255,0.6)' },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: 24, letterSpacing: -0.3 }}>Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 28 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ ...S.card, padding: '16px' }}>
            <p style={{ ...S.label, marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "'DM Mono',monospace" }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {(events ?? []).map((ev: any) => (
          <div key={ev.id} style={{ ...S.card, padding: '16px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
              {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0, filter: 'brightness(0.8)' }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono',monospace" }}>
                  {ev.startTime ? new Date(ev.startTime).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                </p>
              </div>
              <Badge status={ev.status} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 10 }}>
              {[
                { label: 'Revenue',   value: `KSH ${(ev.totalRevenue ?? 0).toLocaleString()}`, color: '#f0c040' },
                { label: 'Tickets',   value: `${ev.totalSold ?? 0}/${ev.totalCapacity ?? 0}`,  color: '#60c8f0' },
                { label: 'Fill Rate', value: `${ev.fillRate ?? 0}%`,                           color: ev.fillRate >= 70 ? '#22c55e' : ev.fillRate >= 30 ? '#f0c040' : '#ef4444' },
                { label: 'Rating',    value: ev.avgRating ? `${ev.avgRating}/5 ★` : '—',      color: '#fb923c' },
                { label: 'Check-ins', value: String(ev.checkInCount ?? 0),                     color: '#22c55e' },
                { label: 'Views',     value: String(ev.views ?? 0),                            color: 'rgba(255,255,255,0.5)' },
              ].map(m => (
                <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                  <p style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>{m.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: m.color, fontFamily: "'DM Mono',monospace" }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function OrganizerDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('events');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'events',    label: 'Events'    },
    { id: 'checkin',   label: 'Check-In'  },
    { id: 'payouts',   label: 'Payouts'   },
    { id: 'analytics', label: 'Analytics' },
    { id: 'profile',   label: 'Profile'   },
  ];

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        input[type='date']::-webkit-calendar-picker-indicator,
        input[type='time']::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
        select option { background: #141927; }
        textarea { box-sizing: border-box; }
        button:focus-visible { outline: 2px solid rgba(240,192,64,0.5); outline-offset: 2px; }
      `}</style>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,11,18,0.97)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link to="/" style={{ fontSize: 17, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display',serif", textDecoration: 'none', letterSpacing: -0.3, flexShrink: 0 }}>✦ Eventify</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 9, letterSpacing: 2, color: '#f0c040', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: 20, padding: '3px 10px', fontFamily: "'DM Mono',monospace", textTransform: 'uppercase' as const }}>ORGANIZER</span>
            <button onClick={logout} title="Sign out" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4, transition: 'color 0.15s' }}
              onMouseOver={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
            ><Icon.logout /></button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1060, margin: '0 auto', padding: '28px 16px 80px' }}>

        {/* Tab bar */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: 0, width: 'max-content', minWidth: '100%' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #f0c040' : '2px solid transparent',
                  color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.35)',
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'events'    && <EventsTab />}
        {activeTab === 'checkin'   && <CheckInTab />}
        {activeTab === 'payouts'   && <PayoutsTab />}
        {activeTab === 'profile'   && <ProfileTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>
    </div>
  );
}
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
  { code: '061', name: 'Housing Finance' },
  { code: '070', name: 'K-Rep Bank' },
  { code: '041', name: 'NIC Bank' },
  { code: '096', name: 'Oriental Commercial Bank' },
  { code: '080', name: 'Paramount Universal Bank' },
  { code: '050', name: 'Prime Bank' },
  { code: '031', name: 'Stanbic Bank' },
  { code: '026', name: 'Trans National Bank' },
  { code: '025', name: 'UBA Kenya' },
  { code: '078', name: 'Victoria Commercial Bank' },
];


const S = {
  page:   { minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden' as const },
  card:   { background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 } as React.CSSProperties,
  label:  { fontSize: 9, letterSpacing: 3, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase' as const, fontFamily: "'DM Mono',monospace", marginBottom: 6, display: 'block' },
  input:  { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff', fontFamily: "'DM Sans',sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' as const } as React.CSSProperties,
  btn:    { background: '#f0c040', color: '#0a0d14', border: 'none', borderRadius: 9, padding: '11px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'opacity 0.2s', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  ghost:  { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '11px 24px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' as const } as React.CSSProperties,
  danger: { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 9, padding: '11px 24px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' as const } as React.CSSProperties,
};
 
// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 999, background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      {msg}
    </div>
  );
}
 
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
    address:   (initial as any)?.address   ?? '',
  latitude:  (initial as any)?.latitude  ?? '',
  longitude: (initial as any)?.longitude ?? '',
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
    }
    onSave(payload);
  };
 
  const field = (label: string, node: React.ReactNode) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={S.label}>{label}</label>
      {node}
    </div>
  );
 
  const sel = { ...S.input, background: '#141927' };
 
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {field('Title *', <input style={S.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />)}
      {field('Category', (
        <select style={sel} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
          <option value="">Select</option>
          {['Music','Art','Technology','Sports','Food','Comedy','Fashion','Business','Other'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      ))}
      {field('Description', <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' } as any} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />)}
 
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 12 }}>
        {field('Date *', <input type="date" style={S.input} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />)}
        {field('Start Time', <input type="time" style={S.input} value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />)}
        {field('End Time', <input type="time" style={S.input} value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />)}
        {field('Status', (
          <select style={sel} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        ))}
      </div>
 
      {field('Venue', <input style={S.input} value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} />)}
      {field('Location', <input style={S.input} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />)}
 
 <div>
  <label style={S.label}>Map Address (for directions)</label>
  <input style={S.input} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Full address e.g. KICC, Harambee Ave, Nairobi" />
  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
    <input style={{ ...S.input, flex: 1 }} placeholder="Latitude (auto or manual)" value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} />
    <input style={{ ...S.input, flex: 1 }} placeholder="Longitude (auto or manual)" value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} />
    <button type="button" style={{ ...S.ghost, padding: '8px 14px', fontSize: 12, flexShrink: 0 }}
      onClick={() => {
        if (!navigator.geolocation) return;
       navigator.geolocation.getCurrentPosition(pos => {
  setForm(p => ({
    ...p,
    latitude: pos.coords.latitude.toFixed(6),
    longitude: pos.coords.longitude.toFixed(6),
  }));
}, undefined, { enableHighAccuracy: true, timeout: 10000 });
      }}>
      📍 Use My Location
    </button>
  </div>
  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6, fontFamily: "'DM Mono',monospace" }}>Users will see a Google Maps directions link on your event page</p>
</div>

      <div>
        <label style={S.label}>Event Image</label>
        {imagePreview && <img src={imagePreview} alt="preview" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 10, filter: 'brightness(0.8)' }} />}
        <input type="file" accept="image/*" onChange={handleFile} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', width: '100%' }} />
        <div style={{ marginTop: 8 }}>
          <label style={{ ...S.label, marginBottom: 4 }}>Or Image URL</label>
          <input style={S.input} value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} disabled={!!imageFile} placeholder="https://..." />
        </div>
      </div>
 
      <div>
        <label style={S.label}>Ticket Types</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tickets.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input style={{ ...S.input, flex: '1 1 120px', minWidth: 0 }} placeholder="Name" value={t.name} onChange={e => setTickets(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
              <input type="number" style={{ ...S.input, width: 90, flex: '0 0 90px' }} placeholder="Price" value={t.price || ''} onChange={e => setTickets(prev => prev.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))} />
              <input type="number" style={{ ...S.input, width: 80, flex: '0 0 80px' }} placeholder="Qty" value={t.quantity || ''} onChange={e => setTickets(prev => prev.map((x, j) => j === i ? { ...x, quantity: Number(e.target.value) } : x))} />
              <button type="button" onClick={() => setTickets(prev => prev.filter((_, j) => j !== i))} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: 6, width: 34, height: 34, cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>✕</button>
            </div>
          ))}
          <button type="button" onClick={() => setTickets(prev => [...prev, { name: '', price: 0, quantity: 0 }])} style={{ ...S.ghost, padding: '8px 16px', fontSize: 12, width: 'fit-content' }}>+ Add Ticket Type</button>
        </div>
      </div>
 
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 8 }}>
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
      <Toast msg={toast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700 }}>My Events</h2>
        <button style={S.btn} onClick={() => { setEditing(null); setShowForm(true); }}>+ New Event</button>
      </div>
 
      {showForm && (
        <div style={{ ...S.card, marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, marginBottom: 20 }}>{editing ? 'Edit Event' : 'Create New Event'}</h3>
          <EventForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} saving={saving} />
        </div>
      )}
 
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 80, background: 'linear-gradient(160deg,#141927,#0f1521)', borderRadius: 14, opacity: 0.6 }} />)}
        </div>
      ) : events.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>No events yet. Create your first event above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map(ev => (
            <div key={ev.id} style={{ ...S.card, padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0, filter: 'brightness(0.8)' }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono',monospace" }}>
                    {ev.startTime ? new Date(ev.startTime).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                    {ev.venue ? ` · ${ev.venue}` : ''}
                  </p>
                  <span style={{ fontSize: 9, letterSpacing: 1.5, color: STATUS_COLOR[ev.status] ?? '#fff', background: `${STATUS_COLOR[ev.status]}18`, border: `1px solid ${STATUS_COLOR[ev.status]}44`, borderRadius: 20, padding: '2px 8px', fontFamily: "'DM Mono',monospace", textTransform: 'uppercase', display: 'inline-block', marginTop: 6 }}>{ev.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button style={{ ...S.ghost, padding: '7px 14px', fontSize: 12, flex: 1, textAlign: 'center' as const }} onClick={() => { setEditing(ev); setShowForm(true); }}>Edit</button>
                <button style={{ ...S.danger, padding: '7px 14px', fontSize: 12, flex: 1, textAlign: 'center' as const }} onClick={() => handleDelete(ev.id)}>Delete</button>
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
  const [events, setEvents]             = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [ticketId, setTicketId]         = useState('');
  const [scanning, setScanning]         = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult]             = useState<{ success: boolean; message: string; attendee?: any } | null>(null);
  const [checkIns, setCheckIns]         = useState<any[]>([]);
  const [loadingCheckIns, setLoadingCheckIns] = useState(false);
  const [isMobile, setIsMobile]         = useState(false);
  const videoRef                        = useRef<HTMLVideoElement>(null);
  const codeReaderRef                   = useRef<any>(null);
const processingRef                   = useRef(false);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    organizerService.getOrganizerEvents()
      .then(resp => setEvents((resp?.data ?? resp) || []))
      .catch(() => setEvents([]));
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => { stopCamera(); };
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
    stopCamera();
    loadCheckIns(ev.id);
  };

const stopCamera = () => {
  if (codeReaderRef.current) {
    try { codeReaderRef.current.reset(); } catch {}
    codeReaderRef.current = null;
  }
  setCameraActive(false);
  // DO NOT reset processingRef here — keep it true until scan is fully done
};

const startCamera = async () => {
  
  if (!videoRef.current) {
    setCameraActive(true);
    // Wait for video element to render then try again
    setTimeout(async () => {
      if (!videoRef.current) {
        setResult({ success: false, message: 'Camera UI failed to initialize. Please try again.' });
        setCameraActive(false);
        return;
      }
      await initCamera();
    }, 300);
    return;
  }
  await initCamera();
};

const initCamera = async () => {
  try {
    // First explicitly request camera permission
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    stream.getTracks().forEach(t => t.stop()); // stop the test stream

    const { BrowserMultiFormatReader } = await import('@zxing/browser');
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;
    setResult(null);

    await codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current!,
   (result, _err) => {
  if (!result) return;
  if (processingRef.current) return;
  if (!codeReaderRef.current) return;
  processingRef.current = true;
  const reader = codeReaderRef.current;
  codeReaderRef.current = null;
  setCameraActive(false);
  try { reader.reset(); } catch {}
  const text = result.getText();
  const ticketIdFromQR = text.startsWith('ticket:') ? text.replace('ticket:', '') : text;
  processCheckIn(ticketIdFromQR).finally(() => {
    setTimeout(() => { processingRef.current = false; }, 2000);
  });
}
    );
  } catch (err: any) {
    setCameraActive(false);
    setResult({ success: false, message: `Camera error: ${err?.message ?? String(err)}` });
  }
};

  const processCheckIn = async (id: string) => {
    if (!selectedEvent || !id.trim()) return;
    setScanning(true);
    setResult(null);
    try {
      const resp = await organizerService.scanTicket(id.trim(), selectedEvent.id);
      setResult({ success: true, message: resp.message, attendee: resp.data });
      setTicketId('');
      loadCheckIns(selectedEvent.id);
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Check-in failed' });
    } finally { setScanning(false); }
  };

  const handleManualScan = async (e: React.FormEvent) => {
    e.preventDefault();
    await processCheckIn(ticketId);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Check-In</h2>

      {/* Event selector */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <label style={S.label}>Select Event</label>
        <select style={{ ...S.input, background: '#0f1521' }} value={selectedEvent?.id ?? ''} onChange={e => { const ev = events.find(x => x.id === e.target.value); if (ev) handleSelectEvent(ev); }}>
          <option value="">— Choose an event —</option>
          {events.filter(ev => ev.status === 'PUBLISHED').map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
      </div>

      {selectedEvent && (
        <>
          {/* QR Scanner */}
          <div style={{ ...S.card, marginBottom: 16 }}>
            <label style={S.label}>QR Code Scanner</label>

            {isMobile ? (
              <>
                {!cameraActive ? (
                  <button
                    style={{ ...S.btn, width: '100%', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={startCamera}
                  >
                    📷 Start Camera Scanner
                  </button>
                ) : (
                  <div style={{ marginBottom: 12 }}>
                    <video
                      ref={videoRef}
                      style={{ width: '100%', borderRadius: 12, background: '#000', display: 'block', maxHeight: 280, objectFit: 'cover' }}
                      autoPlay
                      playsInline
                      muted
                    />
                    <button
                      style={{ ...S.ghost, width: '100%', marginTop: 10, textAlign: 'center' as const }}
                      onClick={stopCamera}
                    >
                      Stop Camera
                    </button>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 8, fontFamily: "'DM Mono',monospace" }}>
                      Point camera at a ticket QR code
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: 'rgba(240,192,64,0.06)', border: '1px solid rgba(240,192,64,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>📱</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#f0c040', marginBottom: 2 }}>Use your phone to scan</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono',monospace", lineHeight: 1.5 }}>
                    Open the organizer dashboard on your mobile browser for camera scanning. Manual entry works here.
                  </p>
                </div>
              </div>
            )}

            {/* Result feedback */}
            {result && (
              <div style={{ marginBottom: 12, padding: '13px 16px', borderRadius: 10, background: result.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${result.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: result.success ? '#22c55e' : '#ef4444', marginBottom: result.attendee ? 8 : 0 }}>
                  {result.success ? '✓' : '✕'} {result.message}
                </p>
                {result.attendee && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <span>👤 {result.attendee.attendee?.firstName} {result.attendee.attendee?.lastName}</span>
                    <span>🎟 {result.attendee.ticketType}</span>
                    <span>🕐 {new Date(result.attendee.checkedInAt).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual entry — always visible */}
          <div style={{ ...S.card, marginBottom: 16 }}>
            <label style={S.label}>Manual Ticket ID Entry</label>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 14, lineHeight: 1.6 }}>
              Paste or type the ticket ID manually.
            </p>
            <form onSubmit={handleManualScan} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                style={{ ...S.input, flex: '1 1 160px', minWidth: 0 }}
                value={ticketId}
                onChange={e => setTicketId(e.target.value)}
                placeholder="Paste ticket ID…"
              />
              <button type="submit" style={{ ...S.btn, flex: '0 0 auto' }} disabled={scanning || !ticketId.trim()}>
                {scanning ? 'Checking…' : 'Check In'}
              </button>
            </form>
          </div>

          {/* Check-ins list */}
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <p style={{ ...S.label, marginBottom: 0 }}>Checked In — {checkIns.length}</p>
              <button style={{ ...S.ghost, padding: '6px 12px', fontSize: 11 }} onClick={() => loadCheckIns(selectedEvent.id)}>↻ Refresh</button>
            </div>
            {loadingCheckIns ? (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>Loading…</p>
            ) : checkIns.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>No check-ins yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {checkIns.map((ci: any) => (
                  <div key={ci.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: 12, flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{ci.ticket?.user?.firstName} {ci.ticket?.user?.lastName}</span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>{ci.ticket?.ticketTypeName}</span>
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
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ mpesaPhone: '', paybillNumber: '', accountNumber: '' });
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
        setShowPaymentForm(true);
        return;
      }
    } catch {}
    await submitPayoutRequest();
  };
 
  const savePaymentAndRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.mpesaPhone && !paymentForm.paybillNumber) { showToast('Please provide at least a phone number or bank details'); return; }
    setSavingPayment(true);
    try {
      await organizerService.updateOrganizerProfile(paymentForm);
      setShowPaymentForm(false);
      await submitPayoutRequest();
    } catch { showToast('Failed to save payment details'); }
    finally { setSavingPayment(false); }
  };
 
  const submitPayoutRequest = async () => {
    setRequesting(true);
    try {
      await organizerService.requestPayout(selectedEventId);
      showToast('Payout requested successfully');
      const resp = await organizerService.getOrganizerPayouts();
      setPayouts(resp?.data ?? []);
      setSelectedEventId('');
    } catch (err: any) { showToast(err.message || 'Failed to request payout'); }
    finally { setRequesting(false); }
  };
 
  const STATUS_COLOR: any = { PENDING: '#f0c040', RELEASED: '#22c55e', REJECTED: '#ef4444' };
 
  return (
    <div>
      <Toast msg={toast} />
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Payouts</h2>
 
      <div style={{ ...S.card, marginBottom: 24 }}>
        <p style={S.label}>Request Payout</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 14, lineHeight: 1.6 }}>
          Select a completed event to request a payout. A 5% platform fee applies.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select style={{ ...S.input, flex: '1 1 160px', background: '#0f1521', minWidth: 0 }} value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
            <option value="">— Select event —</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
          <button style={{ ...S.btn, flex: '0 0 auto' }} onClick={handleRequest} disabled={requesting || !selectedEventId}>
            {requesting ? 'Requesting…' : 'Request Payout'}
          </button>
        </div>
      </div>
 
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2].map(i => <div key={i} style={{ height: 70, background: 'linear-gradient(160deg,#141927,#0f1521)', borderRadius: 14, opacity: 0.6 }} />)}
        </div>
      ) : payouts.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No payout requests yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {payouts.map(p => (
            <div key={p.id} style={{ ...S.card, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.event?.title ?? 'Event'}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono',monospace" }}>
                    {new Date(p.requestedAt).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {p.releasedAt ? ` · Released ${new Date(p.releasedAt).toLocaleDateString()}` : ''}
                  </p>
                  {p.adminNote && <p style={{ fontSize: 11, color: 'rgba(239,68,68,0.7)', marginTop: 4 }}>Note: {p.adminNote}</p>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: STATUS_COLOR[p.status], fontFamily: "'DM Mono',monospace" }}>KSH {p.netAmount.toLocaleString()}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono',monospace" }}>Fee KSH {p.platformFee.toLocaleString()}</p>
                  <span style={{ fontSize: 9, letterSpacing: 1.5, color: STATUS_COLOR[p.status], background: `${STATUS_COLOR[p.status]}18`, border: `1px solid ${STATUS_COLOR[p.status]}44`, borderRadius: 20, padding: '2px 8px', fontFamily: "'DM Mono',monospace", textTransform: 'uppercase', display: 'inline-block', marginTop: 4 }}>{p.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {/* Payment details modal */}
      {showPaymentForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowPaymentForm(false)}>
          <div style={{ background: '#0f1521', border: '1px solid rgba(240,192,64,0.2)', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Payment Details Required</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.65 }}>Provide the payout details needed to configure your Paystack recipient for automated transfers.</p>
            <form onSubmit={savePaymentAndRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={S.label}>Phone Number</label><input style={S.input} value={paymentForm.mpesaPhone} onChange={e => setPaymentForm(p => ({ ...p, mpesaPhone: e.target.value }))} placeholder="e.g. 0712345678" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={S.label}>Bank</label>
                  <select style={{ ...S.input, background: '#141927' }} value={paymentForm.paybillNumber} onChange={e => setPaymentForm(p => ({ ...p, paybillNumber: e.target.value }))}>
                    <option value="">Select Bank</option>
                    {BANK_OPTIONS.map(bank => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
                  </select>
                </div>
                <div><label style={S.label}>Account Number</label><input style={S.input} value={paymentForm.accountNumber} onChange={e => setPaymentForm(p => ({ ...p, accountNumber: e.target.value }))} placeholder="e.g. 1234567890" /></div>
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
 
// ── Profile Tab ───────────────────────────────────────────────
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
    <div>
      <Toast msg={toast} />
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Organizer Profile</h2>
      <form onSubmit={handleSave} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label style={S.label}>Organization Name</label><input style={S.input} value={form.organizationName} onChange={e => setForm(p => ({ ...p, organizationName: e.target.value }))} /></div>
        <div><label style={S.label}>Bio</label><textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' } as any} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} /></div>
 
        <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ ...S.label, marginBottom: 12, color: 'rgba(240,192,64,0.8)' }}>Payout Details</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 14, lineHeight: 1.6 }}>
            Provide your phone number for payout setup. Bank details are handled separately through the payout request process.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label style={S.label}>Phone Number</label><input style={S.input} value={form.mpesaPhone} onChange={e => setForm(p => ({ ...p, mpesaPhone: e.target.value }))} placeholder="e.g. 0712345678" /></div>
          </div>
        </div>

        <button type="submit" style={S.btn} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
      </form>
    </div>
  );
}
 

function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    organizerService.getOrganizerAnalytics()
      .then(resp => setData(resp?.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading analytics…</p>;
  if (!data) return <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No analytics available yet.</p>;

  const { totals, events } = data;

  const statCards = [
    { label: 'Total Revenue',  value: `KSH ${(totals.totalRevenue ?? 0).toLocaleString()}`, color: '#f0c040' },
    { label: 'Tickets Sold',   value: (totals.totalTickets ?? 0).toLocaleString(),          color: '#60c8f0' },
    { label: 'Total Check-Ins',value: (totals.totalCheckIns ?? 0).toLocaleString(),         color: '#22c55e' },
    { label: 'Total Reviews',  value: (totals.totalReviews ?? 0).toLocaleString(),          color: '#a78bfa' },
    { label: 'Total Views',    value: (totals.totalViews ?? 0).toLocaleString(),            color: '#fb923c' },
    { label: 'Total Events',   value: (totals.totalEvents ?? 0).toLocaleString(),           color: 'rgba(255,255,255,0.6)' },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Analytics</h2>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 28 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ ...S.card, padding: '16px' }}>
            <p style={{ ...S.label, marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "'DM Mono',monospace" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Per-event breakdown */}
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
              <span style={{ fontSize: 9, letterSpacing: 1.5, color: ev.status === 'PUBLISHED' ? '#22c55e' : ev.status === 'ENDED' ? 'rgba(255,255,255,0.3)' : '#f0c040', background: ev.status === 'PUBLISHED' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${ev.status === 'PUBLISHED' ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 20, padding: '2px 8px', fontFamily: "'DM Mono',monospace", textTransform: 'uppercase', flexShrink: 0 }}>{ev.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 10 }}>
              {[
                { label: 'Revenue',   value: `KSH ${(ev.totalRevenue ?? 0).toLocaleString()}`,                                    color: '#f0c040' },
                { label: 'Tickets',   value: `${ev.totalSold ?? 0}/${ev.totalCapacity ?? 0}`,                                     color: '#60c8f0' },
                { label: 'Fill Rate', value: `${ev.fillRate ?? 0}%`,                                                              color: ev.fillRate >= 70 ? '#22c55e' : ev.fillRate >= 30 ? '#f0c040' : '#ef4444' },
                { label: 'Rating',    value: ev.avgRating ? `${ev.avgRating}/5 ★` : '—',                                         color: '#fb923c' },
                { label: 'Check-ins', value: String(ev.checkInCount ?? 0),                                                        color: '#22c55e' },
                { label: 'Views',     value: String(ev.views ?? 0),                                                               color: 'rgba(255,255,255,0.5)' },
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
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('events');
 
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'events',  label: 'My Events', icon: '🎪' },
    { id: 'checkin', label: 'Check-In',  icon: '✅' },
    { id: 'payouts', label: 'Payouts',   icon: '💰' },
    { id: 'profile', label: 'Profile',   icon: '⚙️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];
 
  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { overflow-x: hidden; }
        input[type='date']::-webkit-calendar-picker-indicator,
        input[type='time']::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        select option { background: #141927; }
        textarea { box-sizing: border-box; }
      `}</style>
 
      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,13,20,0.97)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link to="/" style={{ fontSize: 17, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display',serif", textDecoration: 'none', letterSpacing: -0.3, flexShrink: 0 }}>✦ Eventify</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ fontSize: 9, letterSpacing: 2, color: '#f0c040', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: 20, padding: '3px 10px', fontFamily: "'DM Mono',monospace", textTransform: 'uppercase', flexShrink: 0 }}>ORGANIZER</span>
            <button onClick={logout} style={{ ...S.ghost, padding: '6px 12px', fontSize: 12 }}>Out</button>
          </div>
        </div>
      </header>
 
      <main style={{ maxWidth: 1060, margin: '0 auto', padding: '28px 16px 80px' }}>
        {/* Hero */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>Organizer Portal</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,5vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 4 }}>
            Welcome back, {user?.firstName}<span style={{ color: '#f0c040' }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Manage your events, check in attendees, and track payouts.</p>
        </div>
 
        {/* Tabs */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 28, paddingBottom: 2 }}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 5, width: 'max-content', minWidth: '100%' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? '#f0c040' : 'none', color: activeTab === tab.id ? '#0a0d14' : 'rgba(255,255,255,0.45)', border: 'none', borderRadius: 9, padding: '9px 16px', fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>
 
        {activeTab === 'events'  && <EventsTab />}
        {activeTab === 'checkin' && <CheckInTab />}
        {activeTab === 'payouts' && <PayoutsTab />}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>
    </div>
  );
}
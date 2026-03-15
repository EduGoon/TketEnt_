import React, { useState, useEffect } from 'react';
import { Event, TicketType } from '../../utilities/types';
import * as adminService from '../../services/adminService';
import { useAuth } from '../../utilities/AuthContext';
 
interface LocalEventForm extends Omit<Partial<Event>, 'ticketTypes'> {
  ticketTypes?: Array<TicketType>;
}

// ── Confirmation Dialog ────────────────────────────────────────────
function ConfirmDialog({ title, message, onConfirm, onCancel }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 bg-white rounded-2xl w-full max-w-md shadow-2xl p-8" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm transition-all">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ── Event Detail Modal ────────────────────────────────────────
function EventDetailModal({ event, onClose, onEdit, onDelete }: {
  event: any; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const statusColors: any = {
    PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
    DRAFT:     'bg-yellow-100 text-yellow-700 border-yellow-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    ENDED:     'bg-gray-100 text-gray-600 border-gray-200',
  };
 
  const totalCapacity = (event.ticketTypes ?? []).reduce((s: number, t: any) => s + (t.quantity ?? 0), 0);
  const totalSold     = (event.ticketTypes ?? []).reduce((s: number, t: any) => s + (t.sold ?? 0), 0);
  const totalRevenue  = (event.ticketTypes ?? []).reduce((s: number, t: any) => s + ((t.sold ?? 0) * (t.price ?? 0)), 0);
  const fillRate      = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero image */}
        {event.imageUrl && (
          <div className="h-52 overflow-hidden rounded-t-3xl relative">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.75)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <div>
                {event.category && <span className="text-xs font-black uppercase tracking-widest text-yellow-400 block mb-1">{event.category}</span>}
                <h2 className="text-2xl font-black text-white leading-tight">{event.title}</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusColors[event.status] ?? 'bg-gray-100 text-gray-600'}`}>{event.status}</span>
            </div>
          </div>
        )}
 
        <div className="p-8">
          {!event.imageUrl && (
            <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
              <div>
                {event.category && <span className="text-xs font-black uppercase tracking-widest text-green-600 block mb-1">{event.category}</span>}
                <h2 className="text-2xl font-black text-gray-900">{event.title}</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusColors[event.status] ?? 'bg-gray-100 text-gray-600'}`}>{event.status}</span>
            </div>
          )}
 
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Tickets Sold', value: `${totalSold} / ${totalCapacity}`, color: 'text-blue-600' },
              { label: 'Fill Rate',    value: `${fillRate}%`,                    color: fillRate >= 70 ? 'text-green-600' : fillRate >= 30 ? 'text-yellow-600' : 'text-red-500' },
              { label: 'Revenue',      value: `KSH ${totalRevenue.toLocaleString()}`, color: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
 
          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left col */}
            <div className="space-y-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Event Details</p>
              {[
                { label: 'Start',    value: event.startTime ? new Date(event.startTime).toLocaleString('default', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' },
                { label: 'End',      value: event.endTime   ? new Date(event.endTime).toLocaleString('default', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' },
                { label: 'Venue',    value: event.venue ?? '—' },
                { label: 'Location', value: event.location ?? '—' },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-400 font-semibold">{row.label}</span>
                  <span className="text-gray-800 font-semibold text-right max-w-[200px]">{row.value}</span>
                </div>
              ))}
            </div>
 
            {/* Right col — organizer info */}
            <div className="space-y-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Organizer</p>
              {event.organizer ? (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-black text-green-600 flex-shrink-0">
                      {event.organizer.firstName?.[0]}{event.organizer.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{event.organizer.firstName} {event.organizer.lastName}</p>
                      <p className="text-xs text-gray-400">{event.organizer.email}</p>
                    </div>
                  </div>
                  {event.organizer.organizerProfile && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Organization</p>
                      <p className="text-sm font-semibold text-gray-700">{event.organizer.organizerProfile.organizationName}</p>
                      {event.organizer.organizerProfile.bio && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{event.organizer.organizerProfile.bio}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-400 italic">Created by admin</p>
                </div>
              )}
 
              {/* Meta */}
              <div className="space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Meta</p>
                {[
                  { label: 'Event ID',   value: event.id?.substring(0, 16) + '…' },
                  { label: 'Created',    value: event.createdAt ? new Date(event.createdAt).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                  { label: 'Last Updated', value: event.updatedAt ? new Date(event.updatedAt).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                    <span className="text-gray-400 font-semibold">{row.label}</span>
                    <span className="text-gray-600 font-mono text-xs">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* Description */}
          {event.description && (
            <div className="mb-8">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-2xl p-4 border border-gray-100">{event.description}</p>
            </div>
          )}
 
          {/* Ticket types */}
          {(event.ticketTypes ?? []).length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Ticket Types</p>
              <div className="space-y-2">
                {event.ticketTypes.map((tt: any) => (
                  <div key={tt.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{tt.name}</p>
                      <p className="text-xs text-gray-400">{tt.sold ?? 0} sold of {tt.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-green-600">KSH {(tt.price ?? 0).toLocaleString()}</p>
                      <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                        <div className="bg-green-500 h-1 rounded-full" style={{ width: `${tt.quantity > 0 ? Math.round(((tt.sold ?? 0) / tt.quantity) * 100) : 0}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 flex-wrap">
            <button onClick={onEdit} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm transition-all">
              Edit Event
            </button>
            <button onClick={onDelete} className="bg-red-50 hover:bg-red-100 text-red-600 py-3 px-6 rounded-xl font-bold text-sm transition-all border border-red-200">
              Delete
            </button>
            <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 px-6 rounded-xl font-bold text-sm transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
 
// ── Main Component ────────────────────────────────────────────
const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<LocalEventForm>({
    title: '', date: '', startTime: '', endTime: '',
    location: '', venue: '', category: '', description: '',
    status: 'DRAFT',
    ticketTypes: [{ id: 'new-0', name: '', price: 0, quantity: 0, sold: 0 }]
  });
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState<string>('ALL');
const [loadingEvents, setLoadingEvents] = useState(true);
 
  const { refreshSession } = useAuth();
  const hasLoadedRef = React.useRef(false);
 
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    const load = async () => {
  try {
    await refreshSession({ silent: true });
    const resp = await adminService.listEvents();
    setEvents(resp.data);
  } catch (err) {
    const status = (err as any)?.status;
    setError(status === 403 ? 'Admin access required.' : 'Failed to load events.');
  } finally {
    setLoadingEvents(false);
  }
};
    load();
  }, [refreshSession]);
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
      if (file.size > 4 * 1024 * 1024) { alert('File size cannot exceed 4MB.'); return; }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
 
  const handleTicketChange = (index: number, field: string, value: string | number) => {
    const updatedTickets = [...(formData.ticketTypes || [])];
    (updatedTickets[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, ticketTypes: updatedTickets }));
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    let payload: any = { ...formData };
    if (formData.date) {
      payload.date = new Date(formData.date).toISOString();
      if (formData.startTime) payload.startTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
      if (formData.endTime)   payload.endTime   = new Date(`${formData.date}T${formData.endTime}`).toISOString();
    }
    if (imageFile) {
      try {
        const imageBase64 = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload  = () => res((reader.result as string).split(',')[1]);
          reader.onerror = () => rej(new Error('Read failed'));
        });
        payload = { ...payload, imageBase64, imageName: imageFile.name };
        delete payload.imageUrl;
      } catch { alert('Error processing image.'); setSubmitLoading(false); return; }
    }
    try {
      if (editingEvent) {
        const updated = await adminService.updateEvent(editingEvent.id, payload);
        setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? updated : ev));
      } else {
        const created = await adminService.createEvent(payload);
        setEvents(prev => [...prev, created]);
      }
      resetForm();
    } catch { alert('Error saving event'); }
    finally { setSubmitLoading(false); }
  };
 
  const resetForm = () => {
    setFormData({ title: '', date: '', startTime: '', endTime: '', location: '', venue: '', category: '', description: '', status: 'DRAFT', ticketTypes: [{ id: 'new-0', name: '', price: 0, quantity: 0, sold: 0 }] });
    setEditingEvent(null); setShowForm(false); setImagePreview(''); setImageFile(null);
  };
 
  const editEvent = (event: Event) => {
    setFormData(event); setEditingEvent(event); setShowForm(true);
    setImagePreview(event.imageUrl || ''); setImageFile(null);
    setSelectedEvent(null);
  };
 
  const confirmDeleteEvent = (id: string) => { setConfirmDelete(id); setSelectedEvent(null); };
 
  const deleteEvent = async () => {
    if (!confirmDelete) return;
    try {
      await adminService.deleteEvent(confirmDelete);
      setEvents(prev => prev.filter(ev => ev.id !== confirmDelete));
      setConfirmDelete(null);
    } catch { alert('Error deleting event'); }
  };
 
  const statusColors: any = {
    PUBLISHED: 'bg-green-100 text-green-700',
    DRAFT:     'bg-yellow-100 text-yellow-700',
    CANCELLED: 'bg-red-100 text-red-600',
    ENDED:     'bg-gray-100 text-gray-500',
  };
 
  const filteredEvents = events.filter(ev => {
    const matchesSearch = !searchQuery || ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || (ev.venue ?? ev.location ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
 
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Event Management</h2>
          <p className="text-gray-400 text-sm mt-1">{events.length} total events on platform</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={submitLoading || showForm}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          + Create Event
        </button>
      </div>
 
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
 
      {/* Event Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h3 className="text-xl font-black text-gray-800 mb-6">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: 'Title', name: 'title', type: 'text', required: true, value: formData.title },
                { label: 'Location', name: 'location', type: 'text', required: true, value: formData.location },
                { label: 'Venue', name: 'venue', type: 'text', required: false, value: formData.venue ?? '' },
                { label: 'Date', name: 'date', type: 'date', required: true, value: formData.date },
                { label: 'Start Time', name: 'startTime', type: 'time', required: true, value: formData.startTime ?? '' },
                { label: 'End Time', name: 'endTime', type: 'time', required: true, value: formData.endTime ?? '' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input type={f.type} name={f.name} value={f.value} onChange={handleInputChange} required={f.required}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              ))}
            </div>
 
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea name="description" value={formData.description ?? ''} onChange={handleInputChange} required rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select Category</option>
                  {['Music','Technology','Sports','Art','Food','Comedy','Fashion','Business','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
 
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Event Image</label>
              {(imagePreview || formData.imageUrl) && (
                <img src={imagePreview || formData.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl mb-3" />
              )}
              <input type="file" name="imageFile" onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
              <div className="mt-3">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Or Image URL</label>
                <input type="url" name="imageUrl" value={formData.imageUrl || ''} onChange={handleInputChange} disabled={!!imageFile}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-40" />
              </div>
            </div>
 
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Ticket Types</label>
              {formData.ticketTypes?.map((ticket, index) => (
                <div key={index} className="flex gap-3 mb-3 p-4 bg-gray-50 border border-gray-200 rounded-xl items-center">
                  <input type="text" placeholder="Name (e.g. General)" value={(ticket as any).name || ''} onChange={e => handleTicketChange(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <input type="number" placeholder="Price" value={ticket.price || ''} onChange={e => handleTicketChange(index, 'price', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <input type="number" placeholder="Qty" value={ticket.quantity || ''} onChange={e => handleTicketChange(index, 'quantity', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <button type="button" onClick={() => {
                    setFormData(prev => ({ ...prev, ticketTypes: (prev.ticketTypes || []).filter((_, i) => i !== index) }));
                  }} className="text-red-400 hover:text-red-600 text-lg font-bold px-1">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, ticketTypes: [...(prev.ticketTypes || []), { id: `new-${(prev.ticketTypes || []).length}`, name: '', price: 0, quantity: 0, sold: 0 }] }))}
                className="text-green-600 hover:text-green-700 text-sm font-bold">
                + Add Ticket Type
              </button>
            </div>
 
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-all">
                {submitLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {submitLoading ? (editingEvent ? 'Updating…' : 'Creating…') : (editingEvent ? 'Update Event' : 'Create Event')}
              </button>
              <button type="button" onClick={resetForm} disabled={submitLoading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
 
      {/* Search + Filter */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search events…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PUBLISHED', 'DRAFT', 'ENDED', 'CANCELLED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${statusFilter === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
 
      {/* Events Grid */}
      {loadingEvents ? (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {[1,2,3,4].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
  </div>
) : filteredEvents.length === 0 ? (
  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
    <p className="text-gray-400 font-medium">No events found</p>
  </div>
) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEvents.map(event => {
            const totalCap  = (event.ticketTypes ?? []).reduce((s, t) => s + (t.quantity ?? 0), 0);
            const totalSold = (event.ticketTypes ?? []).reduce((s, t) => s + (t.sold ?? 0), 0);
            const fillRate  = totalCap > 0 ? Math.round((totalSold / totalCap) * 100) : 0;
            const dateStr   = event.startTime ?? event.date;
 
            return (
              <div key={event.id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-gray-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex gap-4 p-5">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl text-gray-300">🎪</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-black text-gray-900 text-sm truncate group-hover:text-green-700 transition-colors">{event.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black flex-shrink-0 ${statusColors[event.status] ?? 'bg-gray-100 text-gray-500'}`}>{event.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {dateStr ? new Date(dateStr).toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                      {(event.venue ?? event.location) ? ` · ${event.venue ?? event.location}` : ''}
                    </p>
                    {event.category && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{event.category}</span>}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{totalSold}/{totalCap} tickets</span>
                        <span>{fillRate}% filled</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${fillRate >= 70 ? 'bg-green-500' : fillRate >= 30 ? 'bg-yellow-400' : 'bg-gray-300'}`} style={{ width: `${fillRate}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-4 flex gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => editEvent(event)}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-bold transition-all border border-gray-200">
                    Edit
                  </button>
                  <button onClick={() => confirmDeleteEvent(event.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-500 py-2 px-4 rounded-lg text-xs font-bold transition-all border border-red-100">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
 
      {/* Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => editEvent(selectedEvent)}
          onDelete={() => confirmDeleteEvent(selectedEvent.id)}
        />
      )}
 
      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Event?"
          message={`Are you sure you want to permanently delete "${events.find(e => e.id === confirmDelete)?.title ?? 'this event'}"? This action cannot be undone and will remove all associated data.`}
          onConfirm={deleteEvent}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};
 
export default EventManagement;
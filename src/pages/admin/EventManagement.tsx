import React, { useState, useEffect } from 'react';
import { Event, TicketType } from '../../utilities/types';
import * as eventService from '../../services/eventService';
import * as adminService from '../../services/adminService';
import { useAuth } from '../../utilities/AuthContext';

interface LocalEventForm extends Omit<Partial<Event>, 'ticketTypes'> {
  ticketTypes?: Array<Partial<TicketType>>;
}

const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<LocalEventForm>({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    venue: '',
    category: '',
    description: '',
    status: 'DRAFT',
    ticketTypes: [{ name: '', price: 0, quantity: 0, sold: 0 }]
  });
  const [error, setError] = useState<string | null>(null);

  const { refreshSession } = useAuth();
  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    // only run once (avoid loops caused by user object changes)
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const load = async () => {
      try {
        // ensure token is refreshed so role changes are reflected
        await refreshSession({ silent: true });

        // admin endpoint returns all events (including drafts/cancelled)
        const resp = await adminService.listAdminEvents();
        setEvents(resp.data);
      } catch (err) {
        console.error('Failed to load events', err);
        const status = (err as any)?.status;
        if (status === 403) {
          setError('Admin access required. Please ensure your account has admin privileges.');
        } else {
          setError('Failed to load events. Please try again later.');
        }
      }
    };
    load();
  }, [refreshSession]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTicketChange = (index: number, field: string, value: string | number) => {
    const updatedTickets = [...(formData.ticketTypes || [])];
    updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    setFormData(prev => ({ ...prev, ticketTypes: updatedTickets }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...(prev.ticketTypes || []), { name: '', price: 0, quantity: 0, sold: 0 }]
    }));
  };

  const removeTicketType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: (prev.ticketTypes || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        const updated = await eventService.updateEvent(editingEvent.id, formData as Partial<Event>);
        setEvents(prev => prev.map(ev => ev.id === updated.id ? updated : ev));
      } else {
        const created = await eventService.createEvent(formData as Partial<Event>);
        setEvents(prev => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save event', err);
      alert('Error saving event');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      venue: '',
      category: '',
      description: '',
      status: 'DRAFT',
      ticketTypes: [{ name: '', price: 0, quantity: 0, sold: 0 }]
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const editEvent = (event: Event) => {
    setFormData(event);
    setEditingEvent(event);
    setShowForm(true);
  };

  const deleteEvent = async (id: string | number) => {
    try {
      await eventService.deleteEvent(id.toString());
      setEvents(prev => prev.filter(ev => ev.id !== id));
    } catch (err) {
      console.error('Failed to delete event', err);
      alert('Error deleting event');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Event Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Create New Event
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Event Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-6">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime ?? ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime ?? ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue ?? ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Category</option>
                  <option value="Music">Music</option>
                  <option value="Technology">Technology</option>
                  <option value="Sports">Sports</option>
                  <option value="Art">Art</option>
                  <option value="Food">Food</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Ticket Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Ticket Types</label>
              {formData.ticketTypes?.map((ticket, index) => (
                <div key={index} className="flex gap-4 mb-4 p-4 border border-gray-200 rounded-md">
                  <input
                    type="text"
                    placeholder="Name (e.g., General)"
                    value={(ticket as any).name || ''}
                    onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={ticket.price}
                    onChange={(e) => handleTicketChange(index, 'price', parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={ticket.quantity}
                    onChange={(e) => handleTicketChange(index, 'quantity', parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeTicketType(index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTicketType}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                + Add Ticket Type
              </button>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map(event => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-500">{event.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(() => {
                    const dateString = event.startTime ?? event.date;
                    return dateString ? new Date(dateString).toLocaleDateString() : 'TBD';
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.venue ?? event.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => editEvent(event)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventManagement;
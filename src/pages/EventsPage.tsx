import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../utilities/types';
import * as eventService from '../services/eventService';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await eventService.listEvents();
        setEvents(resp.data);
        setFilteredEvents(resp.data);
      } catch (err) {
        console.error('Failed to load events', err);
      }
    };
    load();
  }, []);

  const categories = ['All', ...Array.from(new Set(events.map(e => e.category)))];

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    filterEvents(category, dateFilter);
  };

  const handleDateFilter = (date: string) => {
    setDateFilter(date);
    filterEvents(categoryFilter, date);
  };

  const filterEvents = (category: string, date: string) => {
    let filtered = events;
    if (category !== 'All') {
      filtered = filtered.filter(e => e.category === category);
    }
    if (date) {
      filtered = filtered.filter(e => {
        const eventDate = e.startTime ?? e.date ?? '';
        return eventDate >= date;
      });
    }
    setFilteredEvents(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Events</h1>
          <nav className="mt-4">
            <Link to="/" className="text-green-600 hover:text-green-800">Home</Link>
          </nav>
        </div>
      </header>

      {/* Filters */}
      <section className="bg-white py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => {
              const firstPrice = event.ticketTypes?.[0]?.price;
              const eventStart = event.startTime ?? event.date;
              const venue = event.venue ?? event.location;

              return (
                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{event.title}</h3>
                    <p className="text-gray-600 mb-2">{venue}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {eventStart
                        ? new Date(eventStart).toLocaleString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Date TBD'}
                    </p>
                    <div className="flex justify-between items-center">
                      {firstPrice != null && (
                        <span className="text-green-600 font-semibold">
                          KSH {firstPrice.toLocaleString()} {event.ticketTypes.length > 1 ? 'and up' : ''}
                        </span>
                      )}
                      <Link
                        to={`/events/${event.id}`}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events found matching your filters.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
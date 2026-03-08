import React from 'react';
import { Link } from 'react-router-dom';
import * as eventService from '../services/historyService';
import { Event } from '../utilities/types';

const FeaturedEvents: React.FC = () => {
  const [events, setEvents] = React.useState<Event[]>([]);
  React.useEffect(() => {
    const load = async () => {
      try {
        const resp = await eventService.listAllevents();
        setEvents(resp.data.slice(0, 6));
      } catch (err) {
        setEvents([]);
      }
    };
    load();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {events.map(event => {
          const firstPrice = event.ticketTypes?.[0]?.price;
          const eventStart = event.startTime ?? event.date;
          const venue = event.venue ?? event.location;
          return (
            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
              <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-semibold mb-2 text-green-700">{event.title}</h3>
                <p className="text-gray-600 mb-4">{venue}</p>
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
                <div className="flex justify-between items-center mt-auto">
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
      <div className="text-center mt-12">
        <Link
          to="/events"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
        >
          View All Events
        </Link>
      </div>
    </>
  );
};

export default FeaturedEvents;

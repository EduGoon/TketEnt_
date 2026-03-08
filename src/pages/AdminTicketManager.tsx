import React, { useEffect, useState } from 'react';
import * as adminService from '../services/adminService';

const AdminTicketManager: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getTickets();
        setTickets(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch tickets');
        setTickets([]);
      }
      setLoading(false);
    }
    fetchTickets();
  }, []);

  if (loading) return <div>Loading tickets...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tickets</h2>
      {tickets.length === 0 ? (
        <div className="text-gray-500">No tickets found.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {tickets.map((ticket: any, idx: number) => (
            <li key={ticket.id || idx} className="py-2 flex justify-between">
              <span>{ticket.eventId || 'Ticket'}</span>
              <span className="text-xs text-gray-500">{ticket.status || ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminTicketManager;
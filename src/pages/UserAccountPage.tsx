import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';
import { Ticket } from '../utilities/types';
import TicketCard from '../components/TicketCard';
import * as ticketService from '../services/ticketService';

const UserAccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [printTicketId, setPrintTicketId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const resp = await ticketService.listUserTickets();
        setTickets(resp.data);
      } catch (err) {
        console.error('Failed to load tickets', err);
      }
    };
    load();
  }, []);

  React.useEffect(() => {
    if (!printTicketId) return;
    window.print();
    const reset = window.setTimeout(() => setPrintTicketId(null), 1000);
    return () => window.clearTimeout(reset);
  }, [printTicketId]);

  const currentUser = user;
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm print:hidden">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">My Account</h1>
          <p className="text-gray-600">Welcome, {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest'}</p>
          <nav className="mt-4">
            <Link to="/" className="text-green-600 hover:text-green-800">Home</Link>
            {user && (
              <button onClick={logout} className="ml-4 text-red-600 hover:text-red-800">
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className={`lg:col-span-1 ${printTicketId ? 'print:hidden' : ''}`}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Account Menu</h2>
              <nav className="space-y-2">
                <a href="#tickets" className="block text-green-600 font-medium">My Tickets</a>
                <a href="#profile" className="block text-gray-600 hover:text-green-600">Profile Settings</a>
                <a href="#preferences" className="block text-gray-600 hover:text-green-600">Preferences</a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* My Tickets */}
            <section id="tickets" className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">My Tickets</h2>
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      printMode={Boolean(printTicketId)}
                      isPrintTarget={printTicketId === ticket.id}
                      onRequestPrint={setPrintTicketId}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't purchased any tickets yet.</p>
                  <Link to="/events" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md">
                    Browse Events
                  </Link>
                </div>
              )}
            </section>

            {/* Profile Settings Placeholder */}
            <section id="profile" className={`bg-white rounded-lg shadow-md p-6 ${printTicketId ? 'print:hidden' : ''}`}>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Profile Settings</h2>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Profile settings functionality coming soon...</p>
                <p className="text-gray-400 text-sm mt-2">Update your personal information and preferences</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccountPage;
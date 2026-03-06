import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';
import EventManagement from './admin/EventManagement';
import SponsorManagement from './admin/SponsorManagement';
import Analytics from './admin/Analytics';
import * as adminService from '../services/adminService';

interface Metrics {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const { user, logout, refreshSession } = useAuth();

  useEffect(() => {
    // optionally, can log user or token here for debug
  }, [user]);

  const [metrics, setMetrics] = useState<Metrics>({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        // ensure the token is refreshed so role changes are reflected
        await refreshSession({ silent: true });

        const data = await adminService.getAnalytics();
        const totals = data.data.reduce<Metrics>(
          (acc, row) => {
            acc.totalEvents += 1;
            acc.totalTicketsSold += row.totalTicketsSold ?? 0;
            acc.totalRevenue += row.totalRevenue ?? 0;
            return acc;
          },
          { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0 }
        );
        setMetrics(totals);
      } catch (e) {
        console.error('failed to fetch analytics', e);
      }
    };
    load();
  }, [refreshSession]);

  // Demo admin data for presentation
  const demoAdmin = {
    firstName: 'Admin',
    lastName: 'Demo',
    email: 'admin@sparkvybzent.com'
  };

  const currentUser = user || demoAdmin;

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/events', label: 'Events', icon: '🎪' },
    { path: '/admin/sponsors', label: 'Sponsors', icon: '🤝' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">SparkVybzEnt Admin</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {currentUser.firstName} {currentUser.lastName} {user && `(${user.role})`}</span>
            <Link to="/" className="text-green-600 hover:text-green-800">← Public Site</Link>
            {user && (
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <nav className="mt-8">
            <ul className="space-y-2 px-4">
              {navItems.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                      location.pathname === item.path
                        ? 'bg-green-100 text-green-800 border-r-4 border-green-500'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<DashboardHome metrics={metrics} />} />
            <Route path="/events" element={<EventManagement />} />
            <Route path="/sponsors" element={<SponsorManagement />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

interface DashboardHomeProps {
  metrics: Metrics;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ metrics }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Events</h3>
          <p className="text-3xl font-bold text-green-600">{metrics.totalEvents ?? '-'}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Tickets Sold</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics.totalTicketsSold ?? '-'}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-yellow-600">{metrics.totalRevenue ? `KSH ${metrics.totalRevenue.toLocaleString()}` : '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';
import EventManagement from './admin/EventManagement';
import AdminFavoritesManager from './AdminFavoritesManager';
import AdminReviewManager from './AdminReviewManager';
import AdminChatManager from './AdminChatManager';
import AdminTicketManager from './AdminTicketManager';
import AdminBlogManager from './AdminBlogManager';
import AdminUserManager from './AdminUserManager';
import AdminAnalyticsManager from './AdminAnalyticsManager';
import AdminSponsorManager from './AdminSponsorManager';
import AdminNewsletterManager from './AdminNewsletterManager';

interface Metrics {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    // optionally, can log user or token here for debug
  }, [user]);

  const [metrics] = useState<Metrics>({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0
  });

  // Demo admin data for presentation
  const demoAdmin = {
    firstName: 'Admin',
    lastName: 'Demo',
    email: 'admin@sparkvybzent.com'
  };

  const currentUser = user || demoAdmin;

  const navItems = [
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { path: '/admin/events', label: 'Events', icon: '🎪' },
    { path: '/admin/sponsors', label: 'Sponsors', icon: '🤝' },
    { path: '/admin/favorites', label: 'Favorites', icon: '⭐' },
    { path: '/admin/reviews', label: 'Reviews', icon: '📝' },
    { path: '/admin/chats', label: 'Chats', icon: '💬' },
    { path: '/admin/newsletter', label: 'Newsletter', icon: '📧' },
    { path: '/admin/blogs', label: 'Blogs', icon: '📰' },
    { path: '/admin/users', label: 'User Records', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">SparkVybzEnt Admin</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {currentUser.firstName} {currentUser.lastName} {user && `(${user.role})`}</span>
            <span className="text-gray-600">Events: {metrics.totalEvents}</span>
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
            <Route path="/analytics" element={<AdminAnalyticsManager />} />
            <Route path="/events" element={<EventManagement />} />
            <Route path="/sponsors" element={<AdminSponsorManager />} />
            <Route path="/favorites" element={<AdminFavoritesManager />} />
            <Route path="/reviews" element={<AdminReviewManager />} />
            <Route path="/chats" element={<AdminChatManager />} />
            <Route path="/newsletter" element={<AdminNewsletterManager />} />
            <Route path="/blogs" element={<AdminBlogManager />} />
            <Route path="/tickets" element={<AdminTicketManager />} />
            <Route path="/users" element={<AdminUserManager />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
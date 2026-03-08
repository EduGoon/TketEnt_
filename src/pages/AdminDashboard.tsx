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


// Generic admin section for new endpoints
const AdminSection: React.FC<{ type: string }> = ({ type }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshSession } = useAuth();
  const hasLoadedRef = React.useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    let cancelled = false;
    setLoading(true);
    setError(null);
    if (!user || user.role !== 'ADMIN') {
      setError('Admin access required. Please ensure your account has admin privileges.');
      setLoading(false);
      return;
    }
    async function fetchData() {
      console.log(`AdminSection [${type}] fetchData called`);
      let res;
      try {
        await refreshSession({ silent: true });
        if (cancelled) return;
        switch (type) {
          case 'favorites': res = await adminService.getFavorites(); break;
          case 'reviews': res = await adminService.getReviews(); break;
          case 'chats': res = await adminService.getChats(); break;
          case 'newsletter': res = await adminService.getNewsletterSubscribers(); break;
          case 'blogs': res = await adminService.getBlogs(); break;
          case 'users': res = []; break; // No users endpoint in new features spec
          default: res = [];
        }
        if (cancelled) return;
        console.log(`AdminSection [${type}] response:`, res);
        if (Array.isArray(res)) {
          setData(res);
        } else if (res && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setData([]);
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || 'Failed to fetch data');
        setData([]);
      }
      setLoading(false);
    }
    fetchData();
    return () => { cancelled = true; };
  }, [type]);

  if (loading) return <div>Loading {type}...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  // Custom rendering for newsletter, blogs, users
  if (type === 'newsletter') {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Newsletter Signups</h2>
        {data.length === 0 ? (
          <div className="text-gray-500">No newsletter signups found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data.map((entry: any) => (
              <li key={entry.id} className="py-2 flex justify-between">
                <span>{entry.email}</span>
                <span className="text-xs text-gray-500">{new Date(entry.signedUpAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  if (type === 'blogs') {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Blogs Management</h2>
        {data.length === 0 ? (
          <div className="text-gray-500">No blogs found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data.map((blog: any) => (
              <li key={blog.id} className="py-2 flex justify-between">
                <span>{blog.title}</span>
                <span className="text-xs text-gray-500">{blog.status}</span>
                <button className="ml-4 px-2 py-1 bg-blue-500 text-white rounded-md" onClick={() => adminService.publishBlog(blog.id)}>Publish</button>
                <button className="ml-2 px-2 py-1 bg-gray-500 text-white rounded-md" onClick={() => adminService.unpublishBlog(blog.id)}>Unpublish</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  if (type === 'users') {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">User Records</h2>
        {data.length === 0 ? (
          <div className="text-gray-500">No users found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data.map((user: any) => (
              <li key={user.id} className="py-2 flex justify-between">
                <span>{user.firstName} {user.lastName} ({user.email})</span>
                <span className="text-xs text-gray-500">Role: {user.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Favorites, reviews, chats: show empty state and avoid raw JSON
  if (type === 'favorites') {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Favorites</h2>
        {data.length === 0 ? (
          <div className="text-gray-500">No favorites found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data.map((fav: any, idx: number) => (
              <li key={fav.id || idx} className="py-2 flex justify-between">
                <span>{fav.title || fav.name || fav.eventId || 'Favorite'}</span>
                <span className="text-xs text-gray-500">{fav.date ? new Date(fav.date).toLocaleString() : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  if (type === 'reviews') {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        {data.length === 0 ? (
          <div className="text-gray-500">No reviews found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data.map((rev: any, idx: number) => (
              <li key={rev.id || idx} className="py-2 flex justify-between">
                <span>{rev.comment || rev.text || 'Review'}</span>
                <span className="text-xs text-gray-500">{rev.rating ? `Rating: ${rev.rating}` : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  if (type === 'chats') {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Chats</h2>
        {data.length === 0 ? (
          <div className="text-gray-500">No chats found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data.map((chat: any, idx: number) => (
              <li key={chat.id || idx} className="py-2 flex justify-between">
                <span>{chat.message || chat.text || 'Chat'}</span>
                <span className="text-xs text-gray-500">{chat.sender || ''}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Default: show empty state
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{type.charAt(0).toUpperCase() + type.slice(1)} Records</h2>
      <div className="text-gray-500">No records found.</div>
    </div>
  );
};

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
            <Route path="/" element={<DashboardHome metrics={metrics} />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/events" element={<EventManagement />} />
            <Route path="/sponsors" element={<SponsorManagement />} />
            <Route path="/favorites" element={<AdminSection type="favorites" />} />
            <Route path="/reviews" element={<AdminSection type="reviews" />} />
            <Route path="/chats" element={<AdminSection type="chats" />} />
            <Route path="/newsletter" element={<AdminSection type="newsletter" />} />
            <Route path="/blogs" element={<AdminSection type="blogs" />} />
            <Route path="/users" element={<AdminSection type="users" />} />
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
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';
import { 
  ChartBarIcon, 
  TicketIcon, 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon, 
  NewspaperIcon, 
  StarIcon, 
  HandRaisedIcon,
  ArrowLeftOnRectangleIcon,
  GlobeAltIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

import EventManagement from './admin/EventManagement';
import AdminReviewManager from './AdminReviewManager';
import AdminChatManager from './AdminChatManager';
import AdminTicketManager from './AdminTicketManager';
import AdminBlogManager from './AdminBlogManager';
import AdminUserManager from './AdminUserManager';
import AdminAnalyticsManager from './AdminAnalyticsManager';
import AdminSponsorManager from './AdminSponsorManager';
import AdminApplicationsManager from './AdminApplicationsManager';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/admin/analytics',    label: 'Analytics',         icon: ChartBarIcon },
    { path: '/admin/events',       label: 'Events',            icon: TicketIcon },
    { path: '/admin/applications', label: 'Applications',      icon: ClipboardDocumentCheckIcon },
    { path: '/admin/sponsors',     label: 'Sponsors',          icon: HandRaisedIcon },
    { path: '/admin/reviews',      label: 'Reviews & Favs',    icon: StarIcon },
    { path: '/admin/chats',        label: 'Chats',             icon: ChatBubbleLeftRightIcon },
    { path: '/admin/blogs',        label: 'Blogs',             icon: NewspaperIcon },
    { path: '/admin/users',        label: 'User Records',      icon: UserGroupIcon },
  ];

  return (
    <>
      {/* Mobile gate */}
      <div className="flex lg:hidden min-h-screen items-center justify-center bg-gray-950 px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-6">🖥️</div>
          <h1 className="text-2xl font-black text-white mb-3 tracking-tight">Desktop Required</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            The admin dashboard is designed for desktop use. Please open it on a laptop or desktop browser.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-500 transition-colors">
            <GlobeAltIcon className="h-4 w-4" />
            Back to Public Site
          </Link>
        </div>
      </div>

      {/* Full dashboard */}
      <div className="hidden lg:flex min-h-screen bg-gray-50 flex-col">
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="flex justify-between items-center px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <div className="h-6 w-6 text-white font-black flex items-center justify-center">S</div>
              </div>
              <h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{user?.role || 'ADMIN'}</p>
              </div>
              <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-bold transition-colors">
                <GlobeAltIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Public Site</span>
              </Link>
              <button onClick={logout} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-all">
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <aside className="w-72 bg-white border-r sticky top-20 h-[calc(100vh-80px)]">
            <nav className="p-6">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                          isActive
                            ? 'bg-green-600 text-white shadow-lg shadow-green-100'
                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <main className="flex-1 p-10 bg-gray-50/50">
            <Routes>
              <Route index element={<Navigate to="/admin/analytics" replace />} />
              <Route path="/analytics"    element={<AdminAnalyticsManager />} />
              <Route path="/events"       element={<EventManagement />} />
              <Route path="/applications" element={<AdminApplicationsManager />} />
              <Route path="/sponsors"     element={<AdminSponsorManager />} />
              <Route path="/reviews"      element={<AdminReviewManager />} />
              <Route path="/chats"        element={<AdminChatManager />} />
              <Route path="/blogs"        element={<AdminBlogManager />} />
              <Route path="/tickets"      element={<AdminTicketManager />} />
              <Route path="/users"        element={<AdminUserManager />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
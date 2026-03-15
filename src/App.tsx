import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './utilities/AuthContext';
import PrivateRoute from './utilities/PrivateRoute';
import LandingPage from './pages/LandingPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import UserAccountPage from './pages/UserAccountPage';
import AdminDashboard from './pages/AdminDashboard';
import BlogPage from './pages/BlogPage';
import AdminBlogManager from './pages/AdminBlogManager';
import OrganizerDashboard from './pages/OrganizerDashboard';
import ApplyOrganizerPage from './pages/ApplyOrganizerPage';
import LiveChatWidget from './components/LiveChatWidget';
import PageTransition from './components/PageTransition';
import TermsPage from './pages/TermsPage';
import OrganizerProfilePage from './pages/OrganizerProfilePage';

function App() {
  const location = useLocation();
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <PageTransition locationKey={location.key}>
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/terms/:type" element={<TermsPage />} />
            <Route path="/account" element={
              <PrivateRoute>
                <UserAccountPage />
              </PrivateRoute>
            } />
            <Route path="/apply-organizer" element={
              <PrivateRoute>
                <ApplyOrganizerPage />
              </PrivateRoute>
            } />
            <Route path="/the-hub" element={<BlogPage />} />
            <Route path="/admin/blog-manager" element={<AdminBlogManager />} />
            <Route path="/admin/*" element={
              <PrivateRoute adminOnly>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/organizer/*" element={
              <PrivateRoute organizerOnly>
                <OrganizerDashboard />
              </PrivateRoute>
            } />
<Route path="/host/:id" element={<OrganizerProfilePage />} />
          </Routes>
        </PageTransition>
        <LiveChatWidget />
      </div>
    </AuthProvider>
  );
}

export default App;
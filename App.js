
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.js';
import Navigation from './components/Navigation.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import DashboardPage from './pages/DashboardPage.js';
import LeaderboardPage from './pages/LeaderboardPage.js';
import ProfilePage from './pages/ProfilePage.js';
import NotFoundPage from './pages/NotFoundPage.js';

import AdminLayout from './components/AdminLayout.js'; // Import AdminLayout
import AdminDashboardPage from './pages/admin/AdminDashboardPage.js';
import AdminManageSetsPage from './pages/admin/AdminManageSetsPage.js';
import AdminManageBouldersPage from './pages/admin/AdminManageBouldersPage.js';
import { APP_NAME } from './constants';

const ProtectedRoute: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  // Wrap protected routes with standard navigation and footer
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="py-4 bg-gray-800 text-center text-sm text-gray-400">
        {APP_NAME} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

const AdminRoutesContainer: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (!currentUser.isAdmin) {
    return <Navigate to="/dashboard" replace />; 
  }
  // AdminLayout provides its own structure, including an <Outlet /> for its child routes.
  // The child routes (e.g., AdminDashboardPage) will be rendered into AdminLayout's internal <Outlet />.
  // FIX: Render AdminLayout directly. It should not be passed explicit children as it handles its own content rendering via an internal Outlet.
  return <AdminLayout />;
};

const App: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Public routes, no main layout */}
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <div className="min-h-screen flex flex-col justify-center bg-gray-900 text-gray-100"><LoginPage /></div>} />
      <Route path="/register" element={currentUser ? <Navigate to="/dashboard" /> : <div className="min-h-screen flex flex-col justify-center bg-gray-900 text-gray-100"><RegisterPage /></div>} />
      
      {/* Protected user routes with standard layout */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin routes with AdminLayout */}
      <Route element={<AdminRoutesContainer />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/sets" element={<AdminManageSetsPage />} />
        <Route path="/admin/boulders" element={<AdminManageBouldersPage />} />
      </Route>
      
      <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<div className="min-h-screen flex flex-col justify-center bg-gray-900 text-gray-100"><NotFoundPage /></div>} />
    </Routes>
  );
};

export default App;
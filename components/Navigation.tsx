import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../constants';
import { MountainIcon, UserIcon, LogoutIcon, LoginIcon, UserPlusIcon, ClipboardListIcon, TrophyIcon, CogIcon } from './icons';

const Navigation: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors">
            <MountainIcon className="h-8 w-8 mr-2" />
            <span className="font-bold text-xl">{APP_NAME}</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {currentUser ? (
              <>
                <NavLink to="/dashboard">
                  <ClipboardListIcon className="h-5 w-5 mr-1" />
                  <span className="hidden sm:inline">Dashboard</span>
                </NavLink>
                <NavLink to="/leaderboard">
                  <TrophyIcon className="h-5 w-5 mr-1" />
                  <span className="hidden sm:inline">Leaderboard</span>
                </NavLink>
                <NavLink to="/profile">
                  <UserIcon className="h-5 w-5 mr-1" />
                  <span className="hidden sm:inline">Profile</span>
                </NavLink>
                {currentUser.isAdmin && (
                  <NavLink to="/admin/dashboard"> {/* Corrected path */}
                    <CogIcon className="h-5 w-5 mr-1" />
                    <span className="hidden sm:inline">Admin Panel</span>
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-label="Logout"
                >
                  <LogoutIcon className="h-5 w-5 sm:mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">
                  <LoginIcon className="h-5 w-5 mr-1" /> Login
                </NavLink>
                <NavLink to="/register">
                  <UserPlusIcon className="h-5 w-5 mr-1" /> Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => (
  <Link
    to={to}
    className="flex items-center text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
  >
    {children}
  </Link>
);


export default Navigation;

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { MountainIcon, CogIcon, ClipboardListIcon as BoulderIcon, HomeIcon } from './icons.js'; // Using HomeIcon for Admin Dashboard

const AdminLayout: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 p-4 space-y-4 shadow-lg flex flex-col">
        <div className="flex items-center text-emerald-400 mb-6">
          <MountainIcon className="h-8 w-8 mr-2" />
          <span className="font-bold text-xl">{APP_NAME} Admin</span>
        </div>
        <nav className="flex-grow">
          <NavLink to="/admin/dashboard" className={navLinkClass}>
            <HomeIcon className="h-5 w-5 mr-3" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/sets" className={navLinkClass}>
            <CogIcon className="h-5 w-5 mr-3" />
            Manage Sets
          </NavLink>
          <NavLink to="/admin/boulders" className={navLinkClass}>
            <BoulderIcon className="h-5 w-5 mr-3" />
            Manage Boulders
          </NavLink>
        </nav>
        <div className="mt-auto">
            <NavLink
                to="/dashboard"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Exit Admin
            </NavLink>
        </div>
      </aside>
      <main className="flex-grow p-6 bg-gray-900 text-gray-100 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
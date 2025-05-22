import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import { CogIcon, ClipboardListIcon } from '../../components/icons'; // Assuming ClipboardListIcon for boulders

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-emerald-400">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Manage Boulder Sets">
          <p className="text-gray-300 mb-4">
            Create, view, and activate boulder sets. The active set determines which boulders are available for users to log.
          </p>
          <Link
            to="/admin/sets"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500 transition-colors"
          >
            <CogIcon className="h-5 w-5 mr-2" />
            Go to Set Management
          </Link>
        </Card>

        <Card title="Manage Boulders">
          <p className="text-gray-300 mb-4">
            Add new boulders to existing sets, including their grade, points, and image URLs.
          </p>
          <Link
            to="/admin/boulders"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500 transition-colors"
          >
            <ClipboardListIcon className="h-5 w-5 mr-2" />
            Go to Boulder Management
          </Link>
        </Card>
      </div>
      {/* Future admin features can be added here */}
    </div>
  );
};

export default AdminDashboardPage;
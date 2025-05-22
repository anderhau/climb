
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card.js';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="text-center">
        <h1 className="text-6xl font-bold text-emerald-500">404</h1>
        <p className="text-2xl text-gray-300 mt-4">Page Not Found</p>
        <p className="text-gray-400 mt-2">Oops! The page you're looking for doesn't seem to exist.</p>
        <Link
          to="/"
          className="mt-6 inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Go to Homepage
        </Link>
      </Card>
    </div>
  );
};

export default NotFoundPage;
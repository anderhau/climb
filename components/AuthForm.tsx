
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface AuthFormProps {
  formType: 'login' | 'register';
  onSubmit: (userId: string, password_do_not_use_in_prod: string) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({ formType, onSubmit, loading, errorMessage }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) {
        // Basic validation, can be enhanced
        alert("User ID and password cannot be empty.");
        return;
    }
    onSubmit(userId, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-gray-800 shadow-xl rounded-lg max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center text-emerald-400">
        {formType === 'login' ? 'Welcome Back!' : 'Create Account'}
      </h2>
      
      {errorMessage && (
        <div className="bg-red-500/20 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm" role="alert">
          {errorMessage}
        </div>
      )}

      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-1">
          User ID
        </label>
        <input
          id="userId"
          name="userId"
          type="text"
          autoComplete="username"
          required
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-700 text-gray-100"
          placeholder="Enter your User ID"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={formType === 'login' ? "current-password" : "new-password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-700 text-gray-100"
          placeholder="Enter your password"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <LoadingSpinner /> : (formType === 'login' ? 'Sign In' : 'Register')}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;

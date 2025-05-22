
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import AuthForm from '../components/AuthForm.js';

const LoginPage: React.FC = () => {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (userId: string, password_do_not_use_in_prod: string) => {
    setErrorMessage(null);
    const success = await login(userId, password_do_not_use_in_prod);
    if (success) {
      navigate('/dashboard');
    } else {
      setErrorMessage('Login failed. Please check your User ID and password.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AuthForm
        formType="login"
        onSubmit={handleLogin}
        loading={authLoading}
        errorMessage={errorMessage}
      />
      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
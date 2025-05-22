
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import AuthForm from '../components/AuthForm.js';

const RegisterPage: React.FC = () => {
  const { register, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (userId: string, password_do_not_use_in_prod: string) => {
    setErrorMessage(null);
    const success = await register(userId, password_do_not_use_in_prod);
    if (success) {
      navigate('/dashboard');
    } else {
      setErrorMessage('Registration failed. User ID might already exist or an error occurred.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AuthForm
        formType="register"
        onSubmit={handleRegister}
        loading={authLoading}
        errorMessage={errorMessage}
      />
      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
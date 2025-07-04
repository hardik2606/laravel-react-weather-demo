import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Simple toast component (for future use, not needed for field errors)
const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50">
    {message}
    <button className="ml-4 text-white font-bold" onClick={onClose}>×</button>
  </div>
);

const AuthCard: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Register fields and errors
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regErrors, setRegErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [regServerError, setRegServerError] = useState('');

  // Login fields and errors
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [loginServerError, setLoginServerError] = useState('');

  // State
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Email validation
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Login button enabled only if valid email and password
  const isLoginDisabled =
    loading ||
    !loginEmail ||
    !loginPassword ||
    !isValidEmail(loginEmail);

  // Register button enabled only if all fields filled and passwords match
  const isRegisterDisabled =
    loading ||
    !name ||
    !regEmail ||
    !regPassword ||
    !confirmPassword ||
    regPassword !== confirmPassword ||
    !isValidEmail(regEmail);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginServerError('');
    let errors: typeof loginErrors = {};
    if (!loginEmail) errors.email = 'Email is required.';
    else if (!isValidEmail(loginEmail)) errors.email = 'Please enter a valid email address.';
    if (!loginPassword) errors.password = 'Password is required.';
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setLoginServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegServerError('');
    let errors: typeof regErrors = {};
    if (!name) errors.name = 'Name is required.';
    if (!regEmail) errors.email = 'Email is required.';
    else if (!isValidEmail(regEmail)) errors.email = 'Please enter a valid email address.';
    if (!regPassword) errors.password = 'Password is required.';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';
    else if (regPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    setRegErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await register(name, regEmail, regPassword, confirmPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setRegServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers to clear field errors on change
  const handleLoginEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginEmail(e.target.value);
    setLoginErrors(errors => ({ ...errors, email: undefined }));
    setLoginServerError('');
  };
  const handleLoginPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginPassword(e.target.value);
    setLoginErrors(errors => ({ ...errors, password: undefined }));
    setLoginServerError('');
  };
  const handleRegNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setRegErrors(errors => ({ ...errors, name: undefined }));
    setRegServerError('');
  };
  const handleRegEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegEmail(e.target.value);
    setRegErrors(errors => ({ ...errors, email: undefined }));
    setRegServerError('');
  };
  const handleRegPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegPassword(e.target.value);
    setRegErrors(errors => ({ ...errors, password: undefined, confirmPassword: undefined }));
    setRegServerError('');
  };
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setRegErrors(errors => ({ ...errors, confirmPassword: undefined }));
    setRegServerError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Tabs */}
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 rounded-t-xl font-semibold transition ${tab === 'login' ? 'bg-purple-200 text-gray-900' : 'bg-gray-100 text-gray-400'}`}
            onClick={() => setTab('login')}
          >
            Log In
          </button>
          <button
            className={`flex-1 py-2 rounded-t-xl font-semibold transition ${tab === 'register' ? 'bg-purple-200 text-gray-900' : 'bg-gray-100 text-gray-400'}`}
            onClick={() => setTab('register')}
          >
            Sign Up
          </button>
        </div>
        {/* Form */}
        {tab === 'login' ? (
          <form className="space-y-4" onSubmit={handleLogin} noValidate>
            {loginServerError && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-center mb-2">
                {loginServerError}
              </div>
            )}
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 ${loginErrors.email ? 'border border-red-400' : ''}`}
                value={loginEmail}
                onChange={handleLoginEmailChange}
                required
              />
              {loginErrors.email && (
                <div className="text-red-500 text-sm mt-1">{loginErrors.email}</div>
              )}
            </div>
            <div>
              <input
                type="password"
                placeholder="Enter password"
                className={`w-full px-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 ${loginErrors.password ? 'border border-red-400' : ''}`}
                value={loginPassword}
                onChange={handleLoginPasswordChange}
                required
              />
              {loginErrors.password && (
                <div className="text-red-500 text-sm mt-1">{loginErrors.password}</div>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoginDisabled}
              className="w-full py-3 rounded-lg bg-purple-500 text-white font-semibold text-lg hover:bg-purple-600 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleRegister} noValidate>
            {regServerError && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-center mb-2">
                {regServerError}
              </div>
            )}
            <div>
              <input
                type="text"
                placeholder="Enter your name"
                className={`w-full px-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 ${regErrors.name ? 'border border-red-400' : ''}`}
                value={name}
                onChange={handleRegNameChange}
                required
              />
              {regErrors.name && (
                <div className="text-red-500 text-sm mt-1">{regErrors.name}</div>
              )}
            </div>
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 ${regErrors.email ? 'border border-red-400' : ''}`}
                value={regEmail}
                onChange={handleRegEmailChange}
                required
              />
              {regErrors.email && (
                <div className="text-red-500 text-sm mt-1">{regErrors.email}</div>
              )}
            </div>
            <div>
              <input
                type="password"
                placeholder="Create password"
                className={`w-full px-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 ${regErrors.password ? 'border border-red-400' : ''}`}
                value={regPassword}
                onChange={handleRegPasswordChange}
                required
              />
              {regErrors.password && (
                <div className="text-red-500 text-sm mt-1">{regErrors.password}</div>
              )}
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm password"
                className={`w-full px-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 ${regErrors.confirmPassword ? 'border border-red-400' : ''}`}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              {regErrors.confirmPassword && (
                <div className="text-red-500 text-sm mt-1">{regErrors.confirmPassword}</div>
              )}
            </div>
            <button
              type="submit"
              disabled={isRegisterDisabled}
              className="w-full py-3 rounded-lg bg-purple-500 text-white font-semibold text-lg hover:bg-purple-600 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthCard; 
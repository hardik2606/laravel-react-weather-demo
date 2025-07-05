import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Weather backgrounds for auth page
const AUTH_BACKGROUNDS = [
  "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80')",
  "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80')",
  "url('https://images.unsplash.com/photo-1551854838-02c201dd54c5?auto=format&fit=crop&w=1200&q=80')",
  "url('https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1200&q=80')",
  "url('https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1200&q=80')"
];

// Simple toast component (for future use, not needed for field errors)
const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50">
    {message}
    <button className="ml-4 text-white font-bold" onClick={onClose}>×</button>
  </div>
);

const AuthCard: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regErrors, setRegErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [regServerError, setRegServerError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [loginServerError, setLoginServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const backgroundImage = "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80')";

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isLoginDisabled =
    loading ||
    !loginEmail ||
    !loginPassword ||
    !isValidEmail(loginEmail);

  const isRegisterDisabled =
    loading ||
    !name ||
    !regEmail ||
    !regPassword ||
    !confirmPassword ||
    regPassword !== confirmPassword ||
    !isValidEmail(regEmail);

  // LOGIN HANDLER
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
      // navigate('/dashboard');
    } catch (err: any) {
      console.log('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setLoginServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // REGISTER HANDLER
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
      console.log('Register error:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setRegServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // CLEAR ERRORS ON INPUT
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
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-auto"
      style={{
        backgroundImage: backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Black overlay - full screen */}
      <div className="fixed inset-0 bg-black/50 z-0" />
      {/* Centered Logo and Text */}
      <div className="relative z-10 text-center mb-8">
        <div className="text-6xl mb-4">🌤️</div>
        <div className="text-4xl font-bold text-white mb-2">Weather Magic</div>
        <div className="text-xl text-white/80">Your Weather Adventure Awaits</div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-8">
        <div className="bg-black/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-white">
          {/* Tabs */}
          <div className="flex mb-8">
            <button
              className={`flex-1 py-3 rounded-t-xl font-semibold transition ${
                tab === 'login' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/20 text-gray-300 hover:bg-white/30'
              }`}
              onClick={() => setTab('login')}
              disabled={loading}
            >
              Log In
            </button>
            <button
              className={`flex-1 py-3 rounded-t-xl font-semibold transition ${
                tab === 'register' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/20 text-gray-300 hover:bg-white/30'
              }`}
              onClick={() => setTab('register')}
              disabled={loading}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          {tab === 'login' ? (
            <form className="space-y-6" onSubmit={handleLogin} noValidate>
              {loginServerError && (
                <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-lg text-center mb-2">
                  {loginServerError}
                </div>
              )}
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${
                    loginErrors.email ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={loginEmail}
                  onChange={handleLoginEmailChange}
                  required
                  disabled={loading}
                />
                {loginErrors.email && (
                  <div className="text-red-300 text-sm mt-2">{loginErrors.email}</div>
                )}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Enter password"
                  className={`w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${
                    loginErrors.password ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={loginPassword}
                  onChange={handleLoginPasswordChange}
                  required
                  disabled={loading}
                />
                {loginErrors.password && (
                  <div className="text-red-300 text-sm mt-2">{loginErrors.password}</div>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoginDisabled}
                className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold text-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Loading...
                  </span>
                ) : 'Log In'}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister} noValidate>
              {regServerError && (
                <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-lg text-center mb-2">
                  {regServerError}
                </div>
              )}
              <div>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${
                    regErrors.name ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={name}
                  onChange={handleRegNameChange}
                  required
                  disabled={loading}
                />
                {regErrors.name && (
                  <div className="text-red-300 text-sm mt-2">{regErrors.name}</div>
                )}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${
                    regErrors.email ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={regEmail}
                  onChange={handleRegEmailChange}
                  required
                  disabled={loading}
                />
                {regErrors.email && (
                  <div className="text-red-300 text-sm mt-2">{regErrors.email}</div>
                )}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Create password"
                  className={`w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${
                    regErrors.password ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={regPassword}
                  onChange={handleRegPasswordChange}
                  required
                  disabled={loading}
                />
                {regErrors.password && (
                  <div className="text-red-300 text-sm mt-2">{regErrors.password}</div>
                )}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm password"
                  className={`w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${
                    regErrors.confirmPassword ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  disabled={loading}
                />
                {regErrors.confirmPassword && (
                  <div className="text-red-300 text-sm mt-2">{regErrors.confirmPassword}</div>
                )}
              </div>
              <button
                type="submit"
                disabled={isRegisterDisabled}
                className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold text-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Loading...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCard; 
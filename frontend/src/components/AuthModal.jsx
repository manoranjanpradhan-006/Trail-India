import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('New Delhi, India');
  const [bio, setBio] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isRegister) {
        const res = await api.register({
          email,
          password,
          display_name: displayName,
          location,
          bio,
        });
        localStorage.setItem('trail_india_token', res.token);
        onLoginSuccess(res.user);
        onClose();
      } else {
        const res = await api.login({ email, password });
        localStorage.setItem('trail_india_token', res.token);
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (demoEmail) => {
    setIsRegister(false);
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-stone-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 mx-auto flex items-center justify-center text-2xl shadow-lg shadow-orange-950/30 mb-3 border border-amber-400/40">
            🛕
          </div>
          <h3 className="text-2xl font-serif font-bold text-white">
            {isRegister ? 'Join Trail India' : 'Welcome to Trail India'}
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            {isRegister 
              ? 'Become a contributor, save trails, and share recommendations' 
              : 'Sign in to access your custom itineraries and bookmarked trails'}
          </p>
        </div>

        {/* Demo Quick-Fill Buttons */}
        <div className="mb-6 p-3 rounded-2xl bg-stone-800/40 border border-stone-800">
          <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Instant Demo Sign-in
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickAccount('traveler@trailindia.org')}
              className="py-1.5 px-2 rounded-lg bg-stone-800 hover:bg-amber-600/20 text-stone-300 hover:text-amber-300 border border-stone-700 text-[11px] font-medium transition"
            >
              Traveler
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('contributor@trailindia.org')}
              className="py-1.5 px-2 rounded-lg bg-stone-800 hover:bg-amber-600/20 text-stone-300 hover:text-amber-300 border border-stone-700 text-[11px] font-medium transition"
            >
              Contributor
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@trailindia.org')}
              className="py-1.5 px-2 rounded-lg bg-stone-800 hover:bg-amber-600/20 text-stone-300 hover:text-amber-300 border border-stone-700 text-[11px] font-medium transition"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Your Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., Ananya Sharma"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">City / State</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Jaipur, Rajasthan"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-950/20 text-sm transition"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Free Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-stone-400">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-amber-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-amber-400 font-semibold hover:underline"
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

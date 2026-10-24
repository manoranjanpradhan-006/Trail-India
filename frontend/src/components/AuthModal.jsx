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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06110D]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#10251B] border border-[#263B2F] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-[#F8F1E5]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#0B1B14] hover:bg-[#263B2F] text-[#B9B7AA] hover:text-[#F8F1E5] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10251B] to-[#0B1B14] border border-[#E8B65C]/50 mx-auto flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(232,182,92,0.2)] mb-3">
            🛕
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#F8F1E5]">
            {isRegister ? 'Join Trail India' : 'Welcome to Trail India'}
          </h3>
          <p className="text-xs text-[#B9B7AA] mt-1">
            {isRegister 
              ? 'Become a contributor, save trails, and share recommendations' 
              : 'Sign in to access your custom itineraries and bookmarked trails'}
          </p>
        </div>

        {/* Demo Quick-Fill Buttons */}
        <div className="mb-6 p-3.5 rounded-2xl bg-[#0B1B14] border border-[#263B2F]">
          <p className="text-[10px] font-semibold text-[#E8B65C] uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Instant Demo Sign-in
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickAccount('traveler@trailindia.org')}
              className="py-1.5 px-2 rounded-lg bg-[#06110D] hover:bg-[#E8B65C]/10 text-[#F8F1E5] hover:text-[#E8B65C] border border-[#263B2F] text-[11px] font-medium transition"
            >
              Traveler
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('contributor@trailindia.org')}
              className="py-1.5 px-2 rounded-lg bg-[#06110D] hover:bg-[#E8B65C]/10 text-[#F8F1E5] hover:text-[#E8B65C] border border-[#263B2F] text-[11px] font-medium transition"
            >
              Contributor
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@trailindia.org')}
              className="py-1.5 px-2 rounded-lg bg-[#06110D] hover:bg-[#E8B65C]/10 text-[#F8F1E5] hover:text-[#E8B65C] border border-[#263B2F] text-[11px] font-medium transition"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-700 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#B9B7AA] mb-1">Your Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-[#B9B7AA]" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., Ananya Sharma"
                    className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B9B7AA] mb-1">City / State</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Bhubaneswar, Odisha"
                  className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#B9B7AA] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#B9B7AA]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#B9B7AA] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#B9B7AA]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-[#E8B65C] to-[#C4923C] hover:from-[#F4D18A] hover:to-[#E8B65C] disabled:opacity-50 text-[#06110D] font-bold py-3 rounded-xl shadow-lg text-xs transition"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Free Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-[#B9B7AA]">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-[#E8B65C] font-semibold hover:underline"
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
                className="text-[#E8B65C] font-semibold hover:underline"
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

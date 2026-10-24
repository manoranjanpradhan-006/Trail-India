import React from 'react';
import { Compass, MapPin, Utensils, Sparkles, BookOpen, Calendar, Heart, Shield, LogIn, LogOut } from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  favoritesCount,
}) => {
  const navItems = [
    { id: 'destinations', label: 'Destinations', icon: Compass },
    { id: 'food', label: 'Food & Culture', icon: Utensils },
    { id: 'festivals', label: 'Festivals', icon: Sparkles },
    { id: 'map', label: 'Golden Map of India', icon: MapPin },
    { id: 'blog', label: 'Travel Chronicles', icon: BookOpen },
    { id: 'planner', label: 'Trip Planner', icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-amber-500/20 text-stone-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Pan-India Brand */}
          <div 
            onClick={() => setActiveTab('destinations')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/40 group-hover:scale-105 transition-transform border border-amber-300/40">
              <span className="text-2xl select-none">🛕</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight font-serif text-white">
                  Trail India
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>🇮🇳</span> Whole India
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium">Discover India, One Trail at a Time</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-800/60 p-1.5 rounded-full border border-stone-700/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Menu: Auth & Favorites */}
          <div className="flex items-center gap-3">
            {/* Favorites Counter Button */}
            <button
              onClick={() => setActiveTab('planner')}
              className="relative p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 border border-stone-700/80 transition"
              title="Saved Places & Itinerary"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3 bg-stone-800/80 border border-stone-700 py-1.5 px-3 rounded-full">
                <div className="w-8 h-8 rounded-full bg-amber-600/30 border border-amber-500/50 flex items-center justify-center text-amber-300 font-bold text-xs uppercase">
                  {user.profile?.display_name?.charAt(0) || user.email.charAt(0)}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-semibold text-stone-200 truncate max-w-[120px]">
                    {user.profile?.display_name || user.email.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-amber-400 capitalize">
                    {user.role}
                  </p>
                </div>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="p-1 text-purple-400 hover:text-purple-300"
                    title="Admin Moderation"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="p-1 text-stone-400 hover:text-red-400 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-orange-950/20 transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 scrollbar-none border-t border-stone-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

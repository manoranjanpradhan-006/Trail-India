import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  Shield, 
  Sparkles,
  MapPin,
  Compass
} from 'lucide-react';

export const Navbar = ({
  user,
  onOpenAuth,
  onLogout,
  favoritesCount = 0,
  onOpenSearch,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/explore', label: 'Explore' },
    { path: '/blog', label: 'Travel Blog' },
    { path: '/festivals', label: 'Festivals' },
    { path: '/food', label: 'Food' },
    { path: '/map', label: 'Map' },
  ];

  const handleNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#06110D]/95 backdrop-blur-md border-b border-[#263B2F] transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Emblem (Matches Reference Image) */}
          <Link 
            to="/"
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            {/* Minimal Royal Temple Crest */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10251B] to-[#0B1B14] border border-[#E8B65C]/50 flex items-center justify-center text-[#E8B65C] shadow-[0_0_15px_rgba(232,182,92,0.2)] group-hover:border-[#E8B65C] transition-all duration-300">
              <svg 
                className="w-6 h-6 text-[#E8B65C]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.8" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 2L3 9v12h18V9L12 2z"/>
                <path d="M9 21V12h6v9"/>
                <path d="M12 2v4"/>
                <path d="M7 9h10"/>
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif font-bold tracking-tight text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">
                  Trail India
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#10251B] text-[#E8B65C] border border-[#263B2F] font-semibold">
                  🇮🇳 Royal
                </span>
              </div>
              <p className="text-[10px] text-[#B9B7AA] tracking-wider uppercase font-light">
                Discover India Beyond
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`relative px-3.5 py-1.5 text-sm font-medium transition-all duration-200 rounded-lg flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#E8B65C] font-semibold'
                      : item.isSpecial
                      ? 'text-[#F4D18A] hover:text-[#E8B65C]'
                      : 'text-[#B9B7AA] hover:text-[#F8F1E5] hover:bg-[#10251B]/60'
                  }`}
                >
                  {item.isSpecial && <Sparkles className="w-3.5 h-3.5 text-[#E8B65C] animate-pulse" />}
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-transparent via-[#E8B65C] to-transparent rounded-full shadow-[0_0_8px_#E8B65C]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Search, Saved, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Input / Capsule Bar */}
            <div
              onClick={() => onOpenSearch && onOpenSearch()}
              className="hidden md:flex items-center gap-2.5 bg-[#10251B]/80 hover:bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C]/50 px-3.5 py-1.5 rounded-full text-xs text-[#B9B7AA] cursor-pointer transition-all"
            >
              <Search className="w-3.5 h-3.5 text-[#E8B65C]" />
              <span className="text-[11px]">Search state, place, or festival...</span>
            </div>

            {/* Mobile Search Trigger Icon */}
            <button
              onClick={() => onOpenSearch && onOpenSearch()}
              className="md:hidden p-2.5 rounded-full text-[#B9B7AA] hover:text-[#E8B65C] hover:bg-[#10251B] transition-colors border border-transparent hover:border-[#263B2F]"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Saved Destinations / Favorites Icon */}
            <button
              onClick={() => handleNav('/planner')}
              className="relative p-2.5 rounded-full text-[#B9B7AA] hover:text-[#E8B65C] hover:bg-[#10251B] transition-colors border border-transparent hover:border-[#263B2F]"
              title="Saved Places & Itinerary Planner"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#E8B65C] text-[#06110D] font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* User Profile or Gold-Bordered Sign In / Login */}
            {user ? (
              <div className="flex items-center gap-2.5 bg-[#10251B] border border-[#263B2F] pl-2 pr-3 py-1.5 rounded-full">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E8B65C] to-[#F4D18A] p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-[#06110D] flex items-center justify-center text-[#E8B65C] font-bold text-xs uppercase">
                    {user.profile?.display_name?.charAt(0) || user.email.charAt(0)}
                  </div>
                </div>
                <div className="hidden xl:block text-left text-xs leading-tight">
                  <p className="font-semibold text-[#F8F1E5] truncate max-w-[100px]">
                    {user.profile?.display_name || user.email.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-[#E8B65C] capitalize">{user.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1 text-[#B9B7AA] hover:text-rose-400 transition ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-[#10251B] hover:bg-[#E8B65C] hover:text-[#06110D] text-[#E8B65C] border border-[#E8B65C] font-semibold text-xs px-4 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(232,182,92,0.3)] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden text-[#F8F1E5] hover:text-[#E8B65C] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#263B2F] py-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between ${
                    isActive
                      ? 'bg-[#10251B] text-[#E8B65C] font-semibold border-l-2 border-[#E8B65C]'
                      : 'text-[#B9B7AA] hover:text-[#F8F1E5] hover:bg-[#10251B]/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.isSpecial && <span className="text-[10px] font-bold text-[#E8B65C]">Flagship State</span>}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;

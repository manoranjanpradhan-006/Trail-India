import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndiaMap } from '../components/IndiaMap';
import { statesList, unionTerritoriesList } from '../data/states';
import {
  Compass,
  MapPin,
  Sparkles,
  Calendar,
  Heart,
  ArrowRight,
  Landmark,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Search,
  Star,
  Users,
  Flag
} from 'lucide-react';

export const Home = ({
  destinations = [],
  experiences = [],
  festivals = [],
  stories = [],
  favorites = [],
  onToggleFavorite,
  onSelectDestination,
  onSelectExperience,
  onSelectFestival,
  onSelectPlace,
  onOpenSearch,
}) => {
  const navigate = useNavigate();
  const [festivalIndex, setFestivalIndex] = useState(0);

  const statBadges = [
    { number: '28', label: 'States', icon: '🏛️', desc: 'All Sovereign Territories' },
    { number: '9', label: 'Union Territories', icon: '🏝️', desc: 'Frontiers & Archipelagos' },
    { number: '200+', label: 'Destinations', icon: '📍', desc: 'Curated Heritage Trails' },
    { number: 'Real', label: 'Travel Stories', icon: '📖', desc: 'Community Experiences' },
  ];

  const currentFest = festivals[festivalIndex] || festivals[0];

  return (
    <div className="space-y-20 animate-in fade-in duration-500">
      
      {/* ============================================================ */}
      {/* 1. GRAND DUAL-COLUMN HERO (Matches Reference Design Exactly) */}
      {/* ============================================================ */}
      <section className="relative rounded-3xl overflow-hidden border border-[#263B2F] bg-gradient-to-b from-[#0B1B14] to-[#06110D] shadow-2xl p-6 sm:p-10 lg:p-12">
        
        {/* Ambient Palace & Temple Silhouettes Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#E8B65C]/20 via-transparent to-transparent"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#E8B65C]/5 filter blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* LEFT COLUMN: HERO CONTENT & STAT BADGES */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-2">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#E8B65C] uppercase block font-sans">
                EXPLORE • DISCOVER • EXPERIENCE
              </span>
              
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif font-bold text-[#F8F1E5] tracking-tight leading-[1.08] drop-shadow-md">
                Trail India
              </h1>

              <p className="text-xl sm:text-2xl font-serif text-[#F4D18A] font-medium leading-snug">
                A Journey Through Incredible India
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#B9B7AA] leading-relaxed max-w-xl font-light">
              Explore the beauty, culture, food, festivals and hidden gems of every state. Plan your next trip, read travel stories, and share your own experiences with a community of explorers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  const statesSec = document.getElementById('states-section');
                  statesSec?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E8B65C] via-[#F4D18A] to-[#E8B65C] text-[#06110D] font-bold text-sm shadow-xl shadow-[#E8B65C]/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onOpenSearch && onOpenSearch()}
                className="px-6 py-3.5 rounded-full bg-[#10251B] hover:bg-[#152e22] border border-[#263B2F] hover:border-[#E8B65C] text-[#F8F1E5] font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-[#E8B65C]" />
                <span>Search State or Place</span>
              </button>
            </div>

            {/* 4 Stat Badges (Matches Reference Screenshot) */}
            <div className="pt-6 border-t border-[#263B2F]/70 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#10251B]/80 border border-[#263B2F] text-center hover:border-[#E8B65C]/50 transition-colors"
                >
                  <div className="text-xl mb-1">{badge.icon}</div>
                  <p className="font-serif font-bold text-lg text-[#F8F1E5] leading-tight">
                    {badge.number}
                  </p>
                  <p className="text-[11px] font-semibold text-[#E8B65C] truncate">
                    {badge.label}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE COMPACT GLOWING GOLDEN INDIA MAP (Survey of India Format) */}
          <div className="lg:col-span-5 w-full flex items-center justify-center">
            <div className="w-full max-w-[450px] rounded-2xl bg-[#06110D]/90 border border-[#263B2F] p-2 sm:p-2.5 shadow-2xl backdrop-blur-sm flex items-center justify-center">
              <IndiaMap onSelectState={(stateKey) => navigate(`/state/${stateKey}`)} />
            </div>
          </div>

        </div>

      </section>

      {/* ============================================================ */}
      {/* 2. STATES SECTION: 4 FEATURED STATES ON HOME PAGE            */}
      {/* ============================================================ */}
      <section id="states-section" className="space-y-6 pt-4 scroll-mt-24">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#263B2F] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E8B65C] mb-1">
              <Landmark className="w-4 h-4" />
              <span>Sovereign India • Featured States</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8F1E5]">
              Explore Indian States
            </h2>
            <p className="text-xs text-[#B9B7AA] mt-1 max-w-2xl font-light">
              Discover famous destinations, cultural heritage, and celebrated festivals. View all 28 states in the Explore portal.
            </p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10251B] hover:bg-[#E8B65C] text-[#E8B65C] hover:text-[#06110D] border border-[#263B2F] hover:border-[#E8B65C] transition-all text-xs font-semibold shrink-0 group cursor-pointer"
          >
            <span>View All 28 States in Explore</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 4 States Grid on Home Page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statesList.slice(0, 4).map((state) => (
            <div
              key={state.id}
              onClick={() => navigate(`/state/${state.id}`)}
              className="group cursor-pointer rounded-2xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-2xl hover:shadow-[#E8B65C]/20 flex flex-col justify-between"
            >
              {/* Image Thumbnail with Overlay Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#06110D]">
                <img
                  src={state.image}
                  alt={state.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10251B] via-transparent to-transparent opacity-90" />
                
                {/* Destinations Count Badge */}
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#06110D]/90 backdrop-blur-md text-[10px] font-bold text-[#E8B65C] border border-[#263B2F]">
                  {state.destinationsCount}
                </span>
              </div>

              {/* Card Content Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  {/* State Name */}
                  <h4 className="font-serif font-bold text-base text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors leading-tight truncate">
                    {state.name}
                  </h4>

                  {/* Official Tourism Tagline */}
                  <p className="text-[11px] font-medium text-[#E8B65C] italic line-clamp-1" title={state.officialTagline}>
                    "{state.officialTagline}"
                  </p>

                  {/* Famous Festival Highlight */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[#E8B65C] bg-[#06110D]/70 px-2.5 py-1.5 rounded-xl border border-[#263B2F]/60">
                    <Sparkles className="w-3.5 h-3.5 text-[#E8B65C] shrink-0" />
                    <span className="text-[#B9B7AA] font-light text-[10px]">Festival:</span>
                    <span className="font-semibold truncate text-[11px]">{state.famousFestival || 'Traditional Fairs'}</span>
                  </div>

                  {/* Most Famous Place & Capital */}
                  <div className="space-y-1 text-[11px] bg-[#06110D]/50 p-2.5 rounded-xl border border-[#263B2F]/50">
                    <div className="flex items-center justify-between text-[#B9B7AA]">
                      <span className="text-[#E8B65C] font-semibold text-[10px] uppercase">Capital:</span>
                      <span className="truncate text-[#F8F1E5] font-medium max-w-[120px] text-right">{state.capital}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#B9B7AA]">
                      <span className="text-[#E8B65C] font-semibold text-[10px] uppercase">Icon:</span>
                      <span className="truncate text-[#F8F1E5] font-medium max-w-[120px] text-right" title={state.mostFamousPlace}>{state.mostFamousPlace}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-[#B9B7AA] line-clamp-2 leading-relaxed font-light">
                    {state.description}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="pt-2.5 border-t border-[#263B2F]/70 flex items-center justify-between text-[11px] font-semibold text-[#E8B65C] group-hover:text-[#F4D18A]">
                  <span>Explore {state.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ============================================================ */}
      {/* 3. UNION TERRITORIES SECTION: 4 FEATURED UTs ON HOME PAGE    */}
      {/* ============================================================ */}
      <section id="ut-section" className="space-y-6 pt-4 scroll-mt-24">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#263B2F] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E8B65C] mb-1">
              <Flag className="w-4 h-4" />
              <span>Sovereign Territories • Featured</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8F1E5]">
              Union Territories of India
            </h2>
            <p className="text-xs text-[#B9B7AA] mt-1 max-w-2xl font-light">
              High mountain passes, tropical coral archipelagos, and heritage enclaves. View all territories in the Explore portal.
            </p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10251B] hover:bg-[#E8B65C] text-[#E8B65C] hover:text-[#06110D] border border-[#263B2F] hover:border-[#E8B65C] transition-all text-xs font-semibold shrink-0 group cursor-pointer"
          >
            <span>View All Territories in Explore</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 4 Union Territories Grid on Home Page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {unionTerritoriesList.slice(0, 4).map((ut) => (
            <div
              key={ut.id}
              onClick={() => navigate(`/state/${ut.id}`)}
              className="group cursor-pointer rounded-2xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-2xl hover:shadow-[#E8B65C]/20 flex flex-col justify-between"
            >
              {/* Image Thumbnail */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#06110D]">
                <img
                  src={ut.image}
                  alt={ut.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10251B] via-transparent to-transparent opacity-90" />
                
                {/* Destinations Count Badge */}
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#06110D]/90 backdrop-blur-md text-[10px] font-bold text-[#E8B65C] border border-[#263B2F]">
                  {ut.destinationsCount}
                </span>

                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#10251B] text-[#E8B65C] text-[9px] font-semibold border border-[#263B2F]">
                  UT
                </span>
              </div>

              {/* Card Content Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  {/* UT Name */}
                  <h4 className="font-serif font-bold text-base text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors leading-tight truncate" title={ut.name}>
                    {ut.name}
                  </h4>

                  {/* Official Tourism Tagline */}
                  <p className="text-[11px] font-medium text-[#E8B65C] italic line-clamp-1" title={ut.officialTagline}>
                    "{ut.officialTagline}"
                  </p>

                  {/* Famous Festival Highlight */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[#E8B65C] bg-[#06110D]/70 px-2.5 py-1.5 rounded-xl border border-[#263B2F]/60">
                    <Sparkles className="w-3.5 h-3.5 text-[#E8B65C] shrink-0" />
                    <span className="text-[#B9B7AA] font-light text-[10px]">Festival:</span>
                    <span className="font-semibold truncate text-[11px]">{ut.famousFestival || 'Traditional Fairs'}</span>
                  </div>

                  {/* Capital & Most Famous Place */}
                  <div className="space-y-1 text-[11px] bg-[#06110D]/50 p-2.5 rounded-xl border border-[#263B2F]/50">
                    <div className="flex items-center justify-between text-[#B9B7AA]">
                      <span className="text-[#E8B65C] font-semibold uppercase text-[10px]">Cap:</span>
                      <span className="truncate text-[#F8F1E5] font-medium max-w-[120px] text-right">{ut.capital}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#B9B7AA]">
                      <span className="text-[#E8B65C] font-semibold uppercase text-[10px]">Icon:</span>
                      <span className="truncate text-[#F8F1E5] font-medium max-w-[120px] text-right" title={ut.mostFamousPlace}>{ut.mostFamousPlace}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-[#B9B7AA] line-clamp-2 leading-relaxed font-light">
                    {ut.description}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="pt-2.5 border-t border-[#263B2F]/70 flex items-center justify-between text-[11px] font-semibold text-[#E8B65C] group-hover:text-[#F4D18A]">
                  <span>Explore {ut.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ============================================================ */}
      {/* 4. DUAL BANNER: UPCOMING FESTIVALS & PLANNER QUICK WIDGET     */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Upcoming Festivals Spotlight Carousel */}
        <div className="lg:col-span-7 rounded-3xl bg-[#10251B] border border-[#263B2F] p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E8B65C]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#E8B65C]">
                  Living Celebrations
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFestivalIndex((prev) => (prev - 1 + festivals.length) % festivals.length)}
                  className="p-1.5 rounded-full bg-[#06110D] border border-[#263B2F] text-[#B9B7AA] hover:text-[#E8B65C]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFestivalIndex((prev) => (prev + 1) % festivals.length)}
                  className="p-1.5 rounded-full bg-[#06110D] border border-[#263B2F] text-[#B9B7AA] hover:text-[#E8B65C]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-2xl font-serif font-bold text-[#F8F1E5]">
              Upcoming Festivals of India
            </h3>
            <p className="text-xs text-[#B9B7AA] mt-1 mb-6">
              Witness spiritual fervors, chariot processions, desert fairs, and musical nights across sovereign lands.
            </p>

            {currentFest && (
              <div
                onClick={() => onSelectFestival && onSelectFestival(currentFest)}
                className="group cursor-pointer grid grid-cols-1 sm:grid-cols-12 gap-5 rounded-2xl bg-[#06110D] border border-[#263B2F] hover:border-[#E8B65C] p-4 transition-all"
              >
                <div className="sm:col-span-5 aspect-[4/3] rounded-xl overflow-hidden bg-black shrink-0">
                  <img
                    src={currentFest.image}
                    alt={currentFest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="sm:col-span-7 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8B65C]/20 text-[#E8B65C] border border-[#E8B65C]/30">
                      {currentFest.date_info || currentFest.date || 'Upcoming'}
                    </span>
                    <h4 className="font-serif font-bold text-xl text-[#F8F1E5] mt-2 group-hover:text-[#E8B65C] transition-colors">
                      {currentFest.name}
                    </h4>
                    <p className="text-xs text-[#B9B7AA] line-clamp-2 mt-1 font-light leading-relaxed">
                      {currentFest.description}
                    </p>
                  </div>
                  <div className="text-xs text-[#E8B65C] font-semibold flex items-center justify-between pt-2 border-t border-[#263B2F]/60">
                    <span>{currentFest.state || 'All India'}</span>
                    <span>View Festival Guide →</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => navigate('/festivals')}
              className="text-xs font-semibold text-[#E8B65C] hover:underline"
            >
              Browse Complete India Festival Calendar →
            </button>
          </div>
        </div>

        {/* Right: Plan Your Journey Quick Card */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#10251B] to-[#0B1B14] border border-[#263B2F] hover:border-[#E8B65C]/60 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#06110D] border border-[#263B2F] flex items-center justify-center text-[#E8B65C]">
              <Compass className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#E8B65C]">
                Intelligent Travel Architect
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#F8F1E5] mt-1">
                Design Your Royal Itinerary
              </h3>
            </div>

            <p className="text-xs text-[#B9B7AA] leading-relaxed font-light">
              Craft multi-day journeys combining UNESCO monuments, authentic regional cuisines, and scenic hill trails. Fully custom tailored for solo adventurers, families, and photography expeditions.
            </p>

            <div className="p-4 rounded-2xl bg-[#06110D]/70 border border-[#263B2F] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#B9B7AA]">
                <span>Flagship Circuit:</span>
                <span className="font-semibold text-[#F8F1E5]">Golden Triangle Odisha</span>
              </div>
              <div className="flex items-center justify-between text-[#B9B7AA]">
                <span>Duration:</span>
                <span className="font-semibold text-[#E8B65C]">4 Days / 3 Nights</span>
              </div>
              <div className="flex items-center justify-between text-[#B9B7AA]">
                <span>Recommended Season:</span>
                <span className="font-semibold text-[#F8F1E5]">October – March</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => navigate('/planner')}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#E8B65C] via-[#F4D18A] to-[#E8B65C] text-[#06110D] font-bold text-xs shadow-lg shadow-[#E8B65C]/20 hover:brightness-110 active:scale-95 transition-all text-center block cursor-pointer"
            >
              Open Trip Planner & Route Builder
            </button>
          </div>
        </div>

      </section>

      {/* ============================================================ */}
      {/* 5. REAL TRAVEL STORIES & EXPERIENCES CARDS                   */}
      {/* ============================================================ */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E8B65C]">
              Chronicles & Field Guides
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8F1E5]">
              Real Travel Stories from Explorers
            </h2>
          </div>
          <button
            onClick={() => navigate('/blog')}
            className="text-xs font-semibold text-[#E8B65C] hover:text-[#F4D18A] flex items-center gap-1 group transition-colors"
          >
            <span>View All Stories</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.slice(0, 3).map((st) => (
            <div
              key={st.id}
              onClick={() => navigate('/blog')}
              className="cursor-pointer rounded-3xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] p-6 space-y-4 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#06110D] text-[#E8B65C] border border-[#263B2F] font-semibold">
                    {st.category || 'Heritage'}
                  </span>
                  <span className="text-[#B9B7AA] text-[11px]">{st.read_time_minutes || 5} min read</span>
                </div>

                <h3 className="font-serif font-bold text-xl text-[#F8F1E5] hover:text-[#E8B65C] transition-colors leading-snug">
                  {st.title}
                </h3>

                <p className="text-xs text-[#B9B7AA] line-clamp-3 leading-relaxed font-light">
                  {st.summary || st.content}
                </p>
              </div>

              <div className="pt-3 border-t border-[#263B2F]/60 flex items-center justify-between text-xs text-[#B9B7AA]">
                <span>By <strong className="text-[#F8F1E5]">{st.author_name || 'Trail India Explorer'}</strong></span>
                <span className="text-[#E8B65C] font-semibold">Read Article →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;

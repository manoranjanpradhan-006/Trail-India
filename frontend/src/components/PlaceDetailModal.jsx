import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Clock, DollarSign, Heart, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const PlaceDetailModal = ({
  place,
  onClose,
  user,
  isFavorite,
  onToggleFavorite,
  onViewOnMap,
  onOpenAuth,
}) => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // New review form
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [visitDate, setVisitDate] = useState('Recently (2026)');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (place) {
      loadReviews(place.id);
    }
  }, [place]);

  const loadReviews = async (id) => {
    setLoadingReviews(true);
    try {
      const data = await api.getPlaceReviews(id);
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!place) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.createReview(place.id, {
        rating,
        title,
        comment,
        visit_date: visitDate,
      });
      setSuccessMsg('Thank you! Your verified traveler review has been posted.');
      setTitle('');
      setComment('');
      loadReviews(place.id);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!place) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06110D]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#10251B] border border-[#263B2F] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-[#F8F1E5]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#06110D]/80 hover:bg-[#E8B65C] text-[#F8F1E5] hover:text-[#06110D] transition shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image & Overlay */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-t-3xl">
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10251B] via-[#10251B]/40 to-transparent" />
          
          {/* Header Badges */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#E8B65C] text-[#06110D]">
                  {place.category?.replace('_', ' ')}
                </span>
                {place.destination_name && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#06110D]/80 text-[#F8F1E5] border border-[#263B2F]">
                    📍 {place.destination_name}
                  </span>
                )}
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F8F1E5] drop-shadow-md">
                {place.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(place.id)}
                className={`p-3 rounded-full flex items-center gap-2 text-xs font-bold transition ${
                  isFavorite 
                    ? 'bg-rose-600 text-white shadow-lg' 
                    : 'bg-[#06110D]/85 hover:bg-[#153224] text-[#F8F1E5] border border-[#263B2F]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'Saved' : 'Save'}</span>
              </button>
              
              <button
                onClick={() => {
                  onClose();
                  onViewOnMap(place);
                }}
                className="bg-gradient-to-r from-[#E8B65C] to-[#C4923C] hover:from-[#F4D18A] hover:to-[#E8B65C] text-[#06110D] px-4 py-3 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg transition"
              >
                <MapPin className="w-4 h-4" />
                <span>Locate on Golden Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Practical Info Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#0B1B14] border border-[#263B2F]">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#E8B65C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#B9B7AA]">Timings</p>
                <p className="text-sm font-medium text-[#F8F1E5]">{place.opening_hours || 'Open daily'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-[#E8B65C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#B9B7AA]">Entry & Fees</p>
                <p className="text-sm font-medium text-[#F8F1E5]">{place.entry_fee || 'Free entry'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#E8B65C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#B9B7AA]">Location</p>
                <p className="text-sm font-medium text-[#F8F1E5] truncate">{place.address || 'India'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-bold font-serif mb-3 text-[#E8B65C]">About this Sovereign Place</h3>
            <p className="text-[#B9B7AA] leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {place.description}
            </p>
          </div>

          {/* Highlights */}
          {place.highlights && place.highlights.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8B65C] mb-3">Key Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {place.highlights.map((h, idx) => (
                  <span
                    key={idx}
                    className="bg-[#0B1B14] text-[#F8F1E5] border border-[#263B2F] px-3.5 py-1.5 rounded-xl text-xs font-medium"
                  >
                    ✦ {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-[#263B2F]" />

          {/* Reviews Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold font-serif text-[#F8F1E5] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#E8B65C]" />
                  Community Reviews & Ratings
                </h3>
                <p className="text-xs text-[#B9B7AA] mt-1">
                  Authentic experiences from fellow explorers across India
                </p>
              </div>

              {place.rating !== undefined && place.rating > 0 && (
                <div className="flex items-center gap-2 bg-[#0B1B14] px-4 py-2 rounded-2xl border border-[#263B2F]">
                  <Star className="w-5 h-5 fill-[#E8B65C] text-[#E8B65C]" />
                  <span className="text-xl font-bold text-[#F8F1E5]">{place.rating?.toFixed(1)}</span>
                  <span className="text-xs text-[#B9B7AA]">/ 5 ({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            {/* Submit Review Card */}
            <div className="p-5 rounded-2xl bg-[#0B1B14] border border-[#263B2F]">
              <h4 className="text-sm font-semibold text-[#F8F1E5] mb-3">
                {user ? 'Share Your Travel Experience' : 'Sign in to write a review'}
              </h4>

              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-700 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {successMsg}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#B9B7AA]">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= rating
                                ? 'fill-[#E8B65C] text-[#E8B65C]'
                                : 'text-[#263B2F]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Review Headline (e.g., Unforgettable sunrise over the peaks)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                    />
                    <input
                      type="text"
                      placeholder="Visit season/month (e.g., January 2026)"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Describe what made this visit special, practical tips for other travelers, and advice..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl p-3 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-[#E8B65C] to-[#C4923C] hover:from-[#F4D18A] hover:to-[#E8B65C] text-[#06110D] font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#B9B7AA]">Join our traveler community to post ratings and tips.</p>
                  <button
                    onClick={onOpenAuth}
                    className="bg-[#06110D] hover:bg-[#263B2F] text-[#E8B65C] border border-[#263B2F] text-xs font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Reviews List */}
            {loadingReviews ? (
              <p className="text-center py-6 text-[#B9B7AA] text-xs">Loading verified reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 bg-[#0B1B14] rounded-2xl border border-[#263B2F]">
                <p className="text-[#B9B7AA] text-xs">No reviews yet for this place. Be the first explorer to review!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#0B1B14] border border-[#263B2F] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#E8B65C]/20 border border-[#E8B65C]/30 flex items-center justify-center text-[#E8B65C] font-bold text-xs uppercase">
                          {rev.author_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#F8F1E5]">{rev.author_name}</p>
                          <p className="text-[10px] text-[#B9B7AA]">{rev.visit_date || 'Verified Visitor'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? 'fill-[#E8B65C] text-[#E8B65C]'
                                : 'text-[#263B2F]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h5 className="font-serif font-bold text-[#F8F1E5] text-sm">{rev.title}</h5>
                    <p className="text-xs text-[#B9B7AA] leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

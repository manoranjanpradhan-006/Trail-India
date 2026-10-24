import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Clock, DollarSign, Heart, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Place, Review, User } from '../types';
import { api } from '../services/api';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
  user: User | null;
  isFavorite: boolean;
  onToggleFavorite: (placeId: string) => void;
  onViewOnMap: (place: Place) => void;
  onOpenAuth: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  onClose,
  user,
  isFavorite,
  onToggleFavorite,
  onViewOnMap,
  onOpenAuth,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
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
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [place]);

  const loadReviews = async (id: string) => {
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
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
      setSuccessMsg('Thank you! Your verified review has been published.');
      setTitle('');
      setComment('');
      loadReviews(place.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!place) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-stone-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-stone-950/70 hover:bg-stone-800 text-stone-300 hover:text-white transition shadow-lg"
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
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
          
          {/* Header Badges */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-500 text-stone-950">
                  {place.category.replace('_', ' ')}
                </span>
                {place.destination_name && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-stone-800/80 text-stone-200 border border-stone-700">
                    📍 {place.destination_name}
                  </span>
                )}
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white drop-shadow-md">
                {place.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(place.id)}
                className={`p-3 rounded-full flex items-center gap-2 text-sm font-semibold transition ${
                  isFavorite 
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30' 
                    : 'bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onViewOnMap(place);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-full flex items-center gap-2 text-sm font-semibold shadow-lg shadow-amber-950/30 transition"
              >
                <MapPin className="w-4 h-4" />
                <span>Locate on Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Practical Info Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-800/50 border border-stone-800">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-stone-400">Timings</p>
                <p className="text-sm font-medium text-stone-200">{place.opening_hours || 'Open daily'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-stone-400">Entry & Fees</p>
                <p className="text-sm font-medium text-stone-200">{place.entry_fee || 'Free entry'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-stone-400">Location</p>
                <p className="text-sm font-medium text-stone-200 truncate">{place.address || 'Odisha, India'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-bold font-serif mb-3 text-stone-100">About this Place</h3>
            <p className="text-stone-300 leading-relaxed whitespace-pre-line text-base">
              {place.description}
            </p>
          </div>

          {/* Highlights */}
          {place.highlights && place.highlights.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3">Key Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {place.highlights.map((h, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-950/40 text-amber-300 border border-amber-800/40 px-3.5 py-1.5 rounded-xl text-xs font-medium"
                  >
                    ✦ {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-stone-800" />

          {/* Reviews Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-amber-500" />
                  Community Reviews & Ratings
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Authentic experiences from fellow explorers
                </p>
              </div>

              {place.rating !== undefined && place.rating > 0 && (
                <div className="flex items-center gap-2 bg-stone-800 px-4 py-2 rounded-2xl border border-stone-700">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-bold text-white">{place.rating.toFixed(1)}</span>
                  <span className="text-xs text-stone-400">/ 5 ({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            {/* Submit Review Card */}
            <div className="p-5 rounded-2xl bg-stone-800/40 border border-stone-800">
              <h4 className="text-base font-semibold text-stone-200 mb-3">
                {user ? 'Share Your Travel Experience' : 'Sign in to write a review'}
              </h4>

              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {successMsg}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Review Headline (e.g., Unforgettable sunset views)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Visit season/month (e.g., January 2026)"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Describe what made this visit special, practical tips for other travelers, best time to visit, and advice..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-4 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-stone-400">Join our traveler community to post ratings and tips.</p>
                  <button
                    onClick={onOpenAuth}
                    className="bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700 text-xs font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Reviews List */}
            {loadingReviews ? (
              <p className="text-center py-6 text-stone-400 text-sm">Loading verified reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 bg-stone-800/20 rounded-2xl border border-stone-800">
                <p className="text-stone-400 text-sm">No reviews yet for this place. Be the first explorer to review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-stone-800/30 border border-stone-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs uppercase">
                          {rev.author_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-200">{rev.author_name}</p>
                          <p className="text-[11px] text-stone-400">{rev.visit_date || 'Verified Visitor'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h5 className="font-semibold text-stone-100 text-sm">{rev.title}</h5>
                    <p className="text-sm text-stone-300 leading-relaxed">{rev.comment}</p>
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

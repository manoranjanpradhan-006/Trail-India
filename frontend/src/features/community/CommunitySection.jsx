import React, { useState } from 'react';
import { Users, Plus, Heart, MapPin, Calendar, Camera, Send, X, AlertCircle, CheckCircle2, MessageSquare, Flag, Upload, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export const CommunitySection = ({
  communityPosts,
  user,
  onOpenAuth,
  onCreatePost,
}) => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Hidden Gem');
  const [description, setDescription] = useState('');
  const [bestTime, setBestTime] = useState('October to March');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1629853683515-5c1cf7ca2687?auto=format&fit=crop&w=800&q=80');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await api.uploadImage(file, 'trail-india/community');
      if (res.secure_url) {
        setPhotoUrl(res.secure_url);
      }
    } catch (err) {
      setUploadError(err.message || 'Upload to Cloudinary failed');
    } finally {
      setIsUploading(false);
    }
  };

  const categories = ['All', 'Hidden Gem', 'Local Tip', 'Photography Spot', 'Food Recommendation', 'Festival Experience'];
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredPosts = selectedFilter === 'All'
    ? communityPosts
    : communityPosts.filter(p => p.category?.toLowerCase() === selectedFilter.toLowerCase());

  const handleOpenModal = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setIsSubmitModalOpen(true);
    setStatusMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setStatusMsg({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      await onCreatePost({
        title,
        location,
        category,
        description,
        best_time: bestTime,
        photos: [photoUrl],
        author_name: user?.profile?.display_name || user?.email?.split('@')[0] || 'Traveler',
      });

      setStatusMsg({ type: 'success', text: 'Thank you! Your community experience has been published.' });
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setTitle('');
        setDescription('');
        setLocation('');
      }, 1500);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to submit experience.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Community Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#263B2F] bg-gradient-to-r from-[#10251B] via-[#0B1B14] to-[#06110D] p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8B65C] bg-[#E8B65C]/10 border border-[#E8B65C]/30 px-3.5 py-1.5 rounded-full inline-block">
            👥 Community & Local Voices
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F8F1E5] leading-tight">
            Your Journey Could Inspire Someone Else.
          </h1>
          <p className="text-xs sm:text-sm text-[#B9B7AA] leading-relaxed">
            Share the sacred places you've discovered, the regional food you've tasted, and the authentic stories you've gathered along the trails of India.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="bg-gradient-to-r from-[#E8B65C] to-[#C4923C] hover:from-[#F4D18A] hover:to-[#E8B65C] text-[#06110D] font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-[#E8B65C]/20 flex items-center gap-2 transition hover:scale-105 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Share Your Experience
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition ${
              selectedFilter === cat
                ? 'bg-[#E8B65C] text-[#06110D] font-bold shadow'
                : 'bg-[#10251B] hover:bg-[#153224] text-[#B9B7AA] border border-[#263B2F]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Community Posts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C]/50 rounded-3xl overflow-hidden card-hover-effect flex flex-col justify-between"
          >
            <div>
              {post.photos && post.photos.length > 0 && (
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={post.photos[0]}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#06110D]/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold text-[#E8B65C] border border-[#263B2F]">
                    {post.category}
                  </div>
                </div>
              )}

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#E8B65C]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-semibold">{post.location}</span>
                </div>

                <h3 className="font-serif font-bold text-lg text-[#F8F1E5]">
                  {post.title}
                </h3>

                <p className="text-xs text-[#B9B7AA] leading-relaxed line-clamp-4">
                  {post.description}
                </p>

                {post.best_time && (
                  <div className="pt-2 text-[11px] text-[#B9B7AA]">
                    <strong className="text-[#F8F1E5]">Best time to visit:</strong> {post.best_time}
                  </div>
                )}
              </div>
            </div>

            {/* Author Footer */}
            <div className="px-6 py-4 bg-[#0B1B14] border-t border-[#263B2F] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E8B65C]/20 border border-[#E8B65C]/40 text-[#E8B65C] font-bold text-xs flex items-center justify-center">
                  {post.author_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-[#F8F1E5]">{post.author_name}</p>
                  <p className="text-[10px] text-[#B9B7AA]">{post.created_at || 'Community explorer'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[#B9B7AA]">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{post.likes || 12}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share Experience Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06110D]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#10251B] border border-[#263B2F] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-[#F8F1E5]">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#0B1B14] hover:bg-[#263B2F] text-[#B9B7AA] hover:text-[#F8F1E5] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8B65C]">
                ✦ Community Contribution
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#F8F1E5]">Share Your Experience</h3>
              <p className="text-xs text-[#B9B7AA]">
                Inspire fellow travelers with hidden places, local foods, or cultural advice.
              </p>
            </div>

            {statusMsg && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === 'success' 
                  ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-300' 
                  : 'bg-red-950/60 border border-red-700 text-red-300'
              }`}>
                {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#B9B7AA] mb-1">Experience Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Hidden water palace terrace in Bundi, Rajasthan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-sm text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#B9B7AA] mb-1">Location / State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Raghurajpur, Odisha"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-sm text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B9B7AA] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-3 py-2.5 text-sm text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                  >
                    <option value="Hidden Gem">Hidden Gem</option>
                    <option value="Local Tip">Local Tip</option>
                    <option value="Photography Spot">Photography Spot</option>
                    <option value="Food Recommendation">Food Recommendation</option>
                    <option value="Festival Experience">Festival Experience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B9B7AA] mb-1">Best Season / Time to Visit</label>
                <input
                  type="text"
                  placeholder="e.g., November to February (Sunrise is best)"
                  value={bestTime}
                  onChange={(e) => setBestTime(e.target.value)}
                  className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-sm text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B9B7AA] mb-1">Photograph (Upload to Cloudinary or Paste URL)</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1B3627] hover:bg-[#264A37] border border-[#263B2F] rounded-xl text-xs font-medium text-[#E8B65C] transition shrink-0">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#E8B65C]" />
                          <span>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-[#E8B65C]" />
                          <span>Choose Photo</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="Or paste image URL"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                    />
                  </div>

                  {uploadError && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {uploadError}
                    </p>
                  )}

                  {photoUrl && (
                    <div className="relative h-24 w-full rounded-xl overflow-hidden border border-[#263B2F]">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-2 bg-black/70 text-[10px] text-[#E8B65C] px-2 py-0.5 rounded-full backdrop-blur-sm">
                        Preview
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B9B7AA] mb-1">Description & Tips *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your authentic experience, route tips, cultural context, and practical advice..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl p-3 text-sm text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-gradient-to-r from-[#E8B65C] to-[#C4923C] hover:from-[#F4D18A] hover:to-[#E8B65C] text-[#06110D] font-bold py-3 rounded-xl shadow-lg text-sm transition"
              >
                {submitting ? 'Submitting Experience...' : 'Publish Experience to Community'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

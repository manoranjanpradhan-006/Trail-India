import React, { useState } from 'react';
import { api } from '../../services/api';
import { PenTool, Bookmark, Eye, Clock, Tag, CheckCircle2, AlertCircle, X, Search, Upload, Loader2 } from 'lucide-react';

export const BlogSection = ({
  posts,
  user,
  onOpenAuth,
  onRefreshPosts,
}) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editor State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Travel Guides');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1600100397608-f010f4439c2c?auto=format&fit=crop&w=1200&q=80');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState(null);
  const [content, setContent] = useState('');

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setCoverUploadError(null);

    try {
      const res = await api.uploadImage(file, 'trail-india/blog');
      if (res.secure_url) {
        setCoverImage(res.secure_url);
      }
    } catch (err) {
      setCoverUploadError(err.message || 'Upload to Cloudinary failed');
    } finally {
      setIsUploadingCover(false);
    }
  };
  const [tagsInput, setTagsInput] = useState('India, Heritage, Architecture');
  const [submitting, setSubmitting] = useState(false);
  const [editorMsg, setEditorMsg] = useState(null);

  const categories = ['all', 'Travel Guides', 'Food & Culture', 'High Altitude', 'Heritage & Ruins'];

  const filteredPosts = posts.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenEditor = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setIsEditorOpen(true);
    setEditorMsg(null);
  };

  const handleCreatePost = async (status) => {
    if (!title.trim() || !content.trim()) {
      setEditorMsg({ type: 'error', text: 'Title and content cannot be blank.' });
      return;
    }

    setSubmitting(true);
    setEditorMsg(null);

    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await api.createBlogPost({
        title,
        category,
        excerpt: excerpt || content.slice(0, 150) + '...',
        cover_image: coverImage,
        content,
        tags,
        status: user?.role === 'admin' ? 'published' : status,
      });

      setEditorMsg({ 
        type: 'success', 
        text: status === 'published' || user?.role === 'admin' 
          ? 'Article published successfully!' 
          : 'Article submitted for editorial review!' 
      });

      setTimeout(() => {
        setIsEditorOpen(false);
        setTitle('');
        setContent('');
        setExcerpt('');
        onRefreshPosts();
      }, 1500);
    } catch (err) {
      setEditorMsg({ type: 'error', text: err.message || 'Failed to create article' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookmark = async (post, e) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth();
      return;
    }
    try {
      await api.bookmarkPost(post.id);
      alert(`Saved "${post.title}" to your bookmarks.`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#10251B] via-[#0B1B14] to-[#06110D] p-8 sm:p-12 rounded-3xl border border-[#263B2F] relative overflow-hidden text-[#F8F1E5] shadow-2xl">
        <div className="max-w-2xl relative z-10 space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8B65C] bg-[#E8B65C]/10 border border-[#E8B65C]/30 px-3.5 py-1.5 rounded-full inline-block">
            ✍️ Public Travel Chronicles Across India
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#F8F1E5] leading-tight">
            Stories from Sacred Ghats, Desert Forts & Cloud Forests
          </h1>
          <p className="text-[#B9B7AA] text-xs sm:text-sm leading-relaxed">
            Read first-hand travel accounts, regional food trails, conservation stories, and comprehensive itineraries penned by local explorers and contributors across Indian states.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenEditor}
              className="bg-gradient-to-r from-[#E8B65C] to-[#C4923C] hover:from-[#F4D18A] hover:to-[#E8B65C] text-[#06110D] font-bold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-[#E8B65C]/20 flex items-center gap-2 transition hover:scale-105"
            >
              <PenTool className="w-4 h-4" />
              Write an Article
            </button>
            <span className="text-xs text-[#B9B7AA]">Open to all passionate travelers & locals</span>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap capitalize transition ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[#E8B65C] to-[#C4923C] text-[#06110D] font-bold shadow'
                  : 'bg-[#10251B] hover:bg-[#153224] text-[#B9B7AA] border border-[#263B2F]'
              }`}
            >
              {cat === 'all' ? 'All Stories' : cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search articles by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 bg-[#10251B] border border-[#263B2F] rounded-2xl px-4 py-2.5 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C] placeholder:text-[#B9B7AA]/50"
        />
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C]/50 rounded-3xl overflow-hidden card-hover-effect cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Cover Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 bg-[#06110D]/85 backdrop-blur-md text-[#E8B65C] border border-[#263B2F] text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                  {post.category}
                </div>
                <button
                  onClick={(e) => handleBookmark(post, e)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-[#06110D]/80 hover:bg-[#E8B65C] text-[#F8F1E5] hover:text-[#06110D] transition"
                  title="Bookmark story"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-[#B9B7AA]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#E8B65C]" />
                    {post.read_time_minutes} min read
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#E8B65C]" />
                    {post.views_count} views
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-[#B9B7AA] text-xs line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </div>

            {/* Author Footer */}
            <div className="px-6 py-4 bg-[#0B1B14] border-t border-[#263B2F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E8B65C]/20 border border-[#E8B65C]/30 text-[#E8B65C] font-bold text-xs flex items-center justify-center">
                  {post.author_name?.charAt(0) || 'A'}
                </div>
                <span className="text-xs font-medium text-[#F8F1E5] truncate max-w-[130px]">
                  {post.author_name}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#E8B65C] group-hover:translate-x-1 transition-transform">
                Read Story →
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06110D]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#10251B] border border-[#263B2F] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-[#F8F1E5]">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#06110D]/80 hover:bg-[#E8B65C] text-[#F8F1E5] hover:text-[#06110D] transition shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Reader Cover */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-t-3xl">
              <img
                src={selectedPost.cover_image}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10251B] via-[#10251B]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8B65C] text-[#06110D]">
                  {selectedPost.category}
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#F8F1E5] drop-shadow-md">
                  {selectedPost.title}
                </h2>
              </div>
            </div>

            {/* Reader Content */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-[#263B2F] text-xs text-[#B9B7AA]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E8B65C]/30 text-[#E8B65C] font-bold flex items-center justify-center text-xs">
                    {selectedPost.author_name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#F8F1E5]">{selectedPost.author_name}</p>
                    <p className="text-[10px] text-[#E8B65C]">Verified Contributor</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span>⏱️ {selectedPost.read_time_minutes} min read</span>
                  <span>👀 {selectedPost.views_count} views</span>
                </div>
              </div>

              {/* Formatted Story Content */}
              <div className="space-y-4 text-[#F8F1E5] leading-relaxed text-sm sm:text-base whitespace-pre-line font-sans">
                {selectedPost.content}
              </div>

              {/* Tags */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="pt-6 border-t border-[#263B2F] flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-[#0B1B14] text-[#B9B7AA] border border-[#263B2F] px-3 py-1 rounded-xl text-xs flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-[#E8B65C]" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Write Article Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06110D]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#10251B] border border-[#263B2F] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-[#F8F1E5] p-6 sm:p-8">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-[#0B1B14] hover:bg-[#263B2F] text-[#B9B7AA] hover:text-[#F8F1E5] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] uppercase font-bold text-[#E8B65C]">✦ Contributor Workspace</span>
              <h3 className="text-2xl font-serif font-bold text-[#F8F1E5] mt-1">Publish a Travel Story</h3>
              <p className="text-xs text-[#B9B7AA]">Share your recommendations, itineraries, or cultural narratives across India.</p>
            </div>

            {editorMsg && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                editorMsg.type === 'success' 
                  ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-300' 
                  : 'bg-red-950/60 border border-red-700 text-red-300'
              }`}>
                {editorMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {editorMsg.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#B9B7AA] mb-1">Article Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Hidden Waterfalls of the Western Ghats: A Monsoon Trail"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-sm text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#B9B7AA] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-sm text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                  >
                    <option value="Travel Guides">Travel Guides</option>
                    <option value="Food & Culture">Food & Culture</option>
                    <option value="High Altitude">High Altitude</option>
                    <option value="Heritage & Ruins">Heritage & Ruins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#B9B7AA] mb-1">Cover Image (Cloudinary Upload or URL)</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1B3627] hover:bg-[#264A37] border border-[#263B2F] rounded-xl text-xs font-medium text-[#E8B65C] transition shrink-0">
                        {isUploadingCover ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#E8B65C]" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-[#E8B65C]" />
                            <span>Upload Cover</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverUpload}
                          disabled={isUploadingCover}
                        />
                      </label>
                      <input
                        type="url"
                        placeholder="Or paste image URL"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-3 py-2.5 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                      />
                    </div>
                    {coverUploadError && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {coverUploadError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B9B7AA] mb-1">Short Excerpt (1-2 sentences)</label>
                <input
                  type="text"
                  placeholder="Brief synopsis appearing on preview cards..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-sm text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B9B7AA] mb-1">Article Body *</label>
                <textarea
                  rows={8}
                  placeholder="Write your article here. Share routes, tips, cultural contexts, food recommendations..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl p-4 text-sm text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C] font-sans"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleCreatePost('draft')}
                  className="bg-[#0B1B14] hover:bg-[#263B2F] text-[#B9B7AA] hover:text-[#F8F1E5] px-5 py-2.5 rounded-xl text-xs font-semibold transition"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleCreatePost('published')}
                  className="bg-gradient-to-r from-[#E8B65C] to-[#C4923C] hover:from-[#F4D18A] hover:to-[#E8B65C] text-[#06110D] font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg transition"
                >
                  Publish Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

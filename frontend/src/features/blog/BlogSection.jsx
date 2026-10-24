import React, { useState } from 'react';
import { api } from '../../services/api';
import { PenTool, Bookmark, Eye, Clock, Tag, CheckCircle2, AlertCircle, X } from 'lucide-react';

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
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1603288967527-2c13d705d15c?auto=format&fit=crop&w=1200&q=80');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('India, Heritage, Road Trip');
  const [submitting, setSubmitting] = useState(false);
  const [editorMsg, setEditorMsg] = useState(null);

  const categories = ['all', 'Travel Guides', 'Food & Culture', 'Eco Tourism', 'Heritage & Crafts'];

  const filteredPosts = posts.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
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
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950/60 p-8 sm:p-12 rounded-3xl border border-stone-800 relative overflow-hidden text-stone-100 shadow-xl">
        <div className="max-w-2xl relative z-10 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-block">
            ✍️ Public Travel Chronicles Across India
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight">
            Stories from the Sacred Ghats, Desert Forts & Cloud Forests
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Read first-hand travel accounts, regional food trails, conservation stories, and comprehensive itineraries penned by local explorers and contributors across Indian states.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenEditor}
              className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-orange-950/30 flex items-center gap-2 transition hover:scale-105"
            >
              <PenTool className="w-4 h-4" />
              Write an Article
            </button>
            <span className="text-xs text-stone-400">Open to all passionate travelers & locals</span>
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
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-stone-800/60 hover:bg-stone-800 text-stone-300 border border-stone-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search articles by title or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 bg-stone-900 border border-stone-800 rounded-2xl px-4 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500 placeholder:text-stone-500"
        />
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden card-hover-effect cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Cover Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-amber-400 border border-stone-700/60 text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                  {post.category}
                </div>
                <button
                  onClick={(e) => handleBookmark(post, e)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-stone-950/80 hover:bg-amber-600 text-stone-300 hover:text-white transition"
                  title="Bookmark story"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {post.read_time_minutes} min read
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-amber-500" />
                    {post.views_count} views
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-stone-400 text-xs line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </div>

            {/* Author Footer */}
            <div className="px-6 py-4 bg-stone-950/40 border-t border-stone-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center">
                  {post.author_name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-stone-300 truncate max-w-[140px]">
                  {post.author_name}
                </span>
              </div>
              <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                Read Story →
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-stone-100">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-stone-950/80 hover:bg-stone-800 text-stone-300 hover:text-white transition shadow-lg"
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
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500 text-stone-950">
                  {selectedPost.category}
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white drop-shadow-md">
                  {selectedPost.title}
                </h2>
              </div>
            </div>

            {/* Reader Content */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-stone-800 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-600/30 text-amber-300 font-bold flex items-center justify-center text-xs">
                    {selectedPost.author_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-200">{selectedPost.author_name}</p>
                    <p className="text-[10px]">Verified Contributor</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span>⏱️ {selectedPost.read_time_minutes} min read</span>
                  <span>👀 {selectedPost.views_count} views</span>
                </div>
              </div>

              {/* Formatted Story Content */}
              <div className="prose prose-invert prose-stone max-w-none space-y-4 text-stone-300 leading-relaxed text-base whitespace-pre-line">
                {selectedPost.content}
              </div>

              {/* Tags */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="pt-6 border-t border-stone-800 flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-stone-800 text-stone-300 px-3 py-1 rounded-xl text-xs flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-amber-500" />
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-stone-100 p-6 sm:p-8">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs uppercase font-bold text-amber-400">Contributor Workspace</span>
              <h3 className="text-2xl font-serif font-bold text-white mt-1">Publish a Travel Story</h3>
              <p className="text-xs text-stone-400">Share your recommendations, itineraries, or cultural narratives across India.</p>
            </div>

            {editorMsg && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                editorMsg.type === 'success' 
                  ? 'bg-emerald-950/50 border border-emerald-700 text-emerald-300' 
                  : 'bg-red-950/50 border border-red-700 text-red-300'
              }`}>
                {editorMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {editorMsg.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Article Title</label>
                <input
                  type="text"
                  placeholder="e.g., Hidden Waterfalls of the Western Ghats: A Monsoon Trail"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Travel Guides">Travel Guides</option>
                    <option value="Food & Culture">Food & Culture</option>
                    <option value="Eco Tourism">Eco Tourism</option>
                    <option value="Heritage & Crafts">Heritage & Crafts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Short Excerpt (1-2 sentences)</label>
                <input
                  type="text"
                  placeholder="Brief synopsis appearing on preview cards..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Article Body (Markdown supported)</label>
                <textarea
                  rows={8}
                  placeholder="Write your article here. Share routes, tips, cultural contexts, food recommendations..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-4 text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="India, Monsoon, Trekking, Heritage"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleCreatePost('draft')}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-5 py-2.5 rounded-xl text-xs font-semibold transition"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleCreatePost(user?.role === 'admin' ? 'published' : 'pending_review')}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-orange-950/20 transition"
                >
                  {user?.role === 'admin' ? 'Publish Now' : 'Submit for Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

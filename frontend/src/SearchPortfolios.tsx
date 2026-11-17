import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, User, ArrowLeft, Loader2, Calendar, Eye, ExternalLink, Code, Layers, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PortfolioModalPreview, { getLayoutMeta, PreviewPortfolioTarget } from './PortfolioModalPreview';

interface SearchPortfoliosProps {
  onBackToHome: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  currentUser?: any;
  onGoToDashboard?: () => void;
}

interface PortfolioItem {
  id: string;
  name: string;
  username: string;
  user_email?: string;
  layout: string;
  title?: string;
  email?: string;
  skills?: string[];
  profile_photo?: string;
  created_at?: string;
}

export default function SearchPortfolios({ onBackToHome, onLoginClick, onRegisterClick, currentUser, onGoToDashboard }: SearchPortfoliosProps) {
  const [query, setQuery] = useState('');
  const [personNameQuery, setPersonNameQuery] = useState('');
  const [usernameQuery, setUsernameQuery] = useState('');
  const [selectedLayoutFilter, setSelectedLayoutFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [previewingPortfolio, setPreviewingPortfolio] = useState<PreviewPortfolioTarget | null>(null);

  // Fetch portfolios with search parameters
  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('q', query.trim());
      if (personNameQuery.trim()) params.append('person_name', personNameQuery.trim());
      if (usernameQuery.trim()) params.append('username', usernameQuery.trim());

      const res = await fetch(`/api/search-portfolios?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch portfolios');
      }
      const data = await res.json();
      setPortfolios(data.portfolios || []);
    } catch (err: any) {
      console.error('Error searching portfolios:', err);
      setError(err.message || 'Could not load portfolios');
    } finally {
      setLoading(false);
    }
  }, [query, personNameQuery, usernameQuery]);

  // Initial load
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Debounced search on input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 350);
    return () => clearTimeout(timer);
  }, [query, personNameQuery, usernameQuery, performSearch]);

  const clearAllFilters = () => {
    setQuery('');
    setPersonNameQuery('');
    setUsernameQuery('');
    setSelectedLayoutFilter('all');
  };

  const filteredPortfolios = portfolios.filter(p => {
    if (selectedLayoutFilter === 'all') return true;
    return (p.layout || 'modern').toLowerCase() === selectedLayoutFilter.toLowerCase();
  });

  // Extract unique layouts from results for filter chips
  const availableLayouts = Array.from(new Set(portfolios.map(p => p.layout || 'modern')));

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 relative overflow-hidden flex flex-col">
      {/* Background Blobs (matching Landing page) */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

      {/* GradientBlinds (matching Landing page) */}


      {/* Top Navigation Bar */}
      <nav className="relative z-20 w-full px-6 py-5 flex items-center justify-between border-b border-purple-500/10 backdrop-blur-md bg-black/40">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/10 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentUser ? 'Back to Dashboard' : 'Back to Home'}</span>
          </button>

          <div
            onClick={onBackToHome}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="font-bold text-xl tracking-tight">PortX</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <button
              type="button"
              onClick={onGoToDashboard || onBackToHome}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-500 hover:to-pink-500 transition-all text-sm shadow-lg shadow-purple-500/20"
            >
              My Dashboard
            </button>
          ) : (
            <>
              {onLoginClick && (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="px-5 py-2 rounded-full font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm"
                >
                  Log In
                </button>
              )}
              {onRegisterClick && (
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-500 hover:to-pink-500 transition-all text-sm shadow-lg shadow-purple-500/20"
                >
                  Create Portfolio
                </button>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col">
        {/* Header Hero */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-900/30 border border-purple-500/30 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
              Public Portfolio Directory
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
              Discover Portfolios
            </span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg">
            Search talent by creator username or portfolio person name, and preview their live website with its custom stored layout.
          </p>
        </div>

        {/* Glass Search Controls Box */}
        <div className="mb-10 p-5 sm:p-6 bg-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.12)]">
          {/* Main Search Input */}
          <div className="relative flex items-center mb-4">
            <Search className="w-5 h-5 text-purple-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by person name, username (@user), or skills (e.g. React, Python)..."
              className="w-full pl-12 pr-12 py-3.5 bg-black/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 text-gray-400 hover:text-white p-1"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle for Dual/Advanced Fields */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-purple-500/15">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-xs font-medium text-purple-300 hover:text-purple-200 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{showAdvancedFilters ? 'Hide Specific Name / Username Fields' : 'Search by Specific Name & Username Fields'}</span>
            </button>

            {(query || personNameQuery || usernameQuery || selectedLayoutFilter !== 'all') && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Dedicated Person Name & Username Inputs */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-purple-500/10"
            >
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  Portfolio Person Name
                </label>
                <input
                  type="text"
                  value={personNameQuery}
                  onChange={(e) => setPersonNameQuery(e.target.value)}
                  placeholder="e.g. Akarsh Dileep"
                  className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  Creator Username / Email
                </label>
                <input
                  type="text"
                  value={usernameQuery}
                  onChange={(e) => setUsernameQuery(e.target.value)}
                  placeholder="e.g. user@example.com or username"
                  className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </motion.div>
          )}

          {/* Layout Filter Chips */}
          {availableLayouts.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-purple-500/10">
              <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
                <Layers className="w-3 h-3 text-purple-400" />
                Layout:
              </span>
              <button
                type="button"
                onClick={() => setSelectedLayoutFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedLayoutFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                  }`}
              >
                All Layouts
              </button>
              {availableLayouts.map((l) => {
                const meta = getLayoutMeta(l);
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setSelectedLayoutFilter(l)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedLayoutFilter === l
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                      }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Results Header / Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-400">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                Searching portfolios...
              </span>
            ) : (
              <span>
                Found <strong className="text-white">{filteredPortfolios.length}</strong> matching portfolio{filteredPortfolios.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Results Grid with Matching Glass Cards */}
        {loading && portfolios.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-purple-900/10 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 animate-pulse"
              >
                <div className="h-4 bg-purple-500/20 rounded-full w-24 mb-4" />
                <div className="h-6 bg-white/10 rounded-md w-3/4 mb-3" />
                <div className="h-4 bg-white/5 rounded-md w-1/2 mb-6" />
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-5/6" />
                </div>
                <div className="h-9 bg-purple-600/20 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : filteredPortfolios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolios.map((portfolio) => {
              const layoutMeta = getLayoutMeta(portfolio.layout);
              return (
                <div
                  key={portfolio.id}
                  className="group bg-purple-900/10 backdrop-blur-md border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/40 hover:bg-purple-900/20 transition-all hover:shadow-[0_0_35px_rgba(168,85,247,0.3)] flex flex-col justify-between"
                >
                  {/* Card Banner */}
                  <div className="relative p-6 bg-gradient-to-br from-purple-900/40 via-purple-950/20 to-black/60 border-b border-purple-500/10 flex flex-col justify-between overflow-hidden">
                    {/* Background icon indicator */}
                    <div className="absolute top-3 right-3 text-4xl opacity-15 pointer-events-none group-hover:scale-110 transition-transform">
                      {layoutMeta.icon}
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                        <span>{layoutMeta.icon}</span>
                        <span>{layoutMeta.name}</span>
                      </span>

                      {portfolio.created_at && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(portfolio.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                        {portfolio.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        <span>Created by <strong className="text-gray-200">@{portfolio.username}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {portfolio.title || "Professional portfolio website generated on PortX."}
                      </p>

                      {/* Skills Chips */}
                      {portfolio.skills && portfolio.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {portfolio.skills.slice(0, 5).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            >
                              {skill}
                            </span>
                          ))}
                          {portfolio.skills.length > 5 && (
                            <span className="text-xs text-gray-500 self-center">
                              +{portfolio.skills.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-4 border-t border-purple-500/10">
                      <button
                        type="button"
                        onClick={() => setPreviewingPortfolio({
                          id: portfolio.id,
                          name: portfolio.name,
                          layout: portfolio.layout,
                          username: portfolio.username
                        })}
                        className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Portfolio</span>
                      </button>

                      <a
                        href={`/p/${portfolio.id}.html`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 transition-colors"
                        title="Open in new window"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 px-6 bg-purple-900/10 border border-purple-500/20 rounded-2xl backdrop-blur-md flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-300">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Portfolios Found</h3>
            <p className="text-gray-400 max-w-md mb-6 text-sm">
              We couldn't find any portfolios matching your search criteria. Try using different keywords, searching by username, or clearing filters.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-purple-600/30 hover:bg-purple-600/50 text-white rounded-full text-sm font-medium border border-purple-500/40 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* Portfolio Preview Modal */}
      <PortfolioModalPreview
        portfolio={previewingPortfolio}
        onClose={() => setPreviewingPortfolio(null)}
      />
    </div>
  );
}


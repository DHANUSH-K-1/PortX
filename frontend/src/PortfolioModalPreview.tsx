import React, { useState } from 'react';
import { X, ExternalLink, Monitor, Tablet, Smartphone, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PreviewPortfolioTarget {
  id: string;
  name?: string;
  layout?: string;
  username?: string;
}

interface PortfolioModalPreviewProps {
  portfolio: PreviewPortfolioTarget | null;
  onClose: () => void;
}

export const getLayoutMeta = (layoutId: string = 'modern') => {
  const map: Record<string, { name: string; category: string; icon: string }> = {
    developer: { name: 'Software Engineer', category: 'Developer', icon: '💻' },
    terminal: { name: 'Hacker Terminal', category: 'Developer', icon: '⌨️' },
    cyberpunk: { name: 'Cyberpunk', category: 'Developer', icon: '🚀' },
    dark: { name: 'Dark Mode', category: 'Developer', icon: '🌙' },
    modern: { name: 'Modern Clean', category: 'Developer', icon: '✨' },
    '3d': { name: '3D Interactive', category: 'Developer', icon: '🔮' },
    space: { name: 'Galaxy Space', category: 'Developer', icon: '🪐' },
    creative: { name: 'Creative Agency', category: 'Creative', icon: '🎨' },
    designer: { name: 'UI/UX Designer', category: 'Creative', icon: '🖌️' },
    glass: { name: 'Glassmorphism', category: 'Creative', icon: '💎' },
    glass2: { name: 'Glassmorphism 2.0', category: 'Creative', icon: '🪟' },
    playful: { name: 'Playful UI', category: 'Creative', icon: '🎈' },
    brand: { name: 'Brand Story', category: 'Creative', icon: '📖' },
    story_v2: { name: 'Visual Storyteller', category: 'Creative', icon: '🎬' },
    professional: { name: 'Corporate Executive', category: 'Professional', icon: '👔' },
    resume: { name: 'Digital Resume', category: 'Professional', icon: '📄' },
    cards: { name: 'Bento Grid', category: 'Professional', icon: '🍱' },
    minimal: { name: 'Ultra Minimal', category: 'Professional', icon: '⚪' },
    impact: { name: 'High Impact', category: 'Professional', icon: '⚡' },
    dashboard: { name: 'Dashboard Portfolio', category: 'Professional', icon: '📊' },
    portfolio: { name: 'Portfolio Standard', category: 'Professional', icon: '📁' },
    portfolio_1: { name: 'Portfolio Template 1', category: 'Professional', icon: '🌟' },
    portfolio_2: { name: 'Portfolio Template 2', category: 'Professional', icon: '💫' },
    portfolio_standalone: { name: 'Portfolio Standalone', category: 'Professional', icon: '🎯' },
    photographer: { name: 'Lens Master', category: 'Media', icon: '📸' },
    magazine: { name: 'Editorial', category: 'Media', icon: '📰' },
    nature: { name: 'Organic Nature', category: 'Media', icon: '🌿' },
    neon: { name: 'Neon Lights', category: 'Media', icon: '💡' },
  };
  return map[layoutId] || { name: layoutId || 'Modern', category: 'Standard', icon: '✨' };
};

export default function PortfolioModalPreview({ portfolio, onClose }: PortfolioModalPreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeLoading, setIframeLoading] = useState(true);

  if (!portfolio) return null;

  const layoutInfo = getLayoutMeta(portfolio.layout);
  const previewUrl = `/p/${portfolio.id}.html${portfolio.layout ? `?layout=${encodeURIComponent(portfolio.layout)}` : ''}`;

  const getContainerWidth = () => {
    switch (device) {
      case 'mobile':
        return 'w-[375px] max-w-full';
      case 'tablet':
        return 'w-[768px] max-w-full';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-7xl h-[92vh] flex flex-col bg-zinc-950/90 border border-purple-500/30 rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.25)] overflow-hidden"
        >
          {/* Top Bar */}
          <div className="px-4 py-3 bg-purple-950/30 border-b border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
            {/* Title & Layout info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base flex items-center gap-2">
                  <span>{portfolio.name || 'Portfolio Preview'}</span>
                  {portfolio.username && (
                    <span className="text-xs text-gray-400 font-normal hidden sm:inline">
                      by @{portfolio.username}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400">Layout:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                    <span>{layoutInfo.icon}</span>
                    <span>{layoutInfo.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Device Switcher */}
            <div className="hidden sm:flex items-center bg-black/40 border border-purple-500/20 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  device === 'desktop'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  device === 'tablet'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  device === 'mobile'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs font-medium transition-all hover:border-purple-400"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open in New Tab</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Container */}
          <div className="flex-1 bg-zinc-900/60 p-2 sm:p-4 overflow-hidden flex items-center justify-center relative">
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 text-purple-300 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                <p className="text-sm font-medium">Rendering portfolio with {layoutInfo.name} layout...</p>
              </div>
            )}

            <div
              className={`h-full transition-all duration-300 ease-out bg-white rounded-xl overflow-hidden shadow-2xl border border-white/10 ${getContainerWidth()}`}
            >
              <iframe
                src={previewUrl}
                title={`${portfolio.name} Portfolio`}
                className="w-full h-full border-0"
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


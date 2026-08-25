import React from 'react';
import { MediaItem } from '../types';
import { Play, Download, Star, Calendar, Sparkles, Film, Bookmark } from 'lucide-react';

interface HeroBannerProps {
  featuredItem: MediaItem | null;
  onSelect: (item: MediaItem) => void;
  onQuickPlay: (item: MediaItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (item: MediaItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredItem,
  onSelect,
  onQuickPlay,
  isFavorite,
  onToggleFavorite,
}) => {
  if (!featuredItem) return null;

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-[#1e293b] border border-slate-700 shadow-xl mb-8">
      {/* Background Image / Ambient Blur */}
      <div className="absolute inset-0 bg-cover bg-center overflow-hidden">
        <img
          src={featuredItem.poster}
          alt={featuredItem.title}
          className="w-full h-full object-cover object-center filter blur-xl scale-125 opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-[#1e293b]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e293b] via-[#1e293b]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
        <div className="space-y-3.5 max-w-2xl text-center md:text-right">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded shadow">
              <Sparkles className="w-3 h-3" />
              العمل المميز اليوم
            </span>
            <span className="text-xs font-semibold bg-[#0f172a] text-blue-400 px-2.5 py-0.5 rounded border border-slate-700">
              {featuredItem.quality || '1080p WEB-DL'}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold bg-[#0f172a] text-amber-400 px-2 py-0.5 rounded border border-slate-700">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {featuredItem.rating || '7.5'}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-300 bg-[#0f172a] px-2 py-0.5 rounded border border-slate-700">
              <Calendar className="w-3 h-3" />
              {featuredItem.year || '2026'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            {featuredItem.title}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 max-w-xl">
            شاهد وحمل {featuredItem.title} بجودة عالية وبروابط تحميل ومباشرة متعددة تدعم جميع الأجهزة الذكية وبأعلى سرعة ممكنة.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            <button
              onClick={() => onQuickPlay(featuredItem)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded shadow transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>مشاهدة الآن</span>
            </button>

            <button
              onClick={() => onSelect(featuredItem)}
              className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-700 text-slate-200 font-medium px-4 py-2.5 rounded border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>استخراج الروابط</span>
            </button>

            <button
              onClick={() => onToggleFavorite(featuredItem)}
              className={`p-2.5 rounded border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-[#0f172a] text-slate-300 hover:text-amber-400 border-slate-700 hover:bg-slate-700'
              }`}
              title={isFavorite ? 'محفوظ في المفضلة' : 'حفظ في المفضلة'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-slate-950' : ''}`} />
            </button>
          </div>
        </div>

        {/* Featured Mini Poster on Desktop */}
        <div
          onClick={() => onSelect(featuredItem)}
          className="hidden md:block w-36 aspect-[2/3] rounded-lg overflow-hidden shadow-xl border border-slate-700 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
        >
          <img
            src={featuredItem.poster}
            alt={featuredItem.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

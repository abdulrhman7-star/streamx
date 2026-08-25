import React, { useState } from 'react';
import { MediaItem } from '../types';
import { Play, Download, Star, Bookmark, Film, Tv, Check } from 'lucide-react';

interface MediaCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
  onQuickPlay: (item: MediaItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (item: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onSelect,
  onQuickPlay,
  isFavorite,
  onToggleFavorite,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fallback poster if downet/ak.sv image is blocked
  const defaultPoster =
    item.poster && !imgError
      ? item.poster
      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80';

  return (
    <div className="group relative bg-[#1e293b] rounded-lg overflow-hidden border border-slate-700 hover:border-slate-500 transition-all duration-200 shadow-md flex flex-col">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#0f172a]">
        <img
          src={defaultPoster}
          alt={item.title}
          onError={() => setImgError(true)}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Shimmer skeleton before load */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse" />
        )}

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none z-10">
          {/* Quality Badge */}
          {item.quality && (
            <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0f172a]/90 text-blue-400 border border-slate-700 shadow-sm">
              {item.quality}
            </span>
          )}

          {/* Rating Badge */}
          {item.rating && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0f172a]/90 text-amber-400 border border-slate-700 text-xs font-bold shadow-sm">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{item.rating}</span>
            </div>
          )}
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickPlay(item);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded shadow transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>مشاهدة</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className="flex items-center justify-center p-1.5 rounded bg-[#1e293b] hover:bg-slate-700 text-white border border-slate-700 transition cursor-pointer"
              title="تفاصيل وروابط التحميل"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>
        </div>

        {/* Bookmark Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item);
          }}
          className={`absolute bottom-2 right-2 z-20 p-1.5 rounded transition shadow ${
            isFavorite
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              : 'bg-[#0f172a]/90 text-slate-300 hover:text-amber-400 hover:bg-slate-800 border border-slate-700'
          }`}
          title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
        >
          {isFavorite ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Card Info */}
      <div
        onClick={() => onSelect(item)}
        className="p-3 flex-1 flex flex-col justify-between cursor-pointer space-y-1.5"
      >
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
            {item.type === 'series' ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Tv className="w-3 h-3" />
                مسلسل
              </span>
            ) : (
              <span className="flex items-center gap-1 text-blue-400 font-medium">
                <Film className="w-3 h-3" />
                فيلم
              </span>
            )}
            <span>•</span>
            <span>{item.year || '2026'}</span>
          </div>

          <h4
            className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1 leading-snug"
            title={item.title}
          >
            {item.title}
          </h4>
        </div>

        {/* Genre Tags */}
        {item.genres && item.genres.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden pt-0.5">
            {item.genres.slice(0, 2).map((g, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-[#0f172a] text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap"
              >
                {g}
              </span>
            ))}
            {item.genres.length > 2 && (
              <span className="text-[9px] text-slate-500">+{item.genres.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

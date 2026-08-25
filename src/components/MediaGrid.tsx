import React from 'react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';
import { Film, Loader2, ArrowDown, SearchX } from 'lucide-react';

interface MediaGridProps {
  items: MediaItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectMedia: (item: MediaItem) => void;
  onQuickPlay: (item: MediaItem) => void;
  favorites: MediaItem[];
  onToggleFavorite: (item: MediaItem) => void;
  emptyMessage?: string;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onSelectMedia,
  onQuickPlay,
  favorites,
  onToggleFavorite,
  emptyMessage = 'لا توجد نتائج مطابقة لبحثك',
}) => {
  const isFav = (id: string) => favorites.some((f) => f.id === id);

  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#1e293b] rounded-lg overflow-hidden border border-slate-700 animate-pulse flex flex-col"
          >
            <div className="aspect-[2/3] bg-slate-800 w-full" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-slate-800 rounded w-1/3" />
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-[#1e293b] border border-slate-700 rounded-lg p-8">
        <div className="w-12 h-12 rounded-full bg-[#0f172a] border border-slate-700 flex items-center justify-center text-slate-400">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">{emptyMessage}</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          جرب البحث بكلمات أخرى أو قم بإلغاء بعض الفلاتر لعرض مزيد من الأفلام والمسلسلات.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item, index) => (
          <MediaCard
            key={`${item.id || 'item'}-${item.link || index}-${index}`}
            item={item}
            onSelect={onSelectMedia}
            onQuickPlay={onQuickPlay}
            isFavorite={isFav(item.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Pagination / Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-2 pb-6">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-700 text-white font-medium text-sm px-6 py-2.5 rounded border border-slate-700 shadow transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>جاري التحميل...</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-4 h-4 text-blue-400" />
                <span>تحميل المزيد من الأعمال (الصفحة التالية)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

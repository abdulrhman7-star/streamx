import React from 'react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';
import { Bookmark, Trash2, X, ArrowRight, Film, Sparkles } from 'lucide-react';

interface FavoritesViewProps {
  favorites: MediaItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
  onQuickPlay: (item: MediaItem) => void;
  onToggleFavorite: (item: MediaItem) => void;
  onClearAll: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  isOpen,
  onClose,
  onSelectMedia,
  onQuickPlay,
  onToggleFavorite,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-[#1e293b] border border-slate-700 rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bookmark className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">قائمتي المفضلة</h2>
              <span className="text-xs text-slate-400">
                لديك {favorites.length} عناصر محفوظة للمشاهدة لاحقاً
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {favorites.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-[#1e293b] hover:bg-rose-950 px-2.5 py-1.5 rounded border border-slate-700 hover:border-rose-800 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إفراغ القائمة</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="text-sm font-medium">رجوع</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {favorites.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0f172a] border border-slate-700 flex items-center justify-center text-slate-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">لم تقم بإضافة أي فيلم أو مسلسل لمفضلتك بعد</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                اضغط على أيقونة الحفظ على أي بوستر لإضافته لقائمتك الخاصة للمشاهدة في أي وقت.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favorites.map((item, index) => (
                <MediaCard
                  key={`${item.id || 'fav'}-${item.link || index}-${index}`}
                  item={item}
                  onSelect={onSelectMedia}
                  onQuickPlay={onQuickPlay}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

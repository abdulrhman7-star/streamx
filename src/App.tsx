import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { MediaItem, FilterState } from './types';
import { fetchCategoryFeed, searchMedia, checkApiHealth } from './services/api';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { HeroBanner } from './components/HeroBanner';
import { MediaGrid } from './components/MediaGrid';
import { MediaModal } from './components/MediaModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { FavoritesView } from './components/FavoritesView';
import { ApiTesterModal } from './components/ApiTesterModal';
import { Film, Tv, Sparkles, Clapperboard, Heart, Info, Radio } from 'lucide-react';

const FAVORITES_STORAGE_KEY = 'akwam_favorites_list_v1';

export default function App() {
  const [currentCategory, setCurrentCategory] = useState<string>('movies');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [sourceLabel, setSourceLabel] = useState<string>('live_scraped');

  // Modals & Drawers State
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [playerState, setPlayerState] = useState<{ url: string | null; title: string }>({ url: null, title: '' });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [isApiTesterOpen, setIsApiTesterOpen] = useState<boolean>(false);

  // Favorites in localStorage
  const [favorites, setFavorites] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter Bar State
  const initialFilters: FilterState = {
    section: '0',
    year: '0',
    rating: '0',
    formats: '0',
    quality: '0',
    sortBy: 'latest',
  };
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }, [favorites]);

  // Check backend scraper health
  useEffect(() => {
    checkApiHealth().then((res) => {
      setApiStatus(res.status === 'online' ? 'online' : 'offline');
    });
  }, []);

  // Debounce Search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Main Data Fetcher
  const loadData = useCallback(
    async (targetPage: number = 0, isAppend: boolean = false) => {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const isSearchOrFilter =
          debouncedSearch.trim().length > 0 ||
          filters.section !== '0' ||
          filters.year !== '0' ||
          filters.rating !== '0' ||
          filters.formats !== '0' ||
          filters.quality !== '0';

        if (isSearchOrFilter) {
          // Trigger search endpoint
          const result = await searchMedia({
            q: debouncedSearch.trim(),
            section: filters.section,
            year: filters.year,
            rating: filters.rating,
            formats: filters.formats,
            quality: filters.quality,
            page: targetPage + 1,
          });

          setSourceLabel(result.source || 'live_scraped');
          if (isAppend) {
            setItems((prev) => {
              const existingKeys = new Set(prev.map((i) => `${i.id}-${i.link}`));
              const newItems = result.data.filter((i) => !existingKeys.has(`${i.id}-${i.link}`));
              return [...prev, ...newItems];
            });
          } else {
            const uniqueItems: MediaItem[] = [];
            const seenKeys = new Set<string>();
            for (const item of result.data) {
              const key = `${item.id}-${item.link}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueItems.push(item);
              }
            }
            setItems(uniqueItems);
          }
          setHasMore(result.data.length >= 8);
        } else {
          // Trigger feed endpoint
          const result = await fetchCategoryFeed(currentCategory, targetPage);
          setSourceLabel(result.source || 'live_scraped');
          if (isAppend) {
            setItems((prev) => {
              const existingKeys = new Set(prev.map((i) => `${i.id}-${i.link}`));
              const newItems = result.data.filter((i) => !existingKeys.has(`${i.id}-${i.link}`));
              return [...prev, ...newItems];
            });
          } else {
            const uniqueItems: MediaItem[] = [];
            const seenKeys = new Set<string>();
            for (const item of result.data) {
              const key = `${item.id}-${item.link}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueItems.push(item);
              }
            }
            setItems(uniqueItems);
          }
          setHasMore(result.hasMore ?? result.data.length >= 8);
        }
      } catch (error) {
        console.error('Data load error:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [currentCategory, debouncedSearch, filters]
  );

  // Trigger load on category, debounced search, or filter changes
  useEffect(() => {
    setPage(0);
    loadData(0, false);
  }, [loadData]);

  // Handle Load More (Pagination)
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, true);
  };

  // Toggle Favorite
  const handleToggleFavorite = (item: MediaItem) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id);
      if (exists) {
        return prev.filter((f) => f.id !== item.id);
      } else {
        return [item, ...prev];
      }
    });
  };

  // Clear all favorites
  const handleClearFavorites = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع العناصر المحفوظة في المفضلة؟')) {
      setFavorites([]);
    }
  };

  // Quick Watch Handler
  const handleQuickPlay = (item: MediaItem) => {
    setPlayerState({
      url: item.link,
      title: item.title,
    });
  };

  const getSectionTitle = () => {
    if (debouncedSearch) return `نتائج البحث عن: "${debouncedSearch}"`;
    if (filters.section !== '0' || filters.year !== '0') return 'نتائج التصفية المتقدمة';
    switch (currentCategory) {
      case 'home':
        return 'أحدث الإضافات والترشيحات اليومية';
      case 'movies':
        return 'أحدث الأفلام السينمائية العربية والأجنبية';
      case 'series':
        return 'أحدث المسلسلات والمواسم التلفزيونية';
      case 'shows':
        return 'العروض التلفزيونية والمصارعة الحرة';
      case 'mix':
        return 'المنوعات والبرامج الخاصة';
      default:
        return 'الأعمال المتاحة';
    }
  };

  const featured = items.length > 0 ? items[0] : null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col antialiased">
      {/* Sticky Header */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen((prev) => !prev)}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenApiTester={() => setIsApiTesterOpen(true)}
        apiStatus={apiStatus}
      />

      {/* Advanced Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
        isOpen={isFilterOpen}
        totalResultsCount={items.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Featured Hero (shown on home/feed when not searching) */}
        {!debouncedSearch && page === 0 && !isFilterOpen && featured && (
          <HeroBanner
            featuredItem={featured}
            onSelect={setSelectedMedia}
            onQuickPlay={handleQuickPlay}
            isFavorite={favorites.some((f) => f.id === featured.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-6 bg-blue-600 rounded" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {getSectionTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-[#1e293b] px-3 py-1.5 rounded border border-slate-700">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>المصدر: {sourceLabel === 'live_scraped' ? 'ak.sv المباشر' : 'المخزن السحابي الاحتياطي'}</span>
          </div>
        </div>

        {/* Media Grid */}
        <MediaGrid
          items={items}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onSelectMedia={setSelectedMedia}
          onQuickPlay={handleQuickPlay}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-[#1e293b] border-t border-slate-700 py-8 px-4 sm:px-6 lg:px-8 text-center text-slate-400">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-white font-bold text-base">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-xs text-white">
              AK
            </div>
            <span>أكـوام برو • Akwam Scraper & Media Dashboard</span>
          </div>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            منصة متقدمة لاستخراج روابط المشاهدة والتحميل المباشرة لجميع الأفلام والمسلسلات بجودات متعددة وسيرفرات سريعة.
          </p>
          <div className="text-xs text-slate-500 font-mono">
            Node.js Express + React & Tailwind CSS • 2026
          </div>
        </div>
      </footer>

      {/* Media Detail Modal */}
      <MediaModal
        item={selectedMedia}
        onClose={() => setSelectedMedia(null)}
        onWatchVideo={(url, title) => {
          setSelectedMedia(null);
          setPlayerState({ url, title });
        }}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        url={playerState.url}
        title={playerState.title}
        onClose={() => setPlayerState({ url: null, title: '' })}
      />

      {/* Favorites Drawer View */}
      <FavoritesView
        favorites={favorites}
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onSelectMedia={(item) => {
          setIsFavoritesOpen(false);
          setSelectedMedia(item);
        }}
        onQuickPlay={(item) => {
          setIsFavoritesOpen(false);
          handleQuickPlay(item);
        }}
        onToggleFavorite={handleToggleFavorite}
        onClearAll={handleClearFavorites}
      />

      {/* API Tester & Inspector Modal */}
      <ApiTesterModal
        isOpen={isApiTesterOpen}
        onClose={() => setIsApiTesterOpen(false)}
      />
    </div>
  );
}

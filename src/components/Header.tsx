import React from 'react';
import { Film, Tv, Home, Clapperboard, Sparkles, Search, SlidersHorizontal, Bookmark, Terminal, X, Wifi } from 'lucide-react';

interface HeaderProps {
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenApiTester: () => void;
  apiStatus: 'online' | 'offline' | 'checking';
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isFilterOpen,
  onToggleFilter,
  favoritesCount,
  onOpenFavorites,
  onOpenApiTester,
  apiStatus,
}) => {
  const categories = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'movies', label: 'الأفلام', icon: Film },
    { id: 'series', label: 'المسلسلات', icon: Tv },
    { id: 'shows', label: 'عروض وتلفزيون', icon: Clapperboard },
    { id: 'mix', label: 'منوعات', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1e293b] border-b border-slate-700 shadow-xl">
      {/* Top Banner Status */}
      <div className="bg-[#0f172a] px-4 py-1 text-xs border-b border-slate-800 text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              خادم الجلب والبروكسي: {apiStatus === 'online' ? 'متصل ومباشر (akwam.ss)' : 'وضع الاحتياط النشط'}
            </span>
            <span className="hidden sm:inline-block text-slate-600">•</span>
            <span className="hidden sm:inline-block text-slate-400">استخراج روابط التحميل والمشاهدة بجودات 4K, 1080p, 720p</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenApiTester}
              className="flex items-center gap-1 text-xs bg-[#1e293b] hover:bg-slate-700 text-blue-400 hover:text-blue-300 px-2.5 py-0.5 rounded border border-slate-700 transition"
              title="مختبر الـ API ومحلل الروابط"
            >
              <Terminal className="w-3 h-3" />
              <span>فحص الـ API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory('home');
              }}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg text-white shadow-md">
                AK
              </div>
              <span className="text-xl font-bold tracking-tight text-white">أكـوام برو</span>
            </a>

            {/* Navigation Category Tabs (Desktop) */}
            <nav className="hidden md:flex items-center gap-6">
              {categories.map((cat) => {
                const isActive = currentCategory === cat.id && !searchQuery;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSearchChange('');
                      onSelectCategory(cat.id);
                    }}
                    className={`text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'text-blue-500 border-b-2 border-blue-500 pb-1'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="بحث عن أفلام أو مسلسلات..."
                className="w-full bg-[#0f172a] border border-slate-700 rounded-full py-2 pr-10 pl-8 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition shadow-inner"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800 transition"
                  title="مسح البحث"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={onToggleFilter}
              className={`px-3 py-2 bg-[#1e293b] border rounded text-xs transition-colors flex items-center gap-1.5 ${
                isFilterOpen
                  ? 'bg-blue-600 text-white border-blue-600 shadow'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="تصفية وفلترة متقدمة"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">الفلترة</span>
            </button>

            {/* Favorites Button */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 bg-[#1e293b] border border-slate-700 rounded text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition"
              title="قائمتي المفضلة"
            >
              <Bookmark className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow">
                  {favoritesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between gap-1 py-2 border-t border-slate-700 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSearchChange('');
                  onSelectCategory(cat.id);
                }}
                className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-[#0f172a]'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

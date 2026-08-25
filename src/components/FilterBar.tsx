import React from 'react';
import { FilterState } from '../types';
import { RotateCcw, Check, Star, Video, Layers, Calendar, Filter } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  isOpen: boolean;
  totalResultsCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  isOpen,
  totalResultsCount,
}) => {
  if (!isOpen) return null;

  const sections = [
    { value: '0', label: 'جميع الأقسام' },
    { value: 'movie', label: 'الأفلام' },
    { value: 'series', label: 'المسلسلات' },
    { value: 'show', label: 'تلفزيون وعروض' },
    { value: 'mix', label: 'منوعات' },
  ];

  const years = [
    { value: '0', label: 'كل السنوات' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2019', label: '2019' },
    { value: '2015', label: '2015' },
    { value: '2010', label: '2010' },
    { value: '2000', label: '2000' },
  ];

  const ratings = [
    { value: '0', label: 'أي تقييم' },
    { value: '8', label: '8+ ممتاز ⭐' },
    { value: '7', label: '7+ جيد جداً' },
    { value: '6', label: '6+ جيد' },
    { value: '5', label: '5+ متوسط' },
  ];

  const formats = [
    { value: '0', label: 'كل الصيغ' },
    { value: 'BluRay', label: 'BluRay بلوراي' },
    { value: 'WEB-DL', label: 'WEB-DL ويب' },
    { value: 'WebRip', label: 'WebRip' },
    { value: 'HDTV', label: 'HDTV تلفزيوني' },
    { value: 'CAM', label: 'CAM تصوير سينما' },
  ];

  const qualities = [
    { value: '0', label: 'كل الدقات' },
    { value: '4K', label: '4K Ultra HD' },
    { value: '1080p', label: '1080p Full HD' },
    { value: '720p', label: '720p HD' },
    { value: '480p', label: '480p SD' },
  ];

  const isFiltered =
    filters.section !== '0' ||
    filters.year !== '0' ||
    filters.rating !== '0' ||
    filters.formats !== '0' ||
    filters.quality !== '0';

  return (
    <div className="bg-[#1e293b] border-b border-slate-700 p-4 sm:p-5 transition-all">
      <div className="max-w-7xl mx-auto space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">التصفية والفلترة المتقدمة</h3>
            {totalResultsCount !== undefined && (
              <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                {totalResultsCount} نتيجة
              </span>
            )}
          </div>

          {isFiltered && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-[#0f172a] hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Section Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>القسم</span>
            </label>
            <select
              value={filters.section}
              onChange={(e) => onChange({ ...filters, section: e.target.value })}
              className="w-full bg-[#0f172a] text-slate-200 text-xs rounded px-3 py-2 border border-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {sections.map((sec) => (
                <option key={sec.value} value={sec.value}>
                  {sec.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>سنة الإنتاج</span>
            </label>
            <select
              value={filters.year}
              onChange={(e) => onChange({ ...filters, year: e.target.value })}
              className="w-full bg-[#0f172a] text-slate-200 text-xs rounded px-3 py-2 border border-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {years.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>التقييم الأدنى</span>
            </label>
            <select
              value={filters.rating}
              onChange={(e) => onChange({ ...filters, rating: e.target.value })}
              className="w-full bg-[#0f172a] text-slate-200 text-xs rounded px-3 py-2 border border-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {ratings.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Format Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>الصيغة</span>
            </label>
            <select
              value={filters.formats}
              onChange={(e) => onChange({ ...filters, formats: e.target.value })}
              className="w-full bg-[#0f172a] text-slate-200 text-xs rounded px-3 py-2 border border-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {formats.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quality Resolution Filter */}
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-blue-400" />
              <span>دقة العرض</span>
            </label>
            <select
              value={filters.quality}
              onChange={(e) => onChange({ ...filters, quality: e.target.value })}
              className="w-full bg-[#0f172a] text-slate-200 text-xs rounded px-3 py-2 border border-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {qualities.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

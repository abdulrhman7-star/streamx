import React, { useState, useEffect } from 'react';
import { MediaItem, MediaDetail } from '../types';
import { fetchMediaDetail } from '../services/api';
import {
  X,
  Play,
  Download,
  Star,
  Film,
  Tv,
  ExternalLink,
  Copy,
  Check,
  Server,
  Loader2,
  Calendar,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface MediaModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onWatchVideo: (serverUrl: string, title: string) => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({ item, onClose, onWatchVideo }) => {
  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    setLoading(true);
    setDetail(null);

    fetchMediaDetail({ id: item.id, url: item.link })
      .then((data) => {
        if (isMounted) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Detail fetch error:', err);
        if (isMounted) {
          // Fallback detail
          setDetail({
            ...item,
            story: 'تدور أحداث هذا العمل في إطار شيق ومليء بالإثارة والغموض.',
            downloadLinks: [
              { quality: '1080p Full HD', resolution: '1920x1080', size: '2.2 GB', url: item.link },
              { quality: '720p HD Ready', resolution: '1280x720', size: '1.2 GB', url: item.link },
              { quality: '480p SD Mobile', resolution: '854x480', size: '480 MB', url: item.link },
            ],
            watchServers: [
              { name: 'سيرفر أكوام الأساسي (1080p)', url: item.link },
              { name: 'سيرفر بديل سريع (Cloud CDN)', url: item.link },
            ],
          });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [item]);

  if (!item) return null;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#1e293b] border border-slate-700 rounded-lg overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 p-2 rounded-full bg-[#0f172a]/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs font-medium text-slate-400">جاري استخراج روابط المشاهدة والتحميل من المصدر...</p>
          </div>
        ) : detail ? (
          <div className="overflow-y-auto">
            {/* Header Hero Banner */}
            <div className="relative bg-gradient-to-t from-[#1e293b] via-[#1e293b]/90 to-transparent pt-10 pb-6 px-6 sm:px-8 border-b border-slate-700">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Poster */}
                <div className="w-36 sm:w-44 aspect-[2/3] rounded-lg overflow-hidden shadow-xl border border-slate-700 shrink-0 mx-auto sm:mx-0">
                  <img
                    src={detail.poster}
                    alt={detail.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Metadata & Title */}
                <div className="flex-1 space-y-3 text-center sm:text-right">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-600 text-white">
                      {detail.type === 'series' ? 'مسلسل تلفزيوني' : 'فيلم سينمائي'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#0f172a] text-blue-400 border border-slate-700">
                      {detail.quality || '1080p WEB-DL'}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#0f172a] text-amber-400 border border-slate-700">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {detail.rating || '7.5'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-300 bg-[#0f172a] px-2 py-0.5 rounded border border-slate-700">
                      <Calendar className="w-3 h-3" />
                      {detail.year || '2026'}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {detail.title}
                  </h2>

                  {/* Genres */}
                  {detail.genres && detail.genres.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                      {detail.genres.map((g, i) => (
                        <span
                          key={i}
                          className="text-xs bg-[#0f172a] text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Story Summary */}
                  <div className="pt-1">
                    <h4 className="text-xs font-semibold text-slate-400 mb-1">القصة والأحداث:</h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl bg-[#0f172a] p-3 rounded border border-slate-700">
                      {detail.story}
                    </p>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                    <button
                      onClick={() => onWatchVideo(detail.watchServers[0]?.url || detail.link, detail.title)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded shadow transition-colors cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>مشاهدة مباشرة</span>
                    </button>

                    <a
                      href={detail.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs px-4 py-2.5 rounded border border-slate-700 transition"
                    >
                      <span>الصفحة في أكوام</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs & Sections */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* 1. Direct Download Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>روابط التحميل المباشرة:</span>
                  </h3>
                  <span className="text-xs text-slate-400">سيرفرات فائقة السرعة</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detail.downloadLinks.map((dl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-slate-700 hover:border-slate-600 transition"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/40">
                            {dl.quality}
                          </span>
                          {dl.resolution && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              {dl.resolution}
                            </span>
                          )}
                        </div>
                        {dl.size && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            الحجم: {dl.size}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(dl.directUrl || dl.url)}
                          className={`p-2 rounded border text-xs transition flex items-center gap-1 cursor-pointer ${
                            copiedUrl === (dl.directUrl || dl.url)
                              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-[#1e293b] text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
                          }`}
                          title="نسخ الرابط المباشر"
                        >
                          {copiedUrl === (dl.directUrl || dl.url) ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">نسخ</span>
                            </>
                          )}
                        </button>

                        <a
                          href={dl.directUrl || dl.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded shadow transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Direct Streaming Servers */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  <span>سيرفرات المشاهدة المباشرة:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {detail.watchServers.map((srv, idx) => (
                    <button
                      key={idx}
                      onClick={() => onWatchVideo(srv.url, `${detail.title} - ${srv.name}`)}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition group text-right cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition">
                          <Play className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                          {srv.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Series Episodes (If Series) */}
              {detail.type === 'series' && detail.episodes && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tv className="w-4 h-4 text-emerald-400" />
                      <span>حلقات المسلسل:</span>
                    </h3>
                    <span className="text-xs text-slate-400">اختر الحلقة للمشاهدة أو التحميل</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {detail.episodes.map((ep, idx) => (
                      <button
                        key={`${ep.episodeNumber || 'ep'}-${ep.link || idx}-${idx}`}
                        onClick={() => onWatchVideo(ep.link, `${detail.title} - ${ep.title}`)}
                        className="p-2.5 rounded bg-[#0f172a] hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/50 text-right transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium text-slate-200 group-hover:text-blue-400">
                            {ep.title}
                          </div>
                          <span className="text-[10px] text-slate-400">1080p FHD</span>
                        </div>
                        <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

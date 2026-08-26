import React, { useState, useEffect } from 'react';
import { MediaItem, MediaDetail } from '../types';
import { fetchMediaDetail, autoResolveSeriesData } from '../services/api';
import {
  X,
  ArrowRight,
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
  onSearch?: (query: string) => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({ item, onClose, onWatchVideo, onSearch }) => {
  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [extractedLinks, setExtractedLinks] = useState<{url: string, type: string, size: string}[] | null>(null);
  const [loadingExtractedLinks, setLoadingExtractedLinks] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<{link: string, title: string} | null>(null);
  const [playingServerId, setPlayingServerId] = useState<string | null>(null);

  const handleAutoExtractAndPlay = async (url: string, title: string, elementId: string) => {
    setPlayingServerId(elementId);
    
    // Optionally fetch in background to populate download links section
    setSelectedEpisode({ link: url, title });
    extractLinks(url, { current: true });

    try {
      const res = await fetch(`/api/get-links?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.success && data.links && data.links.length > 0) {
        const bestLink = data.links[0];
        onWatchVideo(bestLink.url, `${title} - (${bestLink.size}p)`);
      } else {
        onWatchVideo(url, title);
      }
    } catch (err) {
      console.error('Extraction failed for auto-play:', err);
      onWatchVideo(url, title);
    } finally {
      setPlayingServerId(null);
    }
  };

  const extractLinks = async (url: string, isMounted: { current: boolean }) => {
    setLoadingExtractedLinks(true);
    setExtractedLinks(null);
    try {
      const res = await fetch(`/api/get-links?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (isMounted.current && data.success) {
        setExtractedLinks(data.links);
      }
    } catch (err) {
      console.error('Error fetching links:', err);
    } finally {
      if (isMounted.current) setLoadingExtractedLinks(false);
    }
  };

  useEffect(() => {
    if (!item) return;

    const isMounted = { current: true };
    setLoading(true);
    setDetail(null);
    setSelectedEpisode(null);
    setExtractedLinks(null);

    // Fetch movie details
    fetchMediaDetail({ id: item.id, url: item.link })
      .then(async (data) => {
        if (!isMounted.current) return;
        
        // If it's a series, fetch real episodes and seasons from our new API
        if (data.type === 'series') {
          try {
            const seriesData = await autoResolveSeriesData(item.link);
            if (seriesData.episodes && seriesData.episodes.length > 0) {
              data.episodes = seriesData.episodes;
            }
            if (seriesData.seasons && seriesData.seasons.length > 0) {
              data.seasons = seriesData.seasons;
            }
          } catch (e) {
            console.error('Failed to fetch series episodes:', e);
          }
        }
        
        if (isMounted.current) {
          setDetail(data);
          setLoading(false);
          // If it's a movie, extract links immediately
          if (data.type !== 'series') {
            extractLinks(item.link, isMounted);
          }
        }
      })
      .catch((err) => {
        console.error('Detail fetch error:', err);
        if (isMounted.current) {
          // Fallback detail
          setDetail({
            ...item,
            story: 'تدور أحداث هذا العمل في إطار شيق ومليء بالإثارة والغموض.',
            downloadLinks: [
              { quality: '1080p Full HD', resolution: '1920x1080', size: '2.2 GB', url: item.link },
            ],
            watchServers: [],
          });
          setLoading(false);
          if (item.type !== 'series') {
             extractLinks(item.link, isMounted);
          }
        }
      });

    return () => {
      isMounted.current = false;
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
        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0f172a]/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm font-medium">رجوع</span>
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
              
              {/* Seasons (If Series) */}
              {detail.type === 'series' && detail.seasons && detail.seasons.length > 0 && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-orange-400" />
                      <span>مواسم وأجزاء أخرى:</span>
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detail.seasons.map((season, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (onSearch) onSearch(season.title);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-orange-500/50 bg-[#0f172a] hover:bg-orange-600/10 text-xs font-medium text-slate-300 hover:text-orange-400 transition"
                      >
                        {season.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 1. Series Episodes (If Series) */}
              {detail.type === 'series' && detail.episodes && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tv className="w-4 h-4 text-emerald-400" />
                      <span>حلقات المسلسل:</span>
                    </h3>
                    <span className="text-xs text-slate-400">اختر الحلقة لاستخراج الروابط المباشرة</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {detail.episodes.map((ep, idx) => {
                      const isSelected = selectedEpisode?.link === ep.link;
                      const isPlaying = playingServerId === ep.link;
                      return (
                        <button
                          key={`${ep.episodeNumber || 'ep'}-${ep.link || idx}-${idx}`}
                          onClick={() => handleAutoExtractAndPlay(ep.link, `${detail.title} - ${ep.title}`, ep.link)}
                          disabled={isPlaying}
                          className={`p-2.5 rounded border text-right transition flex items-center justify-between group cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                              : 'bg-[#0f172a] hover:bg-blue-600/10 border-slate-700 hover:border-blue-500/50'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className={`text-xs font-medium ${isSelected ? 'text-blue-400' : 'text-slate-200 group-hover:text-blue-300'}`}>
                              {ep.title}
                            </div>
                            <span className="text-[10px] text-slate-400">1080p FHD</span>
                          </div>
                          {isPlaying ? (
                             <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                          ) : isSelected ? (
                             <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          ) : (
                             <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 2. Extracted Links Section */}
              <div id="extracted-links-section">
                {loadingExtractedLinks ? (
                   <div className="py-8 flex flex-col items-center justify-center space-y-3 bg-[#0f172a]/50 rounded-lg border border-slate-700/50">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      <span className="text-xs text-slate-400 font-medium px-2">جاري استخراج السيرفرات المباشرة{selectedEpisode ? ` لـ ${selectedEpisode.title}` : ''}...</span>
                   </div>
                ) : extractedLinks && extractedLinks.length > 0 ? (
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <h3 className="text-sm font-bold text-white flex items-center gap-2">
                         <Sparkles className="w-4 h-4 text-purple-400" />
                         <span>الروابط المباشرة (تم استخراجها):</span>
                       </h3>
                       {selectedEpisode && (
                         <span className="text-xs font-medium text-purple-300 bg-purple-900/30 px-2 py-1 rounded">
                           {selectedEpisode.title}
                         </span>
                       )}
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {extractedLinks.map((link, idx) => (
                         <div
                           key={idx}
                           className="flex flex-col gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-900/20 to-transparent border border-purple-800/40 hover:border-purple-600/60 transition shadow-lg"
                         >
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">
                               {link.size ? `${link.size}p` : 'جودة مجهولة'}
                             </span>
                             <span className="text-[11px] text-slate-400 font-mono">
                               MP4
                             </span>
                           </div>
                           
                           <div className="flex items-center gap-2 mt-auto">
                             <button
                               onClick={() => onWatchVideo(link.url, selectedEpisode ? `${selectedEpisode.title} - مباشر (${link.size}p)` : `${detail.title} - مباشر (${link.size}p)`)}
                               className="flex-1 flex justify-center items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs py-2 rounded shadow transition-colors cursor-pointer"
                             >
                               <Play className="w-3.5 h-3.5" />
                               <span>تشغيل مباشر</span>
                             </button>
                             
                             <a
                               href={`/api/download?url=${encodeURIComponent(link.url)}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="px-3 py-2 rounded border border-slate-700 bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition flex items-center gap-1.5 cursor-pointer"
                             >
                               <Download className="w-3.5 h-3.5" />
                               <span className="hidden sm:inline">تحميل</span>
                             </a>

                             <button
                               onClick={() => handleCopyLink(link.url)}
                               className={`p-2 rounded border text-xs transition flex items-center justify-center cursor-pointer ${
                                 copiedUrl === link.url
                                   ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                                   : 'bg-[#1e293b] text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
                               }`}
                               title="نسخ الرابط المباشر"
                             >
                               {copiedUrl === link.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                             </button>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                ) : null}
              </div>

              {/* 3. Direct Streaming Servers (Fallbacks) */}
              {detail.watchServers && detail.watchServers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span>سيرفرات المشاهدة المباشرة:</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {detail.watchServers.map((srv, idx) => {
                      const isPlaying = playingServerId === srv.url;
                      return (
                      <button
                        key={idx}
                        onClick={() => handleAutoExtractAndPlay(srv.url, `${detail.title} - ${srv.name}`, srv.url)}
                        disabled={isPlaying}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition group text-right cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition">
                            {isPlaying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                            {srv.name}
                          </span>
                        </div>
                      </button>
                    )})}
                  </div>
                </div>
              )}

              {/* 4. Direct Download Section (Fallbacks) */}
              {detail.downloadLinks && detail.downloadLinks.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-400" />
                      <span>روابط التحميل البديلة:</span>
                    </h3>
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
                        </div>

                        <div className="flex items-center gap-2">
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
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

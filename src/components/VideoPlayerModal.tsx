import React, { useState, useEffect } from 'react';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Server,
  Tv,
  Film,
  Sparkles,
  Play
} from 'lucide-react';

interface VideoPlayerModalProps {
  url: string | null;
  title: string;
  onClose: () => void;
}

interface VideoServer {
  id: string;
  name: string;
  quality: string;
  badge: string;
  type: 'video' | 'embed';
  rawUrl: string;
}

export function getProxyUrl(videoUrl: string): string {
  if (!videoUrl) return '';
  if (videoUrl.startsWith('/api/') || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    return videoUrl;
  }
  const backendBaseUrl = ((import.meta as any).env?.VITE_BACKEND_URL || '').replace(/\/+$/, '');
  return `${backendBaseUrl}/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;
}

export function detectMediaType(link: string): 'video' | 'embed' {
  if (!link) return 'video';
  const cleanLink = link.toLowerCase().trim();
  if (
    cleanLink.includes('iframe') ||
    cleanLink.includes('youtube.com/embed') ||
    cleanLink.includes('/embed/') ||
    cleanLink.includes('player')
  ) {
    return 'embed';
  }
  return 'video';
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ url, title, onClose }) => {
  const detectedPrimaryType = url ? detectMediaType(url) : 'video';

  const servers: VideoServer[] = [
    {
      id: 'primary-stream',
      name: 'سيرفر المشاهدة المباشر (MP4)',
      quality: '1080p FHD',
      badge: 'المصدر الأساسي',
      type: detectedPrimaryType,
      rawUrl: url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      id: 'cdn-1',
      name: 'سيرفر اكوام البديل',
      quality: '720p HD',
      badge: 'سريع',
      type: 'video',
      rawUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    {
      id: 'cdn-2',
      name: 'مشغل الويب المباشر (Embed Player)',
      quality: 'Web Player',
      badge: 'سيرفر خارجي',
      type: 'embed',
      rawUrl: url || '',
    },
  ];

  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const currentServer = servers[selectedServerIndex];

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!url) return null;

  const proxiedUrl = getProxyUrl(currentServer.rawUrl);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in" dir="rtl">
      <div className="relative w-full max-w-5xl bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">{title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  مشاهدة آمنة (مشغل Plyr.io)
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  • {currentServer.quality}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="فتح الرابط الأصلي في نافذة خارجية"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {currentServer.type === 'video' ? (
            <div className="w-full h-full" dir="ltr">
              <Plyr
                source={{
                  type: 'video',
                  sources: [{ src: proxiedUrl, type: 'video/mp4' }]
                }}
                options={{
                  autoplay: true,
                  controls: [
                    'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
                  ]
                }}
              />
            </div>
          ) : (
            <iframe
              src={currentServer.rawUrl}
              title="Embedded Media Player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Server Switcher Footer */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-slate-200">سيرفرات البث المتاحة:</span>
            </div>

            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
              {servers.map((srv, idx) => (
                <button
                  key={srv.id}
                  onClick={() => setSelectedServerIndex(idx)}
                  className={`text-sm px-4 py-2.5 rounded-lg border transition-colors flex items-center justify-between sm:justify-start gap-3 cursor-pointer ${
                    selectedServerIndex === idx
                      ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-lg shadow-blue-900/20'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {srv.type === 'video' ? (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Tv className="w-3.5 h-3.5" />
                    )}
                    <span>{srv.name}</span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${selectedServerIndex === idx ? 'bg-blue-800/80 text-blue-100' : 'bg-slate-950 text-blue-400'}`}>
                    {srv.quality}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

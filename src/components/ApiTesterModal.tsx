import React, { useState } from 'react';
import { X, Play, Copy, Check, Terminal, Code2, Globe, Send, Loader2 } from 'lucide-react';

interface ApiTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiTesterModal: React.FC<ApiTesterModalProps> = ({ isOpen, onClose }) => {
  const [endpoint, setEndpoint] = useState('/api/v1/feed/movies?page=0');
  const [responseJson, setResponseJson] = useState<string>('// اضغط على "تنفيذ الطلب" لاختبار الرابط المباشر...');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleEndpoints = [
    { label: 'أحدث الأفلام (Page 0)', url: '/api/v1/feed/movies?page=0' },
    { label: 'أحدث المسلسلات (Page 0)', url: '/api/v1/feed/series?page=0' },
    { label: 'الصفحة الرئيسية (Home)', url: '/api/v1/feed/home?page=0' },
    { label: 'بحث: أفلام 2026', url: '/api/v1/search?q=&section=movie&year=2026' },
    { label: 'بحث: كلمة "Dark"', url: '/api/v1/search?q=Dark' },
    { label: 'استخراج تفاصيل فيلم', url: '/api/v1/detail?url=https://ak.sv/movie/11330/dark' },
    { label: 'فحص الخادم (/api/health)', url: '/api/health' },
  ];

  const handleExecute = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const startTime = performance.now();
      const res = await fetch(endpoint);
      const endTime = performance.now();
      setStatus(res.status);
      const data = await res.json();
      setResponseJson(
        JSON.stringify(
          {
            _debug_time_ms: Math.round(endTime - startTime),
            _status: res.status,
            ...data,
          },
          null,
          2
        )
      );
    } catch (err: any) {
      setResponseJson(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(responseJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in" dir="rtl">
      <div className="relative w-full max-w-4xl bg-[#1e293b] border border-slate-700 rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">محلل ومختبر الـ API</h2>
              <span className="text-xs text-slate-400 font-mono">اختبار الـ Endpoints واستخراج الروابط المباشرة</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 font-sans">
          {/* Quick Endpoints */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">روابط سريعة جاهزة للاختبار:</span>
            <div className="flex flex-wrap gap-2">
              {sampleEndpoints.map((ep, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setEndpoint(ep.url);
                  }}
                  className={`text-xs px-2.5 py-1 rounded border transition cursor-pointer ${
                    endpoint === ep.url
                      ? 'bg-blue-600 text-white border-blue-600 font-medium shadow'
                      : 'bg-[#0f172a] text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {ep.label}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint Input bar */}
          <div className="flex items-center gap-2" dir="ltr">
            <div className="flex-1 relative flex items-center">
              <span className="absolute left-3 text-xs text-blue-400 font-mono font-bold">GET</span>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/api/v1/feed/movies"
                className="w-full bg-[#0f172a] text-slate-200 text-xs font-mono rounded pl-12 pr-4 py-2.5 border border-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleExecute}
              disabled={loading}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs px-4 py-2.5 rounded shadow transition-colors cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>تنفيذ</span>
            </button>
          </div>

          {/* Response Console */}
          <div className="space-y-2" dir="ltr">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-300">استجابة الـ JSON المباشرة:</span>
                {status && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      status === 200
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    STATUS {status} OK
                  </span>
                )}
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs bg-[#0f172a] hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded transition border border-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ الاستجابة'}</span>
              </button>
            </div>

            <pre className="w-full bg-[#0f172a] p-4 rounded border border-slate-700 text-xs font-mono text-emerald-400 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {responseJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

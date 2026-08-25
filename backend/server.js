import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { URL } from 'url';
import { Readable } from 'stream';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || '';
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || '')
  .split(',')
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);
const SOURCE_REFERER = process.env.SOURCE_REFERER || '';
const SOURCE_ORIGIN = process.env.SOURCE_ORIGIN || '';

// -------------------------------------------------------------
// 1. CORS Configuration
// -------------------------------------------------------------
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (!FRONTEND_URL || FRONTEND_URL === '*') {
      return callback(null, true);
    }

    const allowedOrigins = FRONTEND_URL.split(',').map((o) => o.trim());
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Blocked by CORS policy'));
  },
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Range', 'Authorization', 'Content-Type', 'Accept', 'User-Agent'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type'],
};

app.use(cors(corsOptions));
app.disable('x-powered-by');

// -------------------------------------------------------------
// 2. SSRF & Security Validation Helpers
// -------------------------------------------------------------
function isPrivateOrLocalIp(hostname) {
  const host = hostname.toLowerCase();

  // Localhost aliases
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === 'local' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local')
  ) {
    return true;
  }

  // IPv4 Private & Loopback check
  const ipParts = host.split('.').map(Number);
  if (ipParts.length === 4 && ipParts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
    // 127.0.0.0/8
    if (ipParts[0] === 127) return true;
    // 10.0.0.0/8
    if (ipParts[0] === 10) return true;
    // 172.16.0.0/12
    if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) return true;
    // 192.168.0.0/16
    if (ipParts[0] === 192 && ipParts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local)
    if (ipParts[0] === 169 && ipParts[1] === 254) return true;
    // 0.0.0.0/8
    if (ipParts[0] === 0) return true;
  }

  // IPv6 Private & Link-local check
  if (
    host.startsWith('fc00:') ||
    host.startsWith('fd00:') ||
    host.startsWith('fe80:') ||
    host === '::'
  ) {
    return true;
  }

  return false;
}

function isHostAllowed(hostname) {
  if (isPrivateOrLocalIp(hostname)) {
    return false;
  }

  if (ALLOWED_HOSTS.length === 0) {
    // Default mode: Allow standard public domain hostnames
    return true;
  }

  const hostLower = hostname.toLowerCase();
  return ALLOWED_HOSTS.some((allowed) => {
    if (allowed === hostLower) return true;
    if (allowed.startsWith('*.') && hostLower.endsWith(allowed.slice(1))) return true;
    if (hostLower.endsWith(`.${allowed}`)) return true;
    return false;
  });
}

// -------------------------------------------------------------
// 3. Health & Status Endpoints
// -------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Video Stream Proxy',
    version: '1.0.0',
    allowlistEnabled: ALLOWED_HOSTS.length > 0,
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 4. Video Stream Proxy API (/api/proxy-video & /api/v1/stream-proxy)
// -------------------------------------------------------------
const handleStreamProxy = async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "url" query parameter' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid video URL' });
  }

  // Protocol check
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.status(400).json({ error: 'Invalid URL protocol. Only HTTP and HTTPS are allowed.' });
  }

  // SSRF and Host Allowlist validation
  if (!isHostAllowed(parsedUrl.hostname)) {
    return res.status(403).json({
      error: 'Host is not permitted by stream proxy security policy.',
    });
  }

  // Abort controller for client disconnect
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 30000); // 30s connection timeout

  req.on('close', () => {
    clearTimeout(timeoutId);
    abortController.abort();
  });

  try {
    // Build safe outgoing headers
    const outgoingHeaders = {
      'User-Agent':
        req.headers['user-agent'] ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: req.headers['accept'] || '*/*',
      'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9,ar;q=0.8',
    };

    if (req.headers.range) {
      outgoingHeaders['Range'] = req.headers.range;
    }

    if (SOURCE_REFERER) {
      outgoingHeaders['Referer'] = SOURCE_REFERER;
    } else if (parsedUrl.origin) {
      outgoingHeaders['Referer'] = parsedUrl.origin;
    }

    if (SOURCE_ORIGIN) {
      outgoingHeaders['Origin'] = SOURCE_ORIGIN;
    }

    const upstreamResponse = await fetch(parsedUrl.toString(), {
      method: req.method === 'HEAD' ? 'HEAD' : 'GET',
      headers: outgoingHeaders,
      signal: abortController.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    // Forward status code (200, 206, 304, etc.)
    const status = upstreamResponse.status;

    // Build response headers to stream directly to client
    const contentType =
      upstreamResponse.headers.get('content-type') ||
      (targetUrl.endsWith('.m3u8')
        ? 'application/vnd.apple.mpegurl'
        : targetUrl.endsWith('.ts')
        ? 'video/mp2t'
        : 'video/mp4');

    res.status(status);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');

    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const contentRange = upstreamResponse.headers.get('content-range');
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }

    const lastModified = upstreamResponse.headers.get('last-modified');
    if (lastModified) {
      res.setHeader('Last-Modified', lastModified);
    }

    const etag = upstreamResponse.headers.get('etag');
    if (etag) {
      res.setHeader('ETag', etag);
    }

    if (req.method === 'HEAD') {
      return res.end();
    }

    if (!upstreamResponse.body) {
      return res.end();
    }

    // Direct streaming via pipeline without storing in memory
    const nodeStream = Readable.fromWeb(upstreamResponse.body);
    nodeStream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(502).json({ error: 'Stream error during media transmission' });
      }
      res.end();
    });

    nodeStream.pipe(res);
  } catch (err) {
    clearTimeout(timeoutId);
    if (abortController.signal.aborted) {
      return;
    }

    if (!res.headersSent) {
      res.status(502).json({
        error: 'Failed to establish video stream connection to source.',
      });
    }
  }
};

app.get('/api/proxy-video', handleStreamProxy);
app.head('/api/proxy-video', handleStreamProxy);
app.get('/api/v1/stream-proxy', handleStreamProxy);
app.head('/api/v1/stream-proxy', handleStreamProxy);

// -------------------------------------------------------------
// 5. Server Startup
// -------------------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Stream Proxy] Server running at http://0.0.0.0:${PORT}`);
  console.log(`[Stream Proxy] Health check available at /health`);
});

# Video Stream Proxy Backend (Node.js & Express)

A lightweight, secure, production-ready Video Stream Proxy designed for Google Cloud Run, supporting HTTP Range requests (206 Partial Content), HLS (.m3u8), MP4 streaming, and SSRF protection.

---

## 🚀 Features

- **True Streaming Pipeline**: Pipes media data directly from upstream sources to client without buffering full files in RAM.
- **HTTP Range Requests (RFC 7233)**: Supports smooth seeking (fast forward/rewind), partial content delivery (206), and chunked transfer.
- **SSRF Protection**: Strictly blocks loopback addresses (`localhost`, `127.0.0.1`, `0.0.0.0`), private IPv4 ranges (10.x, 172.16-31.x, 192.168.x), link-local addresses, and private IPv6 ranges.
- **Configurable Allowlist**: Option to restrict proxying to specific hostnames via `ALLOWED_HOSTS`.
- **CORS Support**: Restricts cross-origin requests to your Firebase Hosting domain via `FRONTEND_URL`.
- **Client Disconnect Cleanup**: Instantly terminates upstream connections when the client closes the connection or pauses the video.

---

## 📦 API Endpoints

### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok"
}
```

### 2. Service Status
```http
GET /api/status
```
**Response:**
```json
{
  "status": "ok",
  "service": "Video Stream Proxy",
  "version": "1.0.0",
  "allowlistEnabled": true,
  "timestamp": "2026-08-25T14:30:00.000Z"
}
```

### 3. Video Stream Proxy
```http
GET /api/proxy-video?url={ENCODED_VIDEO_URL}
```
**Headers forwarded:**
- `Range: bytes=0-1048576` (Optional)
- `Accept`, `User-Agent`, `Accept-Language`
- `Referer` (Configurable via `SOURCE_REFERER`)

---

## ⚙️ Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Listening port (Default `8080` for Cloud Run) | `8080` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `https://your-domain.web.app` |
| `ALLOWED_HOSTS` | Comma-separated list of permitted hostnames | `commondatastorage.googleapis.com,ak.sv` |
| `SOURCE_REFERER` | Custom Referer header to send to source | `https://ak.sv/` |
| `SOURCE_ORIGIN` | Custom Origin header to send to source | `https://ak.sv` |

---

## 🛠️ Local Development

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure `.env`
```bash
cp .env.example .env
```

### 3. Run the server
```bash
npm start
# or with auto-restart on changes:
npm run dev
```

### 4. Test the API locally
```bash
# Health check
curl http://localhost:8080/health

# Proxy stream test
curl -I "http://localhost:8080/api/proxy-video?url=https%3A%2F%2Fcommondatastorage.googleapis.com%2Fgtv-videos-bucket%2Fsample%2FBigBuckBunny.mp4"
```

---

## ☁️ Google Cloud Run Deployment

### Option A: Build and deploy using Google Cloud CLI (`gcloud`)

1. Build and push container image to Google Container Registry or Artifact Registry:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/stream-proxy ./backend
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy stream-proxy \
  --image gcr.io/YOUR_PROJECT_ID/stream-proxy \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars FRONTEND_URL=https://YOUR_PROJECT_ID.web.app,ALLOWED_HOSTS=commondatastorage.googleapis.com,storage.googleapis.com
```

3. Copy the generated Cloud Run URL (e.g. `https://stream-proxy-xyz.a.run.app`) and set it in your frontend `.env` as:
```env
VITE_BACKEND_URL=https://stream-proxy-xyz.a.run.app
```

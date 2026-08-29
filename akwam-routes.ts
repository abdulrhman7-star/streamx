import express, { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const router = express.Router();
const BASE_URL = 'https://ak.sv';
const SPOOFED_HEADERS = {
  'Referer': `${BASE_URL}/`,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

const agent = new https.Agent({ rejectUnauthorized: false });

// 1. تنظيف الروابط من الشوائب
const cleanVideoUrl = (url: string) => {
  if (!url) return '';
  let cleaned = url.replace(/^(https?:\/\/ak\.sv)?(vlc|intent):\/\//, '').replace(/^intent:/, '');
  if (cleaned.startsWith('//')) return 'https:' + cleaned;
  if (!cleaned.startsWith('http')) return 'https://' + cleaned;
  return cleaned;
};

// 2. جلب الأفلام
router.get('/movies', async (req: Request, res: Response) => {
  try {
    const page = req.query.page || 0;
    const response = await axios.get(`${BASE_URL}/movies?page=${page}`, { headers: SPOOFED_HEADERS });
    const $ = cheerio.load(response.data);
    const movies: any[] = [];
    $('.entry-box').each((_, el) => {
      const title = $(el).find('.entry-title').text().trim();
      const link = $(el).find('a.box').attr('href');
      const poster = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
      if (title && link) movies.push({ title, link, poster });
    });
    res.json({ success: true, data: movies });
  } catch (err: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الأفلام', details: err.message });
  }
});

// 3. جلب المسلسلات
router.get('/series', async (req: Request, res: Response) => {
  try {
    const page = req.query.page || 0;
    const response = await axios.get(`${BASE_URL}/series?page=${page}`, { headers: SPOOFED_HEADERS });
    const $ = cheerio.load(response.data);
    const series: any[] = [];
    $('.entry-box').each((_, el) => {
      const title = $(el).find('.entry-title').text().trim();
      const link = $(el).find('a.box').attr('href');
      const poster = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
      if (title && link) series.push({ title, link, poster });
    });
    res.json({ success: true, data: series });
  } catch (err: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المسلسلات', details: err.message });
  }
});

// 4. البحث
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q || '';
    const response = await axios.get(`${BASE_URL}/search?q=${encodeURIComponent(q as string)}`, { headers: SPOOFED_HEADERS });
    const $ = cheerio.load(response.data);
    const results: any[] = [];
    $('.entry-box').each((_, el) => {
      const title = $(el).find('.entry-title').text().trim();
      const link = $(el).find('a.box').attr('href');
      const poster = $(el).find('img').attr('data-src');
      if (title && link) results.push({ title, link, poster });
    });
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ error: 'حدث خطأ أثناء البحث', details: err.message });
  }
});

// 5. استخراج رابط مباشر
router.get('/get-link', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: 'يرجى توفير الرابط' });
    
    // 1. Visit movie/episode page
    const pageRes = await axios.get(url, { headers: SPOOFED_HEADERS });
    const $ = cheerio.load(pageRes.data);
    
    // Find download link (the /link/ URL)
    let linkUrl = $('.link-btn.link-download, a[href*="/link/"]').first().attr('href');
    if (!linkUrl) return res.status(404).json({ error: 'لم يتم العثور على رابط التحميل' });
    if (!linkUrl.startsWith('http')) linkUrl = BASE_URL + linkUrl;

    // 2. Visit /link/ page to find /download/ URL
    const linkRes = await axios.get(linkUrl, { headers: SPOOFED_HEADERS });
    const dlMatch = linkRes.data.match(/https?:\/\/[^\/]+\/download\/[^"]+/);
    if (!dlMatch) return res.status(404).json({ error: 'لم يتم العثور على مسار التوجيه' });

    // 3. Visit /download/ page to extract direct MP4/MKV
    const dlRes = await axios.get(dlMatch[0], { headers: SPOOFED_HEADERS });
    const rawMatch = dlRes.data.match(/[a-z0-9]{4,}\.\w+\.\w+\/download\/[^"]+/);
    
    if (rawMatch) {
      const directUrl = cleanVideoUrl("https://" + rawMatch[0]);
      res.json({ success: true, url: directUrl });
    } else {
      res.status(404).json({ error: 'فشل استخراج الرابط المباشر' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'حدث خطأ في الاستخراج', details: err.message });
  }
});

// 6. استخراج حلقات المسلسل
router.get('/series-episodes', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    const response = await axios.get(url, { headers: SPOOFED_HEADERS });
    const $ = cheerio.load(response.data);
    const episodes: any[] = [];
    $('a[href*="/episode/"]').each((_, el) => {
      const link = $(el).attr('href');
      const title = $(el).text().replace(/\s+/g, ' ').trim();
      if (link && !episodes.some(e => e.link === link)) {
         episodes.push({ title, link: link.startsWith('http') ? link : BASE_URL + link });
      }
    });
    res.json({ success: true, data: episodes });
  } catch (err: any) {
    res.status(500).json({ error: 'خطأ في جلب الحلقات', details: err.message });
  }
});

// 7. البث المباشر (Stream)
router.get('/stream', async (req: Request, res: Response) => {
  try {
    const url = cleanVideoUrl(req.query.url as string);
    if (!url) return res.status(400).send('URL is required');

    const response = await axios.get(url, {
      headers: { ...SPOOFED_HEADERS, 'Range': req.headers.range || 'bytes=0-' },
      responseType: 'stream',
      httpsAgent: agent
    });

    res.status(response.status);
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key]);
    });
    response.data.pipe(res);
  } catch (err: any) {
    res.status(500).send('Stream error: ' + err.message);
  }
});

// 8. المشاهدة الحية المجمعة (Live Watch)
router.get('/watch', async (req: Request, res: Response) => {
    try {
        const url = req.query.url as string;
        // This combines get-link and streaming.
        // Actually, returning a stream from an extracted URL or redirecting to /api/stream
        // We'll extract and redirect to the stream route for simplicity
        const apiRes = await axios.get(`http://localhost:3000/api/get-link?url=${encodeURIComponent(url)}`);
        if (apiRes.data && apiRes.data.url) {
            res.redirect(`/api/stream?url=${encodeURIComponent(apiRes.data.url)}`);
        } else {
            res.status(404).send('لا يمكن مشاهدة هذا المقطع');
        }
    } catch(err: any) {
        res.status(500).send('Watch error: ' + err.message);
    }
});

// 9. التحميل
router.get('/download', async (req: Request, res: Response) => {
  try {
    const url = cleanVideoUrl(req.query.url as string);
    if (!url) return res.status(400).send('URL is required');

    const response = await axios.get(url, {
      headers: SPOOFED_HEADERS,
      responseType: 'stream',
      httpsAgent: agent
    });

    res.setHeader('Content-Disposition', 'attachment; filename="akwam_video.mp4"');
    res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    response.data.pipe(res);
  } catch (err: any) {
    res.status(500).send('Download error: ' + err.message);
  }
});

export default router;

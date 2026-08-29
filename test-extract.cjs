const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const SPOOFED_HEADERS = { 'Referer': `https://ak.sv/`, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
const agent = new https.Agent({ rejectUnauthorized: false });

async function test() {
    const res = await axios.get('https://ak.sv/movies', { headers: SPOOFED_HEADERS, httpsAgent: agent });
    const $ = cheerio.load(res.data);
    const firstMovie = $('.entry-box a.box').first().attr('href');
    
    const res2 = await axios.get(firstMovie, { headers: SPOOFED_HEADERS, httpsAgent: agent });
    const $2 = cheerio.load(res2.data);
    const linkUrl = $2('.link-btn.link-download, a[href*="/link/"]').first().attr('href');
    
    if (linkUrl) {
       const u = linkUrl.startsWith('http') ? linkUrl : 'https://ak.sv' + linkUrl;
       const res3 = await axios.get(u, { headers: SPOOFED_HEADERS, httpsAgent: agent });
       const dlMatch = res3.data.match(/https?:\/\/[^\/]+\/download\/[^"]+/);
       
       if (dlMatch) {
          const res4 = await axios.get(dlMatch[0], { headers: SPOOFED_HEADERS, httpsAgent: agent });
          // Let's print out what we see in res4
          const html = res4.data;
          console.log("Found download URL page. Length:", html.length);
          const rawMatch = html.match(/(https?:\/\/[a-zA-Z0-9.-]+\/download\/[^\s"']+)/i) || html.match(/(https?:\/\/[a-zA-Z0-9.-]+\/v\/[^\s"']+)/i);
          console.log("Match:", rawMatch ? rawMatch[0] : null);
          
          // Akwam sometimes hides it inside a "source" tag or "href" directly
          const $4 = cheerio.load(html);
          console.log("Cheerio source:", $4('source').attr('src') || $4('.download-link').attr('href') || $4('a').attr('href'));
       }
    }
}
test();

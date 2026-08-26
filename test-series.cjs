const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://ak.sv';
const SPOOFED_HEADERS = {
    'Referer': `${BASE_URL}/`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

async function test() {
    try {
        const res2 = await axios.get("https://ak.sv/series/3450/سيد-الخواتم-خواتم-القوة-الموسم-الاول", { headers: SPOOFED_HEADERS });
        const $ = cheerio.load(res2.data);
        
        const seasons = [];
        $('h2, h3').filter((_, el) => $(el).text().includes('مواسم اخرى') || $(el).text().includes('مواسم العمل')).closest('div').find('.entry-box a.box-inner, a.box-inner, a[href*="/series/"]').each((_, el) => {
            const link = $(el).attr('href');
            let title = $(el).text().replace(/\s+/g, ' ').trim();
            if (!title) {
               title = $(el).find('img').attr('alt') || $(el).closest('.entry-box').find('.entry-title').text().trim();
            }
            if (link && !seasons.some(s => s.link === link) && !title.includes('مشاهدة')) {
                seasons.push({ title, link });
            }
        });
        console.log(seasons);
        
    } catch (e) {
        console.error(e.message);
    }
}
test();

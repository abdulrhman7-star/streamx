const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://ak.sv';
const SPOOFED_HEADERS = {
    'Referer': `${BASE_URL}/`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

async function test() {
    try {
        const response = await axios.get(`${BASE_URL}/series/11187`, { headers: SPOOFED_HEADERS });
        const $ = cheerio.load(response.data);
        
        console.log("Episodes:");
        $('#series-episodes .bg-primary2 a, .episodes-list a, .tab-content.episodes a, a[href*="/episode/"]').each((_, el) => {
            console.log($(el).text().trim(), $(el).attr('href'));
        });

        console.log("\nSeasons:");
        // Try to find seasons. Maybe .series-seasons, .seasons, etc.
        $('.series-seasons a, .seasons-list a, a[href*="/series/"]').each((_, el) => {
             console.log($(el).text().trim(), $(el).attr('href'));
        });
        
    } catch (e) {
        console.error(e.message);
    }
}
test();

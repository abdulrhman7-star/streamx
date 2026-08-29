function cleanVideoUrl(url) {
    if (!url) return '';
    // Fix vlc:// intent://
    let cleaned = url.replace(/^(https?:\/\/ak\.sv)?(vlc|intent):\/\//, '');
    // Sometimes it's intent:https://...
    cleaned = cleaned.replace(/^intent:/, '');
    
    if (cleaned.startsWith('http')) return cleaned;
    if (cleaned.startsWith('//')) return 'https:' + cleaned;
    
    // If it's just a path, maybe we append it? But downet usually is full.
    return cleaned;
}
console.log(cleanVideoUrl('https://ak.svvlc://https://s205d1.downet.net/something'));
console.log(cleanVideoUrl('intent://s205d1.downet.net'));

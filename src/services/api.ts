import { MediaItem, MediaDetail, FeedResponse, Episode } from '../types';

export const API_BASE = '/api/v1';

export async function fetchCategoryFeed(category: string = 'movies', page: number = 0): Promise<FeedResponse> {
  try {
    const res = await fetch(`${API_BASE}/feed/${category}?page=${page}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching feed:', error);
    throw error;
  }
}

export async function searchMedia(params: {
  q: string;
  section?: string;
  year?: string;
  rating?: string;
  formats?: string;
  quality?: string;
  page?: number;
}): Promise<{ success: boolean; data: MediaItem[]; count: number; source: string }> {
  try {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.section && params.section !== '0') queryParams.append('section', params.section);
    if (params.year && params.year !== '0') queryParams.append('year', params.year);
    if (params.rating && params.rating !== '0') queryParams.append('rating', params.rating);
    if (params.formats && params.formats !== '0') queryParams.append('formats', params.formats);
    if (params.quality && params.quality !== '0') queryParams.append('quality', params.quality);
    if (params.page && params.page > 1) queryParams.append('page', params.page.toString());

    const res = await fetch(`${API_BASE}/search?${queryParams.toString()}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error searching media:', error);
    throw error;
  }
}

export async function fetchMediaDetail(item: { id?: string; url?: string }): Promise<MediaDetail> {
  try {
    // Prefer the new robust movie-details scraper if ID is available
    if (item.id) {
      const res = await fetch(`${API_BASE}/movie-details?id=${item.id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const responseData = await res.json();
      return responseData.data;
    }

    const query = item.url ? `url=${encodeURIComponent(item.url)}` : `id=${item.id}`;
    const res = await fetch(`${API_BASE}/detail?${query}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const responseData = await res.json();
    return responseData.data;
  } catch (error) {
    console.error('Error fetching media detail:', error);
    throw error;
  }
}

export async function checkApiHealth(): Promise<{ status: string; target: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { status: 'offline', target: 'https://akwam.ss' };
    return await res.json();
  } catch {
    return { status: 'offline', target: 'https://akwam.ss' };
  }
}

/**
 * Automatically scans series pages, extracts episode links, and caches them in localStorage
 * to reduce API usage and improve performance.
 */
export async function autoResolveSeriesData(seriesUrl: string): Promise<{episodes: Episode[], seasons?: {title: string, link: string}[]}> {
  const cacheKey = `series_data_cache_${seriesUrl}`;
  
  // 1. Check Local Cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      // Cache TTL: 2 hours (in milliseconds)
      const CACHE_TTL = 2 * 60 * 60 * 1000; 
      if (Date.now() - parsedCache.timestamp < CACHE_TTL) {
        console.log('Returned series data from cache:', seriesUrl);
        return parsedCache.data;
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }

  // 2. Fetch from Network
  try {
    const res = await fetch(`/api/series-episodes?url=${encodeURIComponent(seriesUrl)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    if (data.success) {
      const episodes: Episode[] = (data.episodes || []).map((ep: any, index: number) => ({
        ...ep,
        episodeNumber: ep.episodeNumber || index + 1
      }));
      const seasons = data.seasons || [];
      const result = { episodes, seasons };
      
      // 3. Save to Cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: result
        }));
      } catch (e) {
        console.warn('Cache write error:', e);
      }
      return result;
    }
    return { episodes: [] };
  } catch (error) {
    console.error('Error auto resolving series data:', error);
    throw error;
  }
}

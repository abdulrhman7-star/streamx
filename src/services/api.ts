import { MediaItem, MediaDetail, FeedResponse } from '../types';

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
    if (!res.ok) return { status: 'offline', target: 'https://ak.sv' };
    return await res.json();
  } catch {
    return { status: 'offline', target: 'https://ak.sv' };
  }
}

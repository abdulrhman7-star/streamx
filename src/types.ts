export interface MediaItem {
  id: string;
  title: string;
  link: string;
  poster: string;
  rating?: string;
  quality?: string;
  year?: string;
  category?: string;
  genres?: string[];
  type?: 'movie' | 'series' | 'show' | 'mix' | 'game';
}

export interface DownloadLink {
  quality: string;
  resolution?: string;
  size?: string;
  url: string;
  directUrl?: string;
}

export interface StreamServer {
  name: string;
  url: string;
  type?: string;
}

export interface Episode {
  episodeNumber: number;
  title: string;
  link: string;
  rating?: string;
  quality?: string;
}

export interface Season {
  title: string;
  link: string;
}

export interface MediaDetail extends MediaItem {
  originalTitle?: string;
  backdrop?: string;
  duration?: string;
  story: string;
  trailerUrl?: string;
  downloadLinks: DownloadLink[];
  watchServers: StreamServer[];
  episodes?: Episode[];
  seasons?: Season[];
}

export interface FilterState {
  section: string;
  year: string;
  rating: string;
  formats: string;
  quality: string;
  sortBy: 'latest' | 'rating' | 'year';
}

export interface FeedResponse {
  success: boolean;
  source: string;
  category?: string;
  page?: number;
  count?: number;
  hasMore?: boolean;
  data: MediaItem[];
}

import { TMDB_BASE_URL, TMDB_HEADERS } from './config';
import { Movie, Genre } from './types';

export async function fetchMovies(
  page = 1,
  filters?: {
    year?: { min: number; max: number };
    rating?: { min: number; max: number };
    genres?: number[];
  }
) {
  try {
    const url = new URL(`${TMDB_BASE_URL}/discover/movie`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('sort_by', 'popularity.desc');
    
    if (filters) {
      if (filters.genres && filters.genres.length > 0) {
        url.searchParams.append('with_genres', filters.genres.join(','));
      }
      
      if (filters.year) {
        url.searchParams.append('primary_release_date.gte', `${filters.year.min}-01-01`);
        url.searchParams.append('primary_release_date.lte', `${filters.year.max}-12-31`);
      }
      
      if (filters.rating) {
        url.searchParams.append('vote_average.gte', filters.rating.min.toString());
        url.searchParams.append('vote_average.lte', filters.rating.max.toString());
      }
    }
    
    const response = await fetch(url, { headers: TMDB_HEADERS });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.status_message || 'Failed to fetch movies');
    }
    
    return {
      results: data.results || [],
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    return {
      results: [],
      total_pages: 1,
      total_results: 0,
    };
  }
}

export async function searchMovies(query: string, page = 1): Promise<Movie[]> {
  try {
    const url = new URL(`${TMDB_BASE_URL}/search/movie`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());

    const response = await fetch(url, { headers: TMDB_HEADERS });
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}

export async function fetchTrendingMovies(): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week`,
      { headers: TMDB_HEADERS }
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
}

export async function fetchMovieDetails(id: number): Promise<Movie> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${id}?append_to_response=videos,credits,similar`,
      { headers: TMDB_HEADERS }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
}

export async function fetchSimilarMovies(id: number): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${id}/similar`,
      { headers: TMDB_HEADERS }
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return [];
  }
}

export async function fetchGenres(): Promise<Genre[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list`,
      { headers: TMDB_HEADERS }
    );
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}
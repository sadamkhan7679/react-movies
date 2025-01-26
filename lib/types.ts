// TMDB API Types
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids: number[];
}

export interface Genre {
  id: number;
  name: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  userId: string;
  movieId: number;
  content: string;
  createdAt: string;
  user: User;
}

export interface Rating {
  id: string;
  userId: string;
  movieId: number;
  rating: number;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: number;
  addedAt: string;
}
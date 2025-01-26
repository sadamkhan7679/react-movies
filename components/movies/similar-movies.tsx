'use client';

import { Movie } from '@/lib/types';
import { MovieGrid } from './movie-grid';

interface SimilarMoviesProps {
  movies: Movie[];
}

export function SimilarMovies({ movies }: SimilarMoviesProps) {
  if (!movies.length) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Similar Movies</h2>
      <MovieGrid movies={movies.slice(0, 5)} />
    </div>
  );
}
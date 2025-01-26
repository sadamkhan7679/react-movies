import { Movie } from '@/lib/types';
import { MovieCard } from './movie-card';

interface MovieGridProps {
  movies: Movie[];
  onAddToWatchlist?: (movieId: number) => void;
  watchlistButtonText?: string;
  showRating?: boolean;
}

export function MovieGrid({
  movies,
  onAddToWatchlist,
  watchlistButtonText,
  showRating
}: MovieGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onAddToWatchlist={onAddToWatchlist}
          watchlistButtonText={watchlistButtonText}
          showRating={showRating}
        />
      ))}
    </div>
  );
}
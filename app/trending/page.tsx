'use client';

import { useTrendingMovies } from '@/lib/hooks/use-movies';
import { MovieGrid } from '@/components/movies/movie-grid';
import { TrendingUp } from 'lucide-react';
import { Loading } from '@/components/ui/loading';

export default function TrendingPage() {
  const { 
    data: movies, 
    isLoading, 
    isError 
  } = useTrendingMovies();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Something went wrong. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8" />
        <h1 className="text-4xl font-bold">Trending Movies</h1>
      </div>
      <MovieGrid movies={movies} />
    </div>
  );
}
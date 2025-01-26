'use client';

import { useState } from 'react';
import { useMovies, useGenres } from '@/lib/hooks/use-movies';
import { MovieGrid } from '@/components/movies/movie-grid';
import { Filters, FilterOptions } from '@/components/movies/filters';
import { Loader2 } from 'lucide-react';
import { Pagination } from '@/components/movies/pagination';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    year: { min: 1900, max: new Date().getFullYear() },
    rating: { min: 0, max: 10 },
    genres: [],
  });

  const { 
    data: moviesData, 
    isLoading: isLoadingMovies,
    isError: isMoviesError 
  } = useMovies(currentPage, filters);

  const { 
    data: genres,
    isLoading: isLoadingGenres,
    isError: isGenresError 
  } = useGenres();

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoadingMovies && isLoadingGenres) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isMoviesError || isGenresError) {
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
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-bold">Discover Movies</h1>
        <Filters 
          genres={genres || []} 
          onFilterChange={handleFilterChange} 
        />
      </div>
      
      {isLoadingMovies ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : moviesData?.results.length ? (
        <>
          <MovieGrid movies={moviesData.results} />
          <Pagination
            currentPage={currentPage}
            totalPages={Math.min(moviesData.total_pages, 500)}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No movies found matching your filters. Try adjusting your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
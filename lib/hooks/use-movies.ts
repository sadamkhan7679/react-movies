import { useQuery } from "@tanstack/react-query";
import {
  fetchGenres,
  fetchMovieDetails,
  fetchMovies,
  fetchSimilarMovies,
  fetchTrendingMovies,
} from "@/lib/tmdb";
import type { FilterOptions } from "@/components/movies/filters";

export function useMovies(page: number, filters?: FilterOptions) {
  return useQuery({
    queryKey: ["movies", page, filters],
    queryFn: () => fetchMovies(page, filters),
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => fetchGenres(),
  });
}

export function useTrendingMovies() {
  return useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrendingMovies,
  });
}

export function useMovieDetails(id: number) {
  return useQuery({
    queryKey: ["movie", id],
    queryFn: () => fetchMovieDetails(id),
  });
}

export function useSimilarMovies(id: number) {
  return useQuery({
    queryKey: ["movie", id, "similar"],
    queryFn: () => fetchSimilarMovies(id),
  });
}

import { searchMovies } from "@/lib/tmdb";
import { MovieGrid } from "@/components/movies/movie-grid";
import { Search } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  // const query = searchParams.q;
  const { q: query } = await searchParams;
  const movies = query ? await searchMovies(query) : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Search className="h-8 w-8" />
        <h1 className="text-4xl font-bold">Search Results for "{query}"</h1>
      </div>
      {movies.length > 0 ? (
        <MovieGrid movies={movies} />
      ) : (
        <p className="text-center text-muted-foreground text-lg">
          No movies found for "{query}"
        </p>
      )}
    </div>
  );
}

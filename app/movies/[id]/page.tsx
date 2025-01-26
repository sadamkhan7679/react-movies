"use client";

import { useMovieDetails, useSimilarMovies } from "@/lib/hooks/use-movies";
import { getCurrentUser } from "@/lib/appwrite";
import { MovieDetails } from "@/components/movies/movie-details";
import { Comments } from "@/components/movies/comments";
import { RatingSection } from "@/components/movies/rating-section";
import { SimilarMovies } from "@/components/movies/similar-movies";
import { WatchlistButton } from "@/components/movies/watchlist-button";
import { AddToListDialog } from "@/components/movies/add-to-list-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { List } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function MoviePage() {
  // Get Params from pathname
  const searchParams = useSearchParams();

  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const movieId = parseInt(params.id);
  const movieId = parseInt(searchParams.get("id") || "");

  const {
    data: movie,
    isLoading: isLoadingMovie,
    isError: isMovieError,
  } = useMovieDetails(movieId);

  const {
    data: similarMovies,
    isLoading: isLoadingSimilar,
    isError: isSimilarError,
  } = useSimilarMovies(movieId);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    loadUser();
  }, []);

  if (isLoadingMovie) {
    return <Loading />;
  }

  if (isMovieError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Failed to load movie details. Please try again later.
        </p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Movie not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <MovieDetails movie={movie} />
      <div className="container mx-auto px-4">
        {user && (
          <div className="flex justify-center gap-4 py-4">
            <WatchlistButton movieId={movie.id} userId={user.$id} />
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <List className="h-5 w-5" />
              Add to List
            </Button>
          </div>
        )}
        <Separator className="my-8" />
        {user ? (
          <>
            <RatingSection movieId={movie.id} userId={user.$id} />
            <Separator className="my-8" />
            <Comments movieId={movie.id} userId={user.$id} />
            <Separator className="my-8" />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Please sign in to rate and comment on movies
            </p>
          </div>
        )}
        {!isLoadingSimilar && !isSimilarError && similarMovies && (
          <SimilarMovies movies={similarMovies} />
        )}
      </div>

      {user && (
        <AddToListDialog
          movieId={movie.id}
          userId={user.$id}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}

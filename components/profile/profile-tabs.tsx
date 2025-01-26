'use client';

import { useQuery } from '@tanstack/react-query';
import { database } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, collections } from '@/lib/config';
import { fetchMovieDetails } from '@/lib/tmdb';
import { MovieGrid } from '@/components/movies/movie-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loading } from '@/components/ui/loading';
import { Query } from 'appwrite';

interface ProfileTabsProps {
  userId: string;
}

export function ProfileTabs({ userId }: ProfileTabsProps) {
  const { data: watchlist, isLoading: isLoadingWatchlist } = useQuery({
    queryKey: ['watchlist', userId],
    queryFn: async () => {
      const response = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.watchlist,
        [Query.equal('userId', userId)]
      );
      
      return Promise.all(
        response.documents.map((item: any) =>
          fetchMovieDetails(item.movieId)
        )
      );
    },
  });

  const { data: ratedMovies, isLoading: isLoadingRated } = useQuery({
    queryKey: ['rated', userId],
    queryFn: async () => {
      const response = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.ratings,
        [Query.equal('userId', userId)]
      );
      
      return Promise.all(
        response.documents.map(async (rating: any) => {
          const movie = await fetchMovieDetails(rating.movieId);
          return { ...movie, userRating: rating.rating };
        })
      );
    },
  });

  if (isLoadingWatchlist || isLoadingRated) {
    return <Loading />;
  }

  return (
    <Tabs defaultValue="watchlist">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        <TabsTrigger value="rated">Rated Movies</TabsTrigger>
      </TabsList>

      <TabsContent value="watchlist" className="mt-6">
        {watchlist?.length ? (
          <MovieGrid
            movies={watchlist}
            onAddToWatchlist={(movieId) => {
              // Handle removal through React Query mutation
            }}
            watchlistButtonText="Remove from Watchlist"
          />
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Your watchlist is empty. Start adding movies you want to watch!
          </p>
        )}
      </TabsContent>

      <TabsContent value="rated" className="mt-6">
        {ratedMovies?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {ratedMovies.map(movie => (
              <div key={movie.id} className="space-y-2">
                <MovieGrid movies={[movie]} showRating={false} />
                <div className="flex justify-center">
                  <p className="text-sm font-medium">
                    Your rating: {movie.userRating}/5
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            You haven't rated any movies yet.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
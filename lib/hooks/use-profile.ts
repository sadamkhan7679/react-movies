import { useQuery } from '@tanstack/react-query';
import { database } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, collections } from '@/lib/config';
import { fetchMovieDetails } from '@/lib/tmdb';
import { Query } from 'appwrite';

export function useWatchlist(userId: string) {
  return useQuery({
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
}

export function useRatedMovies(userId: string) {
  return useQuery({
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
}

export function useUserLists(userId: string) {
  return useQuery({
    queryKey: ['lists', userId],
    queryFn: async () => {
      const response = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.lists,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
        ]
      );
      return response.documents;
    },
  });
}

export function useListMovies(listId: string) {
  return useQuery({
    queryKey: ['list', listId, 'movies'],
    queryFn: async () => {
      const response = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.listItems,
        [Query.equal('listId', listId)]
      );

      return Promise.all(
        response.documents.map((item: any) => 
          fetchMovieDetails(item.movieId)
        )
      );
    },
    enabled: !!listId,
  });
}
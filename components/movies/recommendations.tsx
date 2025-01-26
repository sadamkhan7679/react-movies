'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, collections } from '@/lib/config';
import { fetchMovieDetails } from '@/lib/tmdb';
import { Movie } from '@/lib/types';
import { MovieGrid } from './movie-grid';
import { Loader2, Sparkles } from 'lucide-react';
import { Query } from 'appwrite';

interface RecommendationsProps {
  userId: string;
}

export function Recommendations({ userId }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      // Get user's ratings
      const ratingsResponse = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.ratings,
        [
          Query.equal('userId', userId),
          Query.orderDesc('rating'),
          Query.limit(5)
        ]
      );

      // Get similar movies based on highly rated movies
      const recommendedMovies = new Map<number, Movie>();
      
      for (const rating of ratingsResponse.documents) {
        if (rating.rating >= 4) { // Only consider highly rated movies
          const movie = await fetchMovieDetails(rating.movieId);
          const similar = movie.similar?.results || [];
          
          for (const similarMovie of similar) {
            if (!recommendedMovies.has(similarMovie.id)) {
              recommendedMovies.set(similarMovie.id, similarMovie);
            }
          }
        }
      }

      // Filter out movies the user has already rated
      const userRatedMovieIds = new Set(
        ratingsResponse.documents.map((rating: any) => rating.movieId)
      );

      const filteredRecommendations = Array.from(recommendedMovies.values())
        .filter(movie => !userRatedMovieIds.has(movie.id))
        .slice(0, 10);

      setRecommendations(filteredRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Rate more movies to get personalized recommendations!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-semibold">Recommended for You</h2>
      </div>
      <MovieGrid movies={recommendations} />
    </div>
  );
}
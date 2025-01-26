'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Plus, Minus } from 'lucide-react';
import { Movie } from '@/lib/types';
import { TMDB_IMAGE_BASE_URL } from '@/lib/config';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface MovieCardProps {
  movie: Movie;
  onAddToWatchlist?: (movieId: number) => void;
  watchlistButtonText?: string;
  showRating?: boolean;
}

export function MovieCard({
  movie,
  onAddToWatchlist,
  watchlistButtonText = "Add to Watchlist",
  showRating = true
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="overflow-hidden group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/movies/${movie.id}`}>
        <CardContent className="p-0 aspect-[2/3] relative">
          <Image
            src={`${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isHovered && (
            <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm line-clamp-3">{movie.overview}</p>
            </div>
          )}
        </CardContent>
      </Link>
      <CardFooter className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-1 flex-1">{movie.title}</h3>
          {showRating && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>
        {onAddToWatchlist && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onAddToWatchlist(movie.id)}
          >
            {watchlistButtonText === "Add to Watchlist" ? (
              <Plus className="h-4 w-4 mr-2" />
            ) : (
              <Minus className="h-4 w-4 mr-2" />
            )}
            {watchlistButtonText}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
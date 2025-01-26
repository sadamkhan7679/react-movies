'use client';

import Image from 'next/image';
import { Play, Star, User } from 'lucide-react';
import { Movie } from '@/lib/types';
import { TMDB_IMAGE_BASE_URL } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MovieDetailsProps {
  movie: Movie & {
    videos?: {
      results: Array<{
        key: string;
        site: string;
        type: string;
      }>;
    };
    credits?: {
      cast: Array<{
        id: number;
        name: string;
        character: string;
        profile_path: string | null;
      }>;
    };
  };
}

export function MovieDetails({ movie }: MovieDetailsProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const trailer = movie.videos?.results.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  return (
    <div className="relative">
      <div className="aspect-[21/9] relative overflow-hidden rounded-xl">
        <Image
          src={`${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/20" />
      </div>

      <div className="relative mt-[-200px] container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-64 flex-shrink-0">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl">
              <Image
                src={`${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl font-bold">{movie.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(movie.release_date).getFullYear()}
                </span>
              </div>
            </div>

            <p className="text-lg leading-relaxed">{movie.overview}</p>

            {trailer && (
              <Button
                size="lg"
                onClick={() => setTrailerOpen(true)}
                className="gap-2"
              >
                <Play className="h-5 w-5" />
                Watch Trailer
              </Button>
            )}

            {movie.credits?.cast && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movie.credits.cast.slice(0, 6).map((actor) => (
                    <div key={actor.id} className="space-y-2">
                      <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-muted">
                        {actor.profile_path ? (
                          <Image
                            src={`${TMDB_IMAGE_BASE_URL}/w185${actor.profile_path}`}
                            alt={actor.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{actor.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {actor.character}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent className="sm:max-w-[850px]">
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailer?.key}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
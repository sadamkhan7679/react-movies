'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Loader2 } from 'lucide-react';
import { database } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, collections } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Query } from 'appwrite';

interface RatingSectionProps {
  movieId: number;
  userId: string;
}

export function RatingSection({ movieId, userId }: RatingSectionProps) {
  const queryClient = useQueryClient();

  const { data: rating, isLoading } = useQuery({
    queryKey: ['rating', movieId, userId],
    queryFn: async () => {
      const response = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.ratings,
        [
          Query.equal('userId', userId),
          Query.equal('movieId', movieId)
        ]
      );
      return response.documents[0]?.rating || null;
    },
  });

  const { mutate: rateMovie, isPending: isRating } = useMutation({
    mutationFn: async (value: number) => {
      return await database.createDocument(
        APPWRITE_DATABASE_ID!,
        collections.ratings,
        'unique()',
        {
          userId,
          movieId,
          rating: value,
          createdAt: new Date().toISOString(),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', movieId, userId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4">
      <h2 className="text-2xl font-semibold mb-4">Rate this Movie</h2>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <Button
            key={value}
            variant="ghost"
            size="lg"
            className="p-2"
            disabled={isRating}
            onClick={() => rateMovie(value)}
          >
            <Star
              className={`h-8 w-8 ${
                value <= (rating || 0)
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-muted-foreground'
              }`}
            />
          </Button>
        ))}
      </div>
    </div>
  );
}
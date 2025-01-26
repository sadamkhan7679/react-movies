'use client';

import { useState } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { database } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, collections } from '@/lib/config';
import { Query } from 'appwrite';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WatchlistButtonProps {
  movieId: number;
  userId: string;
}

export function WatchlistButton({ movieId, userId }: WatchlistButtonProps) {
  const queryClient = useQueryClient();

  const { data: isInWatchlist, isLoading: isCheckingWatchlist } = useQuery({
    queryKey: ['watchlist', movieId, userId],
    queryFn: async () => {
      const response = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.watchlist,
        [
          Query.equal('userId', userId),
          Query.equal('movieId', movieId)
        ]
      );
      return response.documents.length > 0;
    },
  });

  const { mutate: toggleWatchlist, isPending } = useMutation({
    mutationFn: async () => {
      if (isInWatchlist) {
        const response = await database.listDocuments(
          APPWRITE_DATABASE_ID!,
          collections.watchlist,
          [
            Query.equal('userId', userId),
            Query.equal('movieId', movieId)
          ]
        );
        
        if (response.documents.length > 0) {
          await database.deleteDocument(
            APPWRITE_DATABASE_ID!,
            collections.watchlist,
            response.documents[0].$id
          );
        }
      } else {
        await database.createDocument(
          APPWRITE_DATABASE_ID!,
          collections.watchlist,
          'unique()',
          {
            userId,
            movieId,
            addedAt: new Date().toISOString(),
          }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', movieId, userId] });
    },
  });

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => toggleWatchlist()}
      disabled={isCheckingWatchlist || isPending}
      className="gap-2"
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isInWatchlist ? (
        <>
          <Check className="h-5 w-5" />
          In Watchlist
        </>
      ) : (
        <>
          <Plus className="h-5 w-5" />
          Add to Watchlist
        </>
      )}
    </Button>
  );
}
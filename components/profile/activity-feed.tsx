'use client';

import { useEffect, useState } from 'react';
import { database } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, collections } from '@/lib/config';
import { fetchMovieDetails } from '@/lib/tmdb';
import { formatDistanceToNow } from 'date-fns';
import { Query } from 'appwrite';
import { Activity, Film, List, MessageSquare, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface ActivityItem {
  $id: string;
  type: 'rating' | 'comment' | 'watchlist' | 'list';
  movieId?: number;
  movieTitle?: string;
  listName?: string;
  rating?: number;
  createdAt: string;
}

interface ActivityFeedProps {
  userId: string;
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    try {
      const [ratings, comments, watchlist, lists] = await Promise.all([
        // Fetch ratings
        database.listDocuments(
          APPWRITE_DATABASE_ID!,
          collections.ratings,
          [
            Query.equal('userId', userId),
            Query.orderDesc('createdAt'),
            Query.limit(5)
          ]
        ),
        // Fetch comments
        database.listDocuments(
          APPWRITE_DATABASE_ID!,
          collections.comments,
          [
            Query.equal('userId', userId),
            Query.orderDesc('createdAt'),
            Query.limit(5)
          ]
        ),
        // Fetch watchlist additions
        database.listDocuments(
          APPWRITE_DATABASE_ID!,
          collections.watchlist,
          [
            Query.equal('userId', userId),
            Query.orderDesc('addedAt'),
            Query.limit(5)
          ]
        ),
        // Fetch list creations
        database.listDocuments(
          APPWRITE_DATABASE_ID!,
          collections.lists,
          [
            Query.equal('userId', userId),
            Query.orderDesc('createdAt'),
            Query.limit(5)
          ]
        )
      ]);

      // Process ratings
      const ratingActivities = await Promise.all(
        ratings.documents.map(async (rating) => {
          const movie = await fetchMovieDetails(rating.movieId);
          return {
            $id: rating.$id,
            type: 'rating' as const,
            movieId: rating.movieId,
            movieTitle: movie.title,
            rating: rating.rating,
            createdAt: rating.createdAt,
          };
        })
      );

      // Process comments
      const commentActivities = await Promise.all(
        comments.documents.map(async (comment) => {
          const movie = await fetchMovieDetails(comment.movieId);
          return {
            $id: comment.$id,
            type: 'comment' as const,
            movieId: comment.movieId,
            movieTitle: movie.title,
            createdAt: comment.createdAt,
          };
        })
      );

      // Process watchlist
      const watchlistActivities = await Promise.all(
        watchlist.documents.map(async (item) => {
          const movie = await fetchMovieDetails(item.movieId);
          return {
            $id: item.$id,
            type: 'watchlist' as const,
            movieId: item.movieId,
            movieTitle: movie.title,
            createdAt: item.addedAt,
          };
        })
      );

      // Process lists
      const listActivities = lists.documents.map((list) => ({
        $id: list.$id,
        type: 'list' as const,
        listName: list.name,
        createdAt: list.createdAt,
      }));

      // Combine and sort all activities
      const allActivities = [...ratingActivities, ...commentActivities, 
        ...watchlistActivities, ...listActivities]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      setActivities(allActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rating':
        return <Star className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'watchlist':
        return <Film className="h-4 w-4" />;
      case 'list':
        return <List className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'rating':
        return (
          <span>
            Rated <Link href={`/movies/${activity.movieId}`} className="font-medium hover:underline">
              {activity.movieTitle}
            </Link> {activity.rating} stars
          </span>
        );
      case 'comment':
        return (
          <span>
            Commented on <Link href={`/movies/${activity.movieId}`} className="font-medium hover:underline">
              {activity.movieTitle}
            </Link>
          </span>
        );
      case 'watchlist':
        return (
          <span>
            Added <Link href={`/movies/${activity.movieId}`} className="font-medium hover:underline">
              {activity.movieTitle}
            </Link> to watchlist
          </span>
        );
      case 'list':
        return (
          <span>
            Created a new list: <span className="font-medium">{activity.listName}</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Activity className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No recent activity to show.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.$id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-muted rounded-full">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p>{getActivityText(activity)}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
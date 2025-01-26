'use client';

import { useEffect, useState } from 'react';
import { database } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, collections } from '@/lib/config';
import { fetchMovieDetails, fetchGenres } from '@/lib/tmdb';
import { Query } from 'appwrite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BarChart3, PieChart, Clock, Star } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';

interface MovieStatistics {
  totalMoviesWatched: number;
  averageRating: number;
  totalWatchTime: number;
  genreDistribution: { name: string; value: number }[];
  ratingDistribution: { rating: string; count: number }[];
  yearDistribution: { year: string; count: number }[];
}

interface MovieStatisticsProps {
  userId: string;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function MovieStatistics({ userId }: MovieStatisticsProps) {
  const [stats, setStats] = useState<MovieStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [userId]);

  const loadStatistics = async () => {
    try {
      const [ratings, genres] = await Promise.all([
        database.listDocuments(
          APPWRITE_DATABASE_ID!,
          collections.ratings,
          [Query.equal('userId', userId)]
        ),
        fetchGenres(),
      ]);

      const movieDetails = await Promise.all(
        ratings.documents.map((rating: any) => fetchMovieDetails(rating.movieId))
      );

      // Calculate basic statistics
      const totalMoviesWatched = movieDetails.length;
      const averageRating = ratings.documents.reduce((acc: number, curr: any) => 
        acc + curr.rating, 0) / totalMoviesWatched || 0;
      const totalWatchTime = movieDetails.reduce((acc, curr) => 
        acc + (curr.runtime || 0), 0);

      // Genre distribution
      const genreMap = new Map<string, number>();
      movieDetails.forEach(movie => {
        movie.genres?.forEach(genre => {
          genreMap.set(genre.name, (genreMap.get(genre.name) || 0) + 1);
        });
      });

      const genreDistribution = Array.from(genreMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Rating distribution
      const ratingMap = new Map<number, number>();
      ratings.documents.forEach((rating: any) => {
        ratingMap.set(rating.rating, (ratingMap.get(rating.rating) || 0) + 1);
      });

      const ratingDistribution = Array.from(ratingMap.entries())
        .map(([rating, count]) => ({ 
          rating: `${rating} ${rating === 1 ? 'star' : 'stars'}`, 
          count 
        }))
        .sort((a, b) => Number(a.rating.split(' ')[0]) - Number(b.rating.split(' ')[0]));

      // Year distribution
      const yearMap = new Map<string, number>();
      movieDetails.forEach(movie => {
        const year = new Date(movie.release_date).getFullYear().toString();
        yearMap.set(year, (yearMap.get(year) || 0) + 1);
      });

      const yearDistribution = Array.from(yearMap.entries())
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year.localeCompare(b.year));

      setStats({
        totalMoviesWatched,
        averageRating,
        totalWatchTime,
        genreDistribution,
        ratingDistribution,
        yearDistribution,
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
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

  if (!stats || stats.totalMoviesWatched === 0) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          Rate some movies to see your statistics!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Movies Watched
          </CardTitle>
          <Film className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMoviesWatched}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Rating
          </CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageRating.toFixed(1)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Watch Time
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(stats.totalWatchTime / 60)} hrs
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Genre Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={stats.genreDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {stats.genreDistribution.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.ratingDistribution}>
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Movies by Year</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.yearDistribution}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
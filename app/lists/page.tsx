'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/appwrite';
import { getCurrentUser } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, collections } from '@/lib/config';
import { fetchMovieDetails } from '@/lib/tmdb';
import { Movie } from '@/lib/types';
import { MovieGrid } from '@/components/movies/movie-grid';
import { CreateListDialog } from '@/components/lists/create-list-dialog';
import { ListSelector } from '@/components/lists/list-selector';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, List } from 'lucide-react';
import { Query } from 'appwrite';

interface MovieList {
  $id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
}

export default function ListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<MovieList[]>([]);
  const [selectedList, setSelectedList] = useState<MovieList | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadUserLists();
  }, []);

  const loadUserLists = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth');
        return;
      }

      const response = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.lists,
        [
          Query.equal('userId', currentUser.$id),
          Query.orderDesc('createdAt'),
        ]
      );

      setLists(response.documents);
      if (response.documents.length > 0) {
        setSelectedList(response.documents[0]);
        await loadListMovies(response.documents[0].$id);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadListMovies = async (listId: string) => {
    try {
      setIsLoading(true);
      const response = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.listItems,
        [Query.equal('listId', listId)]
      );

      const movieDetails = await Promise.all(
        response.documents.map((item: any) => fetchMovieDetails(item.movieId))
      );

      setMovies(movieDetails);
    } catch (error) {
      console.error('Error loading list movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListSelect = async (list: MovieList) => {
    setSelectedList(list);
    await loadListMovies(list.$id);
  };

  const handleListCreate = async (name: string, description: string) => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      const newList = await database.createDocument(
        APPWRITE_DATABASE_ID!,
        collections.lists,
        'unique()',
        {
          name,
          description,
          userId: currentUser.$id,
          createdAt: new Date().toISOString(),
        }
      );

      setLists([newList, ...lists]);
      setSelectedList(newList);
      setMovies([]);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleRemoveFromList = async (movieId: number) => {
    if (!selectedList) return;

    try {
      const response = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.listItems,
        [
          Query.equal('listId', selectedList.$id),
          Query.equal('movieId', movieId)
        ]
      );

      if (response.documents.length > 0) {
        await database.deleteDocument(
          APPWRITE_DATABASE_ID!,
          collections.listItems,
          response.documents[0].$id
        );
        setMovies(movies.filter(movie => movie.id !== movieId));
      }
    } catch (error) {
      console.error('Error removing movie from list:', error);
    }
  };

  if (isLoading && lists.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <List className="h-8 w-8" />
          <h1 className="text-4xl font-bold">My Lists</h1>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create List
        </Button>
      </div>

      {lists.length > 0 ? (
        <>
          <ListSelector
            lists={lists}
            selectedList={selectedList}
            onSelect={handleListSelect}
          />
          
          {selectedList && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{selectedList.name}</h2>
                <p className="text-muted-foreground">{selectedList.description}</p>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : movies.length > 0 ? (
                <MovieGrid
                  movies={movies}
                  onAddToWatchlist={handleRemoveFromList}
                  watchlistButtonText="Remove from List"
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  This list is empty. Add movies from their detail pages!
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            You haven't created any lists yet. Create your first list to start organizing your movies!
          </p>
        </div>
      )}

      <CreateListDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleListCreate}
      />
    </div>
  );
}
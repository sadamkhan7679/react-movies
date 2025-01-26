'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { database } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, collections } from '@/lib/config';
import { Query } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';

interface MovieList {
  $id: string;
  name: string;
  description: string;
  userId: string;
}

interface AddToListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId: number;
  userId: string;
}

export function AddToListDialog({
  open,
  onOpenChange,
  movieId,
  userId,
}: AddToListDialogProps) {
  const [lists, setLists] = useState<MovieList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addedToLists, setAddedToLists] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      loadLists();
    }
  }, [open, userId]);

  const loadLists = async () => {
    try {
      setIsLoading(true);
      const [listsResponse, listItemsResponse] = await Promise.all([
        database.listDocuments(
          APPWRITE_DATABASE_ID!,
          collections.lists,
          [Query.equal('userId', userId)]
        ),
        database.listDocuments(
          APPWRITE_DATABASE_ID!,
          collections.listItems,
          [Query.equal('movieId', movieId)]
        )
      ]);

      setLists(listsResponse.documents);
      setAddedToLists(
        new Set(listItemsResponse.documents.map((item: any) => item.listId))
      );
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleList = async (listId: string) => {
    try {
      if (addedToLists.has(listId)) {
        const response = await database.listDocuments(
          APPWRITE_DATABASE_ID!,
          collections.listItems,
          [
            Query.equal('listId', listId),
            Query.equal('movieId', movieId)
          ]
        );

        if (response.documents.length > 0) {
          await database.deleteDocument(
            APPWRITE_DATABASE_ID!,
            collections.listItems,
            response.documents[0].$id
          );
        }

        setAddedToLists(prev => {
          const next = new Set(prev);
          next.delete(listId);
          return next;
        });
      } else {
        await database.createDocument(
          APPWRITE_DATABASE_ID!,
          collections.listItems,
          'unique()',
          {
            listId,
            movieId,
            userId,
            addedAt: new Date().toISOString(),
          }
        );

        setAddedToLists(prev => new Set([...prev, listId]));
      }
    } catch (error) {
      console.error('Error toggling list:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : lists.length > 0 ? (
          <div className="space-y-2">
            {lists.map((list) => (
              <Button
                key={list.$id}
                variant={addedToLists.has(list.$id) ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => toggleList(list.$id)}
              >
                <Plus className={`h-4 w-4 mr-2 ${
                  addedToLists.has(list.$id) ? 'hidden' : ''
                }`} />
                {list.name}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            You haven't created any lists yet.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
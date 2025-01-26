'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { database } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, collections } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Query } from 'appwrite';

interface Comment {
  $id: string;
  userId: string;
  movieId: number;
  content: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface CommentsProps {
  movieId: number;
  userId: string;
}

export function Comments({ movieId, userId }: CommentsProps) {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', movieId],
    queryFn: async () => {
      const response = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.comments,
        [
          Query.equal('movieId', movieId),
          Query.orderDesc('createdAt'),
        ]
      );

      // Fetch user information for each comment
      const commentsWithUsers = await Promise.all(
        response.documents.map(async (comment: Comment) => {
          try {
            const userDoc = await database.getDocument(
              APPWRITE_DATABASE_ID!,
              collections.users,
              comment.userId
            );
            return { ...comment, user: userDoc };
          } catch (error) {
            return comment;
          }
        })
      );

      return commentsWithUsers;
    },
  });

  const { mutate: addComment, isPending: isAddingComment } = useMutation({
    mutationFn: async (content: string) => {
      return await database.createDocument(
        APPWRITE_DATABASE_ID!,
        collections.comments,
        'unique()',
        {
          userId,
          movieId,
          content: content.trim(),
          createdAt: new Date().toISOString(),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', movieId] });
    },
  });

  const { mutate: deleteComment } = useMutation({
    mutationFn: async (commentId: string) => {
      await database.deleteDocument(
        APPWRITE_DATABASE_ID!,
        collections.comments,
        commentId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', movieId] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const content = new FormData(form).get('content') as string;
    
    if (!content.trim()) return;
    
    addComment(content);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-8">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6" />
        <h2 className="text-2xl font-semibold">Comments</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          name="content"
          placeholder="Share your thoughts..."
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isAddingComment}>
          {isAddingComment ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            'Post Comment'
          )}
        </Button>
      </form>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.$id} className="flex gap-4">
              <Avatar>
                <AvatarFallback>
                  {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{comment.user?.name || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {comment.userId === userId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteComment(comment.$id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
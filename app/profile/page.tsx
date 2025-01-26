import { getCurrentUser } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { ActivityFeed } from '@/components/profile/activity-feed';
import { MovieStatistics } from '@/components/profile/movie-statistics';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="movies">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="movies" className="mt-6">
          <ProfileTabs userId={user.$id} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityFeed userId={user.$id} />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <MovieStatistics userId={user.$id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
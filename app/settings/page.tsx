'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/appwrite';
import { getCurrentUser } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, collections } from '@/lib/config';
import { Settings, Moon, Sun, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/lib/appwrite';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    emailNotifications: false,
    autoplayTrailers: true,
    showSimilarMovies: true,
  });

  useEffect(() => {
    async function loadUserData() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth');
        return;
      }
      setUser(currentUser);

      try {
        const response = await database.listDocuments(
          APPWRITE_DATABASE_ID!,
          collections.settings,
          []
        );

        if (response.documents.length > 0) {
          setSettings(response.documents[0]);
        } else {
          // Create default settings
          await database.createDocument(
            APPWRITE_DATABASE_ID!,
            collections.settings,
            'unique()',
            {
              userId: currentUser.$id,
              ...settings,
            }
          );
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    loadUserData();
  }, [router]);

  const updateSetting = async (key: string, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      const response = await database.listDocuments(
        APPWRITE_DATABASE_ID!,
        collections.settings,
        []
      );

      if (response.documents.length > 0) {
        await database.updateDocument(
          APPWRITE_DATABASE_ID!,
          collections.settings,
          response.documents[0].$id,
          newSettings
        );
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/auth');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <h1 className="text-4xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about new releases and recommendations
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Autoplay Trailers</Label>
              <p className="text-sm text-muted-foreground">
                Automatically play movie trailers on the details page
              </p>
            </div>
            <Switch
              checked={settings.autoplayTrailers}
              onCheckedChange={(checked) => updateSetting('autoplayTrailers', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show Similar Movies</Label>
              <p className="text-sm text-muted-foreground">
                Display similar movie recommendations
              </p>
            </div>
            <Switch
              checked={settings.showSimilarMovies}
              onCheckedChange={(checked) => updateSetting('showSimilarMovies', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="pt-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
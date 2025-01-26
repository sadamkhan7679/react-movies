'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Search, TrendingUp, User, Settings, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Film className="h-6 w-6" />
          <span>MovieDB</span>
        </Link>
        
        <div className="flex items-center ml-auto gap-4">
          <form onSubmit={handleSearch} className="relative w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          
          <Link href="/trending">
            <Button variant={pathname === '/trending' ? 'default' : 'ghost'}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </Button>
          </Link>

          <Link href="/lists">
            <Button variant={pathname === '/lists' ? 'default' : 'ghost'}>
              <List className="h-4 w-4 mr-2" />
              My Lists
            </Button>
          </Link>
          
          <Link href="/profile">
            <Button variant={pathname === '/profile' ? 'default' : 'ghost'}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>

          <Link href="/settings">
            <Button variant={pathname === '/settings' ? 'default' : 'ghost'}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
'use client';

import { Genre } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GenreFilterProps {
  genres: Genre[];
  selectedGenre: number | null;
  onSelect: (genreId: number | null) => void;
}

export function GenreFilter({ genres, selectedGenre, onSelect }: GenreFilterProps) {
  return (
    <Select
      value={selectedGenre?.toString() || ''}
      onValueChange={(value) => onSelect(value ? parseInt(value) : null)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All Genres" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All Genres</SelectItem>
        {genres.map((genre) => (
          <SelectItem key={genre.id} value={genre.id.toString()}>
            {genre.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
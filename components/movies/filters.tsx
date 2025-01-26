'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Genre } from '@/lib/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiltersProps {
  genres: Genre[];
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  year: {
    min: number;
    max: number;
  };
  rating: {
    min: number;
    max: number;
  };
  genres: number[];
}

const currentYear = new Date().getFullYear();

export function Filters({ genres, onFilterChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    year: { min: 1900, max: currentYear },
    rating: { min: 0, max: 10 },
    genres: [],
  });

  const handleYearChange = (values: number[]) => {
    const newFilters = {
      ...filters,
      year: { min: values[0], max: values[1] },
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (values: number[]) => {
    const newFilters = {
      ...filters,
      rating: { min: values[0], max: values[1] },
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleGenre = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...filters.genres, genreId];
    
    const newFilters = {
      ...filters,
      genres: newGenres,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      year: { min: 1900, max: currentYear },
      rating: { min: 0, max: 10 },
      genres: [],
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setIsOpen(false);
  };

  const activeFilterCount = [
    filters.year.min !== 1900 || filters.year.max !== currentYear,
    filters.rating.min !== 0 || filters.rating.max !== 10,
    filters.genres.length > 0,
  ].filter(Boolean).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2",
            activeFilterCount > 0 && "border-primary"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filters</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2 text-muted-foreground"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Year Range</Label>
            <div className="pt-2">
              <Slider
                min={1900}
                max={currentYear}
                step={1}
                value={[filters.year.min, filters.year.max]}
                onValueChange={handleYearChange}
                className="my-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.year.min}</span>
                <span>{filters.year.max}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rating Range</Label>
            <div className="pt-2">
              <Slider
                min={0}
                max={10}
                step={0.5}
                value={[filters.rating.min, filters.rating.max]}
                onValueChange={handleRatingChange}
                className="my-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.rating.min.toFixed(1)}</span>
                <span>{filters.rating.max.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Genres</Label>
            <div className="flex flex-wrap gap-2 pt-2">
              {genres.map((genre) => (
                <Badge
                  key={genre.id}
                  variant={filters.genres.includes(genre.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleGenre(genre.id)}
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
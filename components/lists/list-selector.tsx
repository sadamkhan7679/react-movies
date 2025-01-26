'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MovieList {
  $id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
}

interface ListSelectorProps {
  lists: MovieList[];
  selectedList: MovieList | null;
  onSelect: (list: MovieList) => void;
}

export function ListSelector({
  lists,
  selectedList,
  onSelect,
}: ListSelectorProps) {
  return (
    <Select
      value={selectedList?.$id}
      onValueChange={(value) => {
        const list = lists.find((l) => l.$id === value);
        if (list) onSelect(list);
      }}
    >
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a list" />
      </SelectTrigger>
      <SelectContent>
        {lists.map((list) => (
          <SelectItem key={list.$id} value={list.$id}>
            {list.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
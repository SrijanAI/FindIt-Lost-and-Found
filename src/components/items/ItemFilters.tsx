"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type ItemCategory, type ItemType } from "@/types";

type TypeFilter = ItemType | "all";

export interface ItemFiltersState {
  search: string;
  category: ItemCategory | "all";
  type: TypeFilter;
  date: string;
}

interface ItemFiltersProps {
  filters: ItemFiltersState;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: ItemCategory | "all") => void;
  onTypeChange: (type: TypeFilter) => void;
  onDateChange: (date: string) => void;
}

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
];

export function ItemFilters({
  filters,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onDateChange,
}: ItemFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <div className="relative flex-1 sm:min-w-[200px] sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Type toggle buttons */}
      <div className="flex rounded-lg border p-0.5">
        {typeOptions.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant={filters.type === opt.value ? "default" : "ghost"}
            size="sm"
            className="rounded-md px-3 text-xs"
            onClick={() => onTypeChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Category select */}
      <Select
        value={filters.category}
        onValueChange={(val) => onCategoryChange(val as ItemCategory | "all")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date filter */}
      <Input
        type="date"
        value={filters.date}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-auto"
        max={new Date().toISOString().split("T")[0]}
      />
    </div>
  );
}

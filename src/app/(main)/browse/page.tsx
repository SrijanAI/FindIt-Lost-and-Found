"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSupabase } from "@/hooks/useSupabase";
import { useDebounce } from "@/hooks/useDebounce";
import { ItemCard } from "@/components/items/ItemCard";
import { ItemFilters } from "@/components/items/ItemFilters";
import type { Item, ItemType, ItemCategory } from "@/types";

export default function BrowsePage() {
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [type, setType] = useState<ItemType | "all">(
    (searchParams.get("type") as ItemType | "all") || "all"
  );
  const [category, setCategory] = useState<ItemCategory | "all">(
    (searchParams.get("category") as ItemCategory | "all") || "all"
  );
  const [date, setDate] = useState(searchParams.get("date") || "");

  const debouncedSearch = useDebounce(search, 300);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("items")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (type !== "all") {
      query = query.eq("type", type);
    }
    if (category !== "all") {
      query = query.eq("category", category);
    }
    if (debouncedSearch) {
      query = query.or(
        `title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`
      );
    }
    if (date) {
      query = query.eq("date_occurred", date);
    }

    const { data } = await query.limit(50);
    if (data) setItems(data);
    setLoading(false);
  }, [supabase, type, category, debouncedSearch, date]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (type !== "all") params.set("type", type);
    if (category !== "all") params.set("category", category);
    if (date) params.set("date", date);
    const qs = params.toString();
    router.replace(`/browse${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [search, type, category, date, router]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Browse Items</h1>

      <ItemFilters
        filters={{ search, type, category, date }}
        onSearchChange={setSearch}
        onTypeChange={setType}
        onCategoryChange={setCategory}
        onDateChange={setDate}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No items found.</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/items/ItemCard";
import { Package, Search, Zap, Plus } from "lucide-react";
import type { Item, Match } from "@/types";

export default function DashboardPage() {
  const supabase = useSupabase();
  const { user } = useAuthStore();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState({ lost: 0, found: 0, matches: 0 });

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      // Fetch recent items for display (limit 6)
      const { data: items } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (items) setMyItems(items);

      // Platform-wide counts (all users)
      const [{ count: lostCount }, { count: foundCount }, { count: matchCount }] = await Promise.all([
        supabase
          .from("items")
          .select("*", { count: "exact", head: true })
          .eq("type", "lost")
          .eq("status", "open"),
        supabase
          .from("items")
          .select("*", { count: "exact", head: true })
          .eq("type", "found")
          .eq("status", "open"),
        supabase
          .from("matches")
          .select("*", { count: "exact", head: true }),
      ]);

      setStats({
        lost: lostCount ?? 0,
        found: foundCount ?? 0,
        matches: matchCount ?? 0,
      });

      // Fetch all item IDs (not just 6) to query matches correctly
      const { data: allItems } = await supabase
        .from("items")
        .select("id")
        .eq("user_id", user!.id);

      const itemIds = (allItems ?? []).map((i) => i.id);

      if (itemIds.length === 0) {
        setStats((prev) => ({ ...prev, matches: 0 }));
        return;
      }

      const { data: matches } = await supabase
        .from("matches")
        .select("*, lost_item:items!lost_item_id(*), found_item:items!found_item_id(*)")
        .or(`lost_item_id.in.(${itemIds.join(",")}),found_item_id.in.(${itemIds.join(",")})`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (matches) setRecentMatches(matches);
    }

    fetchData();
  }, [user, supabase]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/report/lost">
            <Button variant="destructive" size="sm">
              <Plus className="w-4 h-4" /> Report Lost
            </Button>
          </Link>
          <Link href="/report/found">
            <Button variant="success" size="sm">
              <Plus className="w-4 h-4" /> Report Found
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Search className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lost}</p>
                <p className="text-sm text-gray-500">Lost Items Reported</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber/10 rounded-lg">
                <Package className="w-5 h-5 text-amber" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.found}</p>
                <p className="text-sm text-gray-500">Found Items Reported</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.matches}</p>
                <p className="text-sm text-gray-500">Total Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Items</CardTitle>
          <Link href="/browse" className="text-sm text-blue-600 hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {myItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No items posted yet. Let&apos;s get the word out &mdash; report a lost or found item to start matching.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Matches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Matches</CardTitle>
          <Link
            href="/dashboard/matches"
            className="text-sm text-blue-600 hover:underline"
          >
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {recentMatches.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No matches yet &mdash; we&apos;re still searching. Matches appear automatically when similar items are reported.
            </p>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/dashboard/matches/${match.id}`}
                  className="block p-3 rounded-lg border hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {match.lost_item?.title} &harr;{" "}
                        {match.found_item?.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Score: {Math.round(match.score * 100)}%
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        match.score >= 0.7
                          ? "bg-success/10 text-success"
                          : match.score >= 0.5
                            ? "bg-amber/10 text-amber"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {Math.round(match.score * 100)}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

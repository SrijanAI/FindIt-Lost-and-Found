"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuthStore } from "@/lib/store";
import { MatchCard } from "@/components/matches/MatchCard";
import type { Match } from "@/types";

export default function MatchesPage() {
  const supabase = useSupabase();
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchMatches() {
      // Get user's item IDs
      const { data: items } = await supabase
        .from("items")
        .select("id")
        .eq("user_id", user!.id);

      if (!items || items.length === 0) {
        setLoading(false);
        return;
      }

      const itemIds = items.map((i) => i.id);

      const { data: matchData } = await supabase
        .from("matches")
        .select(
          "*, lost_item:items!lost_item_id(*, profiles(*)), found_item:items!found_item_id(*, profiles(*))"
        )
        .or(
          `lost_item_id.in.(${itemIds.join(",")}),found_item_id.in.(${itemIds.join(",")})`
        )
        .order("score", { ascending: false });

      if (matchData) setMatches(matchData);
      setLoading(false);
    }

    fetchMatches();
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">My Matches</h1>

      {matches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No matches yet &mdash; we&apos;re still searching.</p>
          <p className="text-sm mt-1">
            Matches appear automatically when similar lost and found items are reported.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

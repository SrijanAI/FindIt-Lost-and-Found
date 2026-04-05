"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSupabase } from "@/hooks/useSupabase";
import { MatchCard } from "@/components/matches/MatchCard";
import type { Match } from "@/types";

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = useSupabase();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatch() {
      const { data } = await supabase
        .from("matches")
        .select(
          "*, lost_item:items!lost_item_id(*, profiles(*)), found_item:items!found_item_id(*, profiles(*))"
        )
        .eq("id", id)
        .single();

      if (data) setMatch(data);
      setLoading(false);
    }

    fetchMatch();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-12 text-gray-500">Match not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Match Details</h1>
      <MatchCard match={match} />
    </div>
  );
}

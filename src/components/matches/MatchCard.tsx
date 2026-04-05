"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSupabase } from "@/hooks/useSupabase";
import type { Match, Item } from "@/types";
import { MatchScoreBadge } from "./MatchScoreBadge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Check, X, Tag, CalendarDays, MapPin, Layers } from "lucide-react";

interface MatchCardProps {
  match: Match;
}

function MiniItemCard({ item, label }: { item: Item; label: string }) {
  const thumb = item.image_urls?.[0];

  return (
    <div className="flex-1 space-y-2 rounded-lg border p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {thumb && (
        <img
          src={thumb}
          alt={item.title}
          className="h-24 w-full rounded-md object-cover"
        />
      )}
      <p className="text-sm font-medium leading-tight truncate">{item.title}</p>
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span className="capitalize">{item.category}</span>
        <span>&middot;</span>
        <span>{format(new Date(item.date_occurred), "MMM d, yyyy")}</span>
      </div>
    </div>
  );
}

function MatchReasons({ lost, found }: { lost: Item; found: Item }) {
  const sharedTags = lost.tags.filter((t) =>
    found.tags.map((x) => x.toLowerCase()).includes(t.toLowerCase())
  );

  const dayDiff = Math.abs(
    Math.round(
      (new Date(lost.date_occurred).getTime() - new Date(found.date_occurred).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const dateLabel =
    dayDiff === 0
      ? "Same day"
      : dayDiff <= 7
      ? `${dayDiff} day${dayDiff > 1 ? "s" : ""} apart`
      : dayDiff <= 30
      ? `${dayDiff} days apart`
      : null;

  const reasons = [
    {
      icon: Layers,
      label: "Same category",
      detail: lost.category,
      strength: "high" as const,
    },
    sharedTags.length > 0 && {
      icon: Tag,
      label: `${sharedTags.length} shared tag${sharedTags.length > 1 ? "s" : ""}`,
      detail: sharedTags.join(", "),
      strength: sharedTags.length >= 3 ? ("high" as const) : ("medium" as const),
    },
    dateLabel && {
      icon: CalendarDays,
      label: "Date proximity",
      detail: dateLabel,
      strength: dayDiff <= 7 ? ("high" as const) : ("medium" as const),
    },
    lost.location_name && found.location_name && {
      icon: MapPin,
      label: "Location",
      detail: lost.location_name === found.location_name
        ? lost.location_name
        : `${lost.location_name} → ${found.location_name}`,
      strength: lost.location_name === found.location_name ? ("high" as const) : ("medium" as const),
    },
  ].filter(Boolean) as {
    icon: React.ElementType;
    label: string;
    detail: string;
    strength: "high" | "medium";
  }[];

  const strengthStyle = {
    high: "bg-success/10 text-success border-success/20",
    medium: "bg-amber/10 text-amber border-amber/20",
  };

  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Why it matched
      </p>
      <div className="flex flex-wrap gap-2">
        {reasons.map((r) => (
          <div
            key={r.label}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${strengthStyle[r.strength]}`}
          >
            <r.icon className="size-3 shrink-0" />
            <span>{r.label}</span>
            <span className="opacity-60">·</span>
            <span className="max-w-[120px] truncate opacity-80">{r.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const router = useRouter();
  const supabase = useSupabase();
  const [loading, setLoading] = useState<string | null>(null);

  const handleStartChat = async () => {
    if (!match.lost_item || !match.found_item) return;
    setLoading("chat");

    // Check for existing conversation for this match
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("match_id", match.id)
      .single();

    if (existing) {
      router.push(`/chat/${existing.id}`);
      return;
    }

    // Create new conversation
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        match_id: match.id,
        participant_1: match.lost_item.user_id,
        participant_2: match.found_item.user_id,
      })
      .select("id")
      .single();

    if (created && !error) {
      router.push(`/chat/${created.id}`);
    }

    setLoading(null);
  };

  const handleUpdateStatus = async (status: string) => {
    setLoading(status);
    await supabase.from("matches").update({ status }).eq("id", match.id);
    setLoading(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Match</span>
          <MatchScoreBadge score={match.score} />
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex gap-3">
          {match.lost_item && (
            <MiniItemCard item={match.lost_item} label="Lost" />
          )}
          {match.found_item && (
            <MiniItemCard item={match.found_item} label="Found" />
          )}
        </div>
        {match.lost_item && match.found_item && (
          <MatchReasons lost={match.lost_item} found={match.found_item} />
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleStartChat}
          disabled={loading !== null}
        >
          <MessageSquare className="size-3.5" />
          Start Chat
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateStatus("confirmed")}
          disabled={loading !== null}
        >
          <Check className="size-3.5" />
          Confirm Match
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleUpdateStatus("rejected")}
          disabled={loading !== null}
        >
          <X className="size-3.5" />
          Not a Match
        </Button>
      </CardFooter>
    </Card>
  );
}

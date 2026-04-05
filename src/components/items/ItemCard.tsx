"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Item } from "@/types";

// Brand colors: Alert Red for lost, Hope Amber for found
const statusColors: Record<Item["status"], string> = {
  open: "bg-success/10 text-success",
  matched: "bg-amber/10 text-amber",
  resolved: "bg-primary/10 text-primary",
  closed: "bg-muted text-muted-foreground",
};

const typeColors: Record<Item["type"], string> = {
  lost: "bg-destructive/10 text-destructive",
  found: "bg-amber/10 text-amber",
};

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const hasImage = item.image_urls && item.image_urls.length > 0;

  return (
    <Link href={`/items/${item.id}`} className="block group">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        {/* Thumbnail */}
        <div className="relative aspect-[16/10] w-full bg-muted">
          {hasImage ? (
            <Image
              src={item.image_urls[0]}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="size-10 text-muted-foreground" />
            </div>
          )}

          {/* Type badge overlay */}
          <div className="absolute left-2 top-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${typeColors[item.type]}`}
            >
              {item.type === "lost" ? "Lost" : "Found"}
            </span>
          </div>

          {/* Status badge overlay */}
          <div className="absolute right-2 top-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[item.status]}`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>
        </div>

        <CardContent className="space-y-2">
          {/* Title */}
          <h3 className="line-clamp-1 font-semibold group-hover:underline">
            {item.title}
          </h3>

          {/* Category badge */}
          <Badge variant="teal">
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Badge>

          {/* Location & date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="line-clamp-1">{item.location_name}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.date_occurred), {
              addSuffix: true,
            })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useSupabase } from "@/hooks/useSupabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Tag,
  User,
  Package,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Item } from "@/types";
import dynamic from "next/dynamic";

const LocationDisplay = dynamic(
  () =>
    import("@/components/map/LocationDisplay").then((mod) => mod.LocationDisplay),
  { ssr: false }
);

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = useSupabase();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      const { data } = await supabase
        .from("items")
        .select("*, profiles(*)")
        .eq("id", id)
        .single();

      if (data) setItem(data);
      setLoading(false);
    }

    fetchItem();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12 text-gray-500">Item not found.</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant={item.type === "lost" ? "destructive" : "amber"}
          >
            {item.type === "lost" ? "Lost" : "Found"}
          </Badge>
          <Badge variant="outline">{item.category}</Badge>
          <Badge
            variant="secondary"
            className={
              item.status === "open"
                ? "bg-success/10 text-success"
                : item.status === "matched"
                  ? "bg-amber/10 text-amber"
                  : ""
            }
          >
            {item.status}
          </Badge>
        </div>
        <h1 className="text-3xl font-heading font-bold">{item.title}</h1>
        <p className="text-gray-500 mt-1">
          Posted{" "}
          {formatDistanceToNow(new Date(item.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>

      {/* Images */}
      {item.image_urls.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {item.image_urls.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <Image
                src={url}
                alt={`${item.title} image ${i + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Details */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {item.type === "lost" ? "Lost" : "Found"} on{" "}
                {format(new Date(item.date_occurred), "PPP")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{item.location_name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="w-4 h-4" />
              <span className="capitalize">{item.category}</span>
            </div>
            {item.profiles && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>Posted by {item.profiles.full_name}</span>
              </div>
            )}
          </div>

          {item.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="teal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      {item.latitude && item.longitude && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Location</h3>
            <div className="h-64 rounded-lg overflow-hidden">
              <LocationDisplay
                lat={item.latitude}
                lng={item.longitude}
                title={item.location_name}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

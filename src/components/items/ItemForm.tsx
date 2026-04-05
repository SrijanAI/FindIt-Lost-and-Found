"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TagInput } from "@/components/items/TagInput";
import { ItemImageUpload } from "@/components/items/ItemImageUpload";

import { itemSchema, type ItemFormValues } from "@/lib/validations";
import { CATEGORIES, type ItemCategory } from "@/types";
import { useSupabase } from "@/hooks/useSupabase";

interface ItemFormProps {
  type: "lost" | "found";
}

export function ItemForm({ type }: ItemFormProps) {
  const router = useRouter();
  const supabase = useSupabase();
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "other",
      tags: [],
      date_occurred: "",
      location_name: "",
      latitude: null,
      longitude: null,
    },
  });

  async function uploadImages(userId: string): Promise<string[]> {
    const urls: string[] = [];
    for (const file of images) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("item-images")
        .upload(filePath, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("item-images").getPublicUrl(filePath);

      urls.push(publicUrl);
    }
    return urls;
  }

  async function onSubmit(data: ItemFormValues) {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("You must be logged in to report an item.");
        return;
      }

      // Upload images
      const imageUrls = await uploadImages(user.id);

      // Insert the item
      const { data: item, error: insertError } = await supabase
        .from("items")
        .insert({
          user_id: user.id,
          type,
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags,
          date_occurred: data.date_occurred,
          location_name: data.location_name,
          latitude: data.latitude,
          longitude: data.longitude,
          image_urls: imageUrls,
          status: "open",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Find potential matches
      await supabase.rpc("find_matches_for_item", {
        new_item_id: item.id,
      });

      toast.success(
        `${type === "lost" ? "Lost" : "Found"} item reported successfully!`
      );
      router.push(`/items/${item.id}`);
    } catch (error) {
      console.error("Error submitting item:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder={`What did you ${type === "lost" ? "lose" : "find"}?`}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the item in detail (color, brand, distinguishing marks, etc.)"
          rows={4}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Category & Date - side by side on larger screens */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val) => field.onChange(val as ItemCategory)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Date occurred */}
        <div className="space-y-2">
          <Label htmlFor="date_occurred">
            Date {type === "lost" ? "lost" : "found"}
          </Label>
          <Input
            id="date_occurred"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            {...register("date_occurred")}
          />
          {errors.date_occurred && (
            <p className="text-sm text-destructive">
              {errors.date_occurred.message}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.tags && (
          <p className="text-sm text-destructive">{errors.tags.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location_name">Location</Label>
        <Input
          id="location_name"
          placeholder="Where was the item lost/found? (e.g., Library, Canteen)"
          {...register("location_name")}
        />
        {errors.location_name && (
          <p className="text-sm text-destructive">
            {errors.location_name.message}
          </p>
        )}
        {/* Hidden lat/lng inputs for future map integration */}
        <input type="hidden" {...register("latitude", { valueAsNumber: true })} />
        <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
      </div>

      {/* Image upload */}
      <div className="space-y-2">
        <Label>Images</Label>
        <ItemImageUpload value={images} onChange={setImages} />
      </div>

      {/* Submit button */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Submitting...
          </>
        ) : (
          `Report ${type === "lost" ? "Lost" : "Found"} Item`
        )}
      </Button>
    </form>
  );
}

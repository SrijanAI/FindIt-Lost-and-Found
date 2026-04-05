"use client";

import { useCallback, useRef, useState } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MAX_IMAGES,
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/constants";

interface ItemImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
}

export function ItemImageUpload({ value, onChange }: ItemImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported image type. Use JPEG, PNG, or WebP.`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `"${file.name}" exceeds the 5MB size limit.`;
    }
    return null;
  };

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null);
      const filesToAdd = Array.from(newFiles);
      const remaining = MAX_IMAGES - value.length;

      if (remaining <= 0) {
        setError(`Maximum ${MAX_IMAGES} images allowed.`);
        return;
      }

      const validFiles: File[] = [];
      for (const file of filesToAdd.slice(0, remaining)) {
        const err = validateFile(file);
        if (err) {
          setError(err);
          return;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        onChange([...value, ...validFiles]);
      }
    },
    [value, onChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      setError(null);
      const updated = value.filter((_, i) => i !== index);
      onChange(updated);
    },
    [value, onChange]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      // Reset input so the same file can be selected again
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        } ${value.length >= MAX_IMAGES ? "pointer-events-none opacity-50" : ""}`}
      >
        <Upload className="mb-2 size-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drag & drop images here, or click to select
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, or WebP. Max 5MB each. Up to {MAX_IMAGES} images.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((file, index) => (
            <div key={`${file.name}-${index}`} className="group relative">
              <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 size-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="size-3" />
              </Button>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length}/{MAX_IMAGES} images selected
      </p>
    </div>
  );
}

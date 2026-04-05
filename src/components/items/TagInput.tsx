"use client";

import { useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SUGGESTED_TAGS, POPULAR_TAGS } from "@/types";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

const MAX_TAGS = 10;

export function TagInput({ value, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = SUGGESTED_TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tag) &&
      inputValue.length > 0
  );

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (trimmed && !value.includes(trimmed) && value.length < MAX_TAGS) {
        onChange([...value, trimmed]);
        setInputValue("");
        setShowSuggestions(false);
      }
    },
    [value, onChange]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(value.filter((t) => t !== tagToRemove));
    },
    [value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Tags display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                aria-label={`Remove ${tag}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow suggestion click
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={
            value.length >= MAX_TAGS
              ? "Max tags reached"
              : "Type and press Enter to add tags..."
          }
          disabled={value.length >= MAX_TAGS}
        />

        {/* Suggestions dropdown — filtered while typing */}
        {showSuggestions && inputValue.length > 0 && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover p-1 shadow-md">
            {filteredSuggestions.slice(0, 8).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
            {/* Allow adding the typed value itself if not in suggestions */}
            {!SUGGESTED_TAGS.includes(inputValue.trim().toLowerCase()) && inputValue.trim().length > 0 && (
              <button
                type="button"
                className="w-full rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(inputValue);
                }}
              >
                Add &quot;{inputValue.trim()}&quot;
              </button>
            )}
          </div>
        )}
      </div>

      {/* Popular tag chips */}
      {value.length < MAX_TAGS && (
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TAGS.filter((t) => !value.includes(t)).slice(0, 10).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length}/{MAX_TAGS} tags · Type anything or pick a suggestion.
      </p>
    </div>
  );
}

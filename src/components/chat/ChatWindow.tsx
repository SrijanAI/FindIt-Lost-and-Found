"use client";

import { useRef, useEffect, useState } from "react";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useSupabase } from "@/hooks/useSupabase";
import { MessageBubble } from "./MessageBubble";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, MessageSquare, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

const IMAGE_PREFIX = "__img__:";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
}

export function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
  const supabase = useSupabase();
  const { messages, loading, sendMessage } = useRealtimeMessages(conversationId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, or GIF images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    setImagePreview({ file, url: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const handleSend = async () => {
    if (sending) return;

    if (imagePreview) {
      setSending(true);
      try {
        const ext = imagePreview.file.name.split(".").pop();
        const filePath = `chat/${currentUserId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(filePath, imagePreview.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("item-images")
          .getPublicUrl(filePath);

        const { error } = await sendMessage(`${IMAGE_PREFIX}${publicUrl}`, currentUserId);
        if (error) throw error;

        setImagePreview(null);
      } catch {
        toast.error("Failed to send image.");
      } finally {
        setSending(false);
      }
      return;
    }

    const content = input.trim();
    if (!content) return;

    setSending(true);
    setInput("");
    const { error } = await sendMessage(content, currentUserId);
    if (error) {
      toast.error("Failed to send message.");
      setInput(content);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageSquare className="size-10" />
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image preview strip */}
      {imagePreview && (
        <div className="border-t bg-muted/40 px-3 py-2">
          <div className="relative inline-block">
            <img
              src={imagePreview.url}
              alt="preview"
              className="h-20 w-20 rounded-lg object-cover border"
            />
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t bg-background p-3">
        <div className="flex items-center gap-2">
          {/* Image upload button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
          >
            <ImagePlus className="size-5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageSelect}
            className="hidden"
          />

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={imagePreview ? "Add a caption... (optional)" : "Type a message..."}
            disabled={sending}
            className="flex-1"
          />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={(!input.trim() && !imagePreview) || sending}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

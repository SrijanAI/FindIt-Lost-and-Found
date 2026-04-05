"use client";

import { format } from "date-fns";
import type { Message } from "@/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const IMAGE_PREFIX = "__img__:";

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isImage = message.content.startsWith(IMAGE_PREFIX);
  const imageUrl = isImage ? message.content.slice(IMAGE_PREFIX.length) : null;

  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2",
          isOwn
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground",
          isImage && "p-1.5"
        )}
      >
        {!isOwn && message.sender && (
          <p className="mb-0.5 px-2 text-xs font-semibold text-muted-foreground">
            {message.sender.full_name}
          </p>
        )}

        {isImage ? (
          <img
            src={imageUrl!}
            alt="shared image"
            className="max-h-64 w-full rounded-xl object-cover cursor-pointer"
            onClick={() => window.open(imageUrl!, "_blank")}
          />
        ) : (
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        )}

        <p
          className={cn(
            "mt-1 text-[10px]",
            isOwn ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left",
            isImage && "px-1"
          )}
        >
          {format(new Date(message.created_at), "h:mm a")}
        </p>
      </div>
    </div>
  );
}

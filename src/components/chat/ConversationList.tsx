"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import type { Conversation } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
}

export function ConversationList({
  conversations,
  currentUserId,
}: ConversationListProps) {
  const router = useRouter();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
        <MessageSquare className="size-10" />
        <p className="text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conv) => {
        const otherUser = conv.other_user;
        const lastMsg = conv.last_message;
        const hasUnread =
          lastMsg && !lastMsg.is_read && lastMsg.sender_id !== currentUserId;

        const initials = otherUser?.full_name
          ? otherUser.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : "?";

        return (
          <button
            key={conv.id}
            onClick={() => router.push(`/chat/${conv.id}`)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
          >
            <Avatar>
              {otherUser?.avatar_url && (
                <AvatarImage src={otherUser.avatar_url} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "truncate text-sm",
                    hasUnread ? "font-bold" : "font-medium"
                  )}
                >
                  {otherUser?.full_name ?? "Unknown User"}
                </p>
                {lastMsg && (
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(lastMsg.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
              {lastMsg && (
                <p
                  className={cn(
                    "truncate text-xs",
                    hasUnread
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {lastMsg.sender_id === currentUserId && "You: "}
                  {lastMsg.content}
                </p>
              )}
            </div>

            {hasUnread && (
              <span className="size-2 shrink-0 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

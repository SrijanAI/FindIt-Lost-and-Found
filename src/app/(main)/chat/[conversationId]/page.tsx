"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuthStore } from "@/lib/store";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/types";

export default function ChatConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const supabase = useSupabase();
  const { user } = useAuthStore();
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchConversation() {
      const { data: conv } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (conv) {
        const otherUserId =
          conv.participant_1 === user!.id
            ? conv.participant_2
            : conv.participant_1;

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", otherUserId)
          .single();

        if (profile) setOtherUser(profile);
      }
      setLoading(false);

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user!.id);
    }

    fetchConversation();
  }, [conversationId, user, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/chat">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold">
            {otherUser?.full_name || "Chat"}
          </h1>
          <p className="text-sm text-gray-500">{otherUser?.email}</p>
        </div>
      </div>

      {/* Chat Window */}
      <div className="border rounded-lg bg-white h-[calc(100vh-220px)]">
        <ChatWindow
          conversationId={conversationId}
          currentUserId={user?.id || ""}
        />
      </div>
    </div>
  );
}

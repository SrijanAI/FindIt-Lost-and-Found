"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuthStore } from "@/lib/store";
import { ConversationList } from "@/components/chat/ConversationList";
import type { Conversation } from "@/types";

export default function ChatPage() {
  const supabase = useSupabase();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchConversations() {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
        .order("created_at", { ascending: false });

      if (data) {
        // Fetch other user profiles and last messages
        const enriched = await Promise.all(
          data.map(async (conv) => {
            const otherUserId =
              conv.participant_1 === user!.id
                ? conv.participant_2
                : conv.participant_1;

            const [{ data: otherUser }, { data: lastMsg }] = await Promise.all([
              supabase
                .from("profiles")
                .select("*")
                .eq("id", otherUserId)
                .single(),
              supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", conv.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single(),
            ]);

            return {
              ...conv,
              other_user: otherUser || undefined,
              last_message: lastMsg || undefined,
            } as Conversation;
          })
        );

        setConversations(enriched);
      }
      setLoading(false);
    }

    fetchConversations();
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-heading font-bold">Messages</h1>
      <ConversationList
        conversations={conversations}
        currentUserId={user?.id || ""}
      />
    </div>
  );
}

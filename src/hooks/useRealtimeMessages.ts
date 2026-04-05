"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabase } from "./useSupabase";
import type { Message } from "@/types";

export function useRealtimeMessages(conversationId: string) {
  const supabase = useSupabase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const seenIds = useRef<Set<string>>(new Set());

  const addMessage = (msg: Message) => {
    if (seenIds.current.has(msg.id)) return;
    seenIds.current.add(msg.id);
    setMessages((prev) => [...prev, msg]);
  };

  useEffect(() => {
    seenIds.current = new Set();

    async function fetchMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:profiles(*)")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (data) {
        data.forEach((m) => seenIds.current.add(m.id));
        setMessages(data);
      }
      setLoading(false);
    }

    fetchMessages();

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Skip if already added optimistically
          if (seenIds.current.has(payload.new.id)) return;

          const { data: sender } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", payload.new.sender_id)
            .single();

          addMessage({ ...payload.new, sender } as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  const sendMessage = async (content: string, senderId: string) => {
    const tempId = `temp-${Date.now()}`;

    // Optimistic update — show immediately
    const optimistic: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    seenIds.current.add(tempId);
    setMessages((prev) => [...prev, optimistic]);

    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: senderId, content })
      .select("*, sender:profiles(*)")
      .single();

    if (error) {
      // Rollback optimistic message
      seenIds.current.delete(tempId);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return { error };
    }

    // Replace temp with real message
    seenIds.current.add(data.id);
    setMessages((prev) =>
      prev.map((m) => (m.id === tempId ? (data as Message) : m))
    );

    return { error: null };
  };

  return { messages, loading, sendMessage };
}

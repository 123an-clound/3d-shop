"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

type Table = "shop3d_products" | "shop3d_categories" | "shop3d_orders" | "shop3d_settings";

/**
 * Subscribes to Supabase Realtime for the given tables and re-renders the server components on any change,
 * so every open admin tab reflects edits (and new orders) made elsewhere without a manual reload.
 */
export function RealtimeRefresh({ tables }: { tables: Table[] }) {
  const router = useRouter();
  const [live, setLive] = useState(false);
  const key = tables.join(",");

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Bursts of changes (e.g. an order touching several products) collapse into one refresh.
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 300);
    };

    const channel = supabase.channel(`admin-${key}`);
    for (const table of key.split(",")) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
    }
    channel.subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [key, router]);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted" role="status">
      <span className={`size-2 rounded-full ${live ? "bg-success" : "bg-muted/50"}`} />
      {live ? "Realtime" : "Đang kết nối"}
    </span>
  );
}

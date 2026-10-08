import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase/server";
import { mergeSettings } from "@/lib/settings";
import { RealtimeRefresh } from "@/components/admin/realtime-refresh";
import { SettingsEditor } from "@/components/admin/settings-editor";

export const metadata: Metadata = { title: "Giao diện & thông tin" };

export default async function AdminSettingsPage() {
  // Read through the admin session (uncached) so the editor always starts from the latest values.
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("shop3d_settings").select("key, value");
  const settings = mergeSettings(data ?? []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-display text-2xl font-bold">Giao diện & thông tin web</h1>
        <RealtimeRefresh tables={["shop3d_settings"]} />
      </div>
      <p className="text-sm text-muted">Mỗi mục lưu riêng; website cập nhật ngay sau khi bấm Lưu.</p>
      <SettingsEditor initial={settings} />
    </div>
  );
}

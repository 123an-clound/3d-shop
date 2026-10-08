"use client";

import { useId, useRef, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { MEDIA_BUCKET } from "@/lib/supabase/env";

const MAX_BYTES = 5 * 1024 * 1024; // matches bucket file_size_limit
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/** Uploads straight to Supabase Storage from the browser; storage RLS only lets admins write. */
export function ImageUploader({ folder, onUploaded, multiple = false, label = "Tải ảnh lên" }: {
  folder: string;
  onUploaded: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(files: FileList) {
    setError("");
    const list = Array.from(files);
    const bad = list.find((f) => !TYPES.includes(f.type) || f.size > MAX_BYTES);
    if (bad) {
      setError(`"${bad.name}" không hợp lệ (chỉ JPG/PNG/WebP/AVIF/GIF, tối đa 5MB).`);
      return;
    }
    setBusy(true);
    const supabase = createSupabaseBrowser();
    const urls: string[] = [];
    for (const file of list) {
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (error) {
        setError(`Tải "${file.name}" thất bại: ${error.message}`);
        break;
      }
      urls.push(supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
    }
    setBusy(false);
    if (urls.length) onUploaded(urls);
    if (input.current) input.current.value = "";
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={TYPES.join(",")}
        multiple={multiple}
        className="sr-only"
        id={id}
        onChange={(e) => e.target.files?.length && upload(e.target.files)}
        disabled={busy}
      />
      <label htmlFor={id} className={`btn-ghost cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? "Đang tải..." : label}
      </label>
      {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { isAllowedImageUrl } from "@/lib/images";
import { ImageUploader } from "./image-uploader";

/** Ordered image list: upload, paste URL, reorder (first = cover), remove. */
export function ImageListEditor({ value, onChange, folder, max = 12 }: { value: string[]; onChange: (v: string[]) => void; folder: string; max?: number }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {value.map((src, i) => (
            <li key={src + i} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-2">
              <Image src={src} alt={`Ảnh ${i + 1}`} fill sizes="120px" className="object-cover" />
              {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-accent px-1.5 text-[10px] font-bold text-accent-ink">Ảnh bìa</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-bg/85 p-1 text-xs">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="px-1.5 disabled:opacity-30" aria-label={`Đưa ảnh ${i + 1} lên trước`}>←</button>
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="px-1.5 text-danger" aria-label={`Xóa ảnh ${i + 1}`}>Xóa</button>
                <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="px-1.5 disabled:opacity-30" aria-label={`Đưa ảnh ${i + 1} ra sau`}>→</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {value.length < max && (
        <div className="flex flex-wrap items-start gap-2">
          <ImageUploader folder={folder} multiple onUploaded={(urls) => onChange([...value, ...urls].slice(0, max))} />
          <div className="flex min-w-64 flex-1 gap-2">
            <label className="sr-only" htmlFor={`img-url-${folder}`}>Dán URL ảnh</label>
            <input id={`img-url-${folder}`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="hoặc dán URL ảnh (Supabase/Wikimedia)" className="input" />
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                if (!isAllowedImageUrl(url.trim())) return setError("URL phải là https từ kho ảnh Supabase hoặc Wikimedia.");
                setError("");
                onChange([...value, url.trim()]);
                setUrl("");
              }}
            >
              Thêm
            </button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}

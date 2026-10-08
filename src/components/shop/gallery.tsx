"use client";

import Image from "next/image";
import { useState } from "react";
import { CubeIcon } from "@/components/icons";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-surface-2">
        {current ? (
          <Image key={current} src={current} alt={`${name} — ảnh ${index + 1}`} fill priority sizes="(min-width: 1024px) 600px, 100vw" className="animate-fade-up object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-muted"><CubeIcon width={64} height={64} /></div>
        )}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Ảnh sản phẩm">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                aria-current={i === index}
                className={`relative block size-20 overflow-hidden rounded-xl border-2 transition ${i === index ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

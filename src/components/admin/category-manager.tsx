"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { slugify } from "@/lib/format";
import type { Category } from "@/lib/types";
import { ImageListEditor } from "./image-list-editor";

type Draft = { id?: string; name: string; slug: string; description: string; image_url: string; sort_order: number };
const EMPTY: Draft = { name: "", slug: "", description: "", image_url: "", sort_order: 0 };

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [msg, setMsg] = useState("");
  const [pending, startTransition] = useTransition();

  const edit = (c?: Category) => {
    setErrors({});
    setMsg("");
    setDraft(c ? { id: c.id, name: c.name, slug: c.slug, description: c.description, image_url: c.image_url, sort_order: c.sort_order } : { ...EMPTY, sort_order: categories.length + 1 });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="card flex items-center gap-3 p-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              {c.image_url && <Image src={c.image_url} alt="" fill sizes="48px" className="object-cover" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted">/{c.slug} · {counts[c.id] ?? 0} sản phẩm · thứ tự {c.sort_order}</p>
            </div>
            <button type="button" className="text-sm text-accent hover:underline" onClick={() => edit(c)}>Sửa</button>
            <button
              type="button"
              className="text-sm text-danger hover:underline"
              disabled={pending}
              onClick={() => {
                if (!window.confirm(`Xóa danh mục "${c.name}"? Sản phẩm thuộc danh mục sẽ chuyển thành "không có danh mục".`)) return;
                startTransition(async () => {
                  const res = await deleteCategory(c.id);
                  if (!res.ok) window.alert(res.error);
                  if (draft?.id === c.id) setDraft(null);
                  router.refresh();
                });
              }}
            >
              Xóa
            </button>
          </li>
        ))}
        {!categories.length && <p className="card p-6 text-center text-sm text-muted">Chưa có danh mục.</p>}
        <li><button type="button" className="btn-primary" onClick={() => edit()}>+ Thêm danh mục</button></li>
      </ul>

      {draft && (
        <form
          className="card h-fit space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const res = await saveCategory(draft);
              if (!res.ok) {
                setErrors(res.fieldErrors ?? {});
                setMsg(res.error);
                return;
              }
              setDraft(null);
              router.refresh();
            });
          }}
        >
          <h2 className="font-semibold">{draft.id ? "Sửa danh mục" : "Danh mục mới"}</h2>
          <div>
            <label htmlFor="c-name" className="label">Tên *</label>
            <input id="c-name" className="input" value={draft.name} required onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.id ? draft.slug : slugify(e.target.value) })} />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name[0]}</p>}
          </div>
          <div>
            <label htmlFor="c-slug" className="label">Slug *</label>
            <input id="c-slug" className="input" value={draft.slug} required onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
            {errors.slug && <p className="mt-1 text-xs text-danger">{errors.slug[0]}</p>}
          </div>
          <div>
            <label htmlFor="c-desc" className="label">Mô tả</label>
            <textarea id="c-desc" rows={3} className="input py-2.5" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div>
            <label htmlFor="c-order" className="label">Thứ tự hiển thị</label>
            <input id="c-order" type="number" className="input" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Math.trunc(Number(e.target.value)) || 0 })} />
          </div>
          <div>
            <p className="label">Ảnh đại diện</p>
            <ImageListEditor folder="categories" max={1} value={draft.image_url ? [draft.image_url] : []} onChange={(v) => setDraft({ ...draft, image_url: v[0] ?? "" })} />
            {errors.image_url && <p className="mt-1 text-xs text-danger">{errors.image_url[0]}</p>}
          </div>
          {msg && <p role="alert" className="text-sm text-danger">{msg}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="btn-primary flex-1">{pending ? "Đang lưu..." : "Lưu"}</button>
            <button type="button" className="btn-ghost" onClick={() => setDraft(null)}>Hủy</button>
          </div>
        </form>
      )}
    </div>
  );
}

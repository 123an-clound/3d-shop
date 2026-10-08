"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProduct } from "@/app/admin/actions";
import { slugify } from "@/lib/format";
import type { Category, Product, Spec } from "@/lib/types";
import { ImageListEditor } from "./image-list-editor";

type Errors = Record<string, string[] | undefined>;

export function ProductForm({ product, categories }: { product: Product | null; categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category_id: product?.category_id ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    compare_at_price: product?.compare_at_price ?? null,
    stock: product?.stock ?? 0,
    is_published: product?.is_published ?? true,
    is_featured: product?.is_featured ?? false,
  });
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [specs, setSpecs] = useState<Spec[]>(product?.specs ?? []);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => (v === "" ? 0 : Math.max(0, Math.trunc(Number(v)) || 0));
  const err = (k: string) => errors[k]?.[0];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await saveProduct({
        ...form,
        id: product?.id,
        images,
        specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setMsg({ ok: false, text: res.error });
        return;
      }
      setErrors({});
      setMsg({ ok: true, text: "Đã lưu." });
      if (!product) router.replace(`/admin/san-pham/${res.data!.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">Thông tin chung</h2>
          <F label="Tên sản phẩm *" id="name" error={err("name")}>
            <input
              id="name"
              value={form.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              className="input"
              required
            />
          </F>
          <F label="Slug (URL) *" id="slug" error={err("slug")} hint={`/san-pham/${form.slug || "..."}`}>
            <input id="slug" value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} className="input" required />
          </F>
          <F label="Mô tả ngắn" id="short" error={err("short_description")}>
            <input id="short" value={form.short_description} onChange={(e) => set("short_description", e.target.value)} className="input" maxLength={300} />
          </F>
          <F label="Mô tả chi tiết" id="desc" error={err("description")}>
            <textarea id="desc" value={form.description} onChange={(e) => set("description", e.target.value)} rows={7} className="input py-2.5" />
          </F>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">Hình ảnh</h2>
          <ImageListEditor value={images} onChange={setImages} folder="products" />
          {err("images") && <p className="text-xs text-danger">{err("images")}</p>}
        </section>

        <section className="card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Thông số kỹ thuật</h2>
            <button type="button" className="btn-ghost min-h-9 px-3 text-xs" onClick={() => setSpecs([...specs, { label: "", value: "" }])}>+ Thêm dòng</button>
          </div>
          {specs.length === 0 && <p className="text-sm text-muted">Chưa có thông số.</p>}
          <ul className="space-y-2">
            {specs.map((s, i) => (
              <li key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
                <input aria-label={`Tên thông số ${i + 1}`} placeholder="VD: Khổ in" value={s.label} onChange={(e) => setSpecs(specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className="input" />
                <input aria-label={`Giá trị thông số ${i + 1}`} placeholder="VD: 220 x 220 x 250 mm" value={s.value} onChange={(e) => setSpecs(specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className="input" />
                <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="px-2 text-sm text-danger" aria-label={`Xóa thông số ${i + 1}`}>Xóa</button>
              </li>
            ))}
          </ul>
          {err("specs") && <p className="text-xs text-danger">Mỗi dòng cần cả tên và giá trị.</p>}
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:h-fit">
        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">Giá & kho</h2>
          <F label="Giá bán (đ) *" id="price" error={err("price")}>
            <input id="price" type="number" min={0} step={1000} value={form.price} onChange={(e) => set("price", num(e.target.value))} className="input" />
          </F>
          <F label="Giá gốc (để hiện giảm giá)" id="compare" error={err("compare_at_price")}>
            <input id="compare" type="number" min={0} step={1000} value={form.compare_at_price ?? ""} onChange={(e) => set("compare_at_price", e.target.value === "" ? null : num(e.target.value))} className="input" />
          </F>
          <F label="Tồn kho" id="stock" error={err("stock")}>
            <input id="stock" type="number" min={0} value={form.stock} onChange={(e) => set("stock", num(e.target.value))} className="input" />
          </F>
          <F label="Danh mục" id="cat" error={err("category_id")}>
            <select id="cat" value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className="input">
              <option value="">— Không có —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </F>
          <label className="flex min-h-11 items-center gap-2.5 text-sm">
            <input type="checkbox" checked={form.is_published} onChange={(e) => set("is_published", e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
            Hiển thị trên web
          </label>
          <label className="flex min-h-11 items-center gap-2.5 text-sm">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
            Sản phẩm nổi bật (trang chủ)
          </label>
        </section>
        {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">{pending ? "Đang lưu..." : product ? "Lưu thay đổi" : "Tạo sản phẩm"}</button>
      </aside>
    </form>
  );
}

function F({ label, id, error, hint, children }: { label: string; id: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

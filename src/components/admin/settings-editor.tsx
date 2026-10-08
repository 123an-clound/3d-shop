"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { saveSettings } from "@/app/admin/actions";
import type { Banner, FaqItem, Highlight, Settings, SettingsKey } from "@/lib/types";
import { ImageListEditor } from "./image-list-editor";

/** One card per settings key; each saves independently so a validation error in one never blocks the others. */
export function SettingsEditor({ initial }: { initial: Settings }) {
  const [s, setS] = useState(initial);
  const patch = <K extends SettingsKey>(key: K, value: Partial<Settings[K]>) =>
    setS((prev) => ({ ...prev, [key]: Array.isArray(value) ? value : { ...prev[key], ...value } }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Section title="Thương hiệu" k="site" value={s.site}>
        <Text label="Tên cửa hàng" value={s.site.name} onChange={(v) => patch("site", { name: v })} />
        <Text label="Khẩu hiệu (tagline)" value={s.site.tagline} onChange={(v) => patch("site", { tagline: v })} />
        <Text label="Mô tả (SEO & footer)" value={s.site.description} onChange={(v) => patch("site", { description: v })} multiline />
        <ImageField label="Logo (để trống = logo chữ)" folder="branding" value={s.site.logo_url} onChange={(v) => patch("site", { logo_url: v })} />
      </Section>

      <Section title="Thông tin liên hệ" k="contact" value={s.contact}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Điện thoại" value={s.contact.phone} onChange={(v) => patch("contact", { phone: v })} />
          <Text label="Zalo" value={s.contact.zalo} onChange={(v) => patch("contact", { zalo: v })} />
        </div>
        <Text label="Email" type="email" value={s.contact.email} onChange={(v) => patch("contact", { email: v })} />
        <Text label="Địa chỉ" value={s.contact.address} onChange={(v) => patch("contact", { address: v })} />
        <Text label="Facebook (URL)" value={s.contact.facebook} onChange={(v) => patch("contact", { facebook: v })} />
        <Text label="Giờ mở cửa" value={s.contact.hours} onChange={(v) => patch("contact", { hours: v })} />
        <Text label="Cam kết thời gian phản hồi (VD: Phản hồi trong 30 phút)" value={s.contact.response_time} onChange={(v) => patch("contact", { response_time: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Vĩ độ (lat, tùy chọn)" value={s.contact.lat} onChange={(v) => patch("contact", { lat: v })} />
          <Text label="Kinh độ (lng, tùy chọn)" value={s.contact.lng} onChange={(v) => patch("contact", { lng: v })} />
        </div>
        <p className="text-xs text-muted">Lấy tọa độ: Google Maps → nhấn chuột phải vào cửa hàng → bấm vào dòng số đầu tiên để sao chép.</p>
      </Section>

      <Section title="Câu hỏi thường gặp (FAQ)" k="faq" value={s.faq}>
        <ListEditor<FaqItem>
          label="Câu hỏi"
          items={s.faq}
          empty={{ q: "", a: "" }}
          max={30}
          onChange={(faq) => setS((prev) => ({ ...prev, faq }))}
          render={(f, set) => (
            <>
              <Text label="Câu hỏi" value={f.q} onChange={(v) => set({ ...f, q: v })} />
              <Text label="Trả lời" value={f.a} onChange={(v) => set({ ...f, a: v })} multiline />
            </>
          )}
        />
      </Section>

      <Section title="Trang chính sách" k="policies" value={s.policies}>
        <p className="text-xs text-muted">Để trống = ẩn trang. Xuống dòng được giữ nguyên khi hiển thị.</p>
        <Text label="Chính sách bảo mật" value={s.policies.privacy} onChange={(v) => patch("policies", { privacy: v })} multiline rows={12} />
        <Text label="Chính sách đổi trả & bảo hành" value={s.policies.returns} onChange={(v) => patch("policies", { returns: v })} multiline rows={12} />
      </Section>

      <Section title="Banner chính (Hero)" k="hero" value={s.hero}>
        <Text label="Dòng nhỏ phía trên" value={s.hero.eyebrow} onChange={(v) => patch("hero", { eyebrow: v })} />
        <Text label="Tiêu đề lớn" value={s.hero.title} onChange={(v) => patch("hero", { title: v })} />
        <Text label="Mô tả" value={s.hero.subtitle} onChange={(v) => patch("hero", { subtitle: v })} multiline />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Chữ trên nút" value={s.hero.cta_label} onChange={(v) => patch("hero", { cta_label: v })} />
          <Text label="Link nút" value={s.hero.cta_href} onChange={(v) => patch("hero", { cta_href: v })} />
        </div>
        <ImageField label="Ảnh hero" folder="hero" value={s.hero.image_url} onChange={(v) => patch("hero", { image_url: v })} />
      </Section>

      <Section title="Các section trang chủ" k="sections" value={s.sections}>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["show_highlights", "Cam kết / điểm nổi bật"],
              ["show_categories", "Danh mục"],
              ["show_featured", "Sản phẩm nổi bật"],
              ["show_banners", "Banner khuyến mãi"],
              ["show_new", "Hàng mới về"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex min-h-11 items-center gap-2.5 text-sm">
              <input type="checkbox" checked={s.sections[key]} onChange={(e) => patch("sections", { [key]: e.target.checked })} className="size-4 accent-[var(--color-accent)]" />
              Hiện: {label}
            </label>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Tiêu đề 'nổi bật'" value={s.sections.featured_title} onChange={(v) => patch("sections", { featured_title: v })} />
          <Text label="Tiêu đề 'mới về'" value={s.sections.new_title} onChange={(v) => patch("sections", { new_title: v })} />
        </div>
        <ListEditor<Highlight>
          label="Điểm nổi bật"
          items={s.sections.highlights}
          empty={{ title: "", text: "" }}
          max={8}
          onChange={(highlights) => patch("sections", { highlights })}
          render={(h, set) => (
            <>
              <Text label="Tiêu đề" value={h.title} onChange={(v) => set({ ...h, title: v })} />
              <Text label="Mô tả" value={h.text} onChange={(v) => set({ ...h, text: v })} />
            </>
          )}
        />
      </Section>

      <Section title="Banner khuyến mãi" k="banners" value={s.banners}>
        <ListEditor<Banner>
          label="Banner"
          items={s.banners}
          empty={{ title: "", subtitle: "", href: "/san-pham", image_url: "" }}
          max={6}
          onChange={(banners) => setS((prev) => ({ ...prev, banners }))}
          render={(b, set) => (
            <>
              <Text label="Tiêu đề" value={b.title} onChange={(v) => set({ ...b, title: v })} />
              <Text label="Mô tả" value={b.subtitle} onChange={(v) => set({ ...b, subtitle: v })} />
              <Text label="Link" value={b.href} onChange={(v) => set({ ...b, href: v })} />
              <ImageField label="Ảnh nền" folder="banners" value={b.image_url} onChange={(v) => set({ ...b, image_url: v })} />
            </>
          )}
        />
      </Section>

      <Section title="Vận chuyển & thanh toán" k="shipping" value={s.shipping}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Num label="Phí ship đồng giá (đ)" value={s.shipping.flat_fee} onChange={(v) => patch("shipping", { flat_fee: v })} />
          <Num label="Miễn phí ship từ (đ)" value={s.shipping.free_threshold} onChange={(v) => patch("shipping", { free_threshold: v })} />
        </div>
      </Section>

      <Section title="Tài khoản nhận chuyển khoản" k="bank" value={s.bank}>
        <Text label="Ngân hàng" value={s.bank.bank_name} onChange={(v) => patch("bank", { bank_name: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Số tài khoản" value={s.bank.account_number} onChange={(v) => patch("bank", { account_number: v })} />
          <Text label="Chủ tài khoản" value={s.bank.account_name} onChange={(v) => patch("bank", { account_name: v })} />
        </div>
      </Section>
    </div>
  );
}

function Section<K extends SettingsKey>({ title, k, value, children }: { title: string; k: K; value: Settings[K]; children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form
      className="card h-fit space-y-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        startTransition(async () => {
          const res = await saveSettings(k, value);
          if (!res.ok) {
            const detail = Object.entries(res.fieldErrors ?? {}).map(([f, m]) => `${f}: ${m?.[0]}`).join("; ");
            setMsg({ ok: false, text: detail ? `${res.error} (${detail})` : res.error });
            return;
          }
          setMsg({ ok: true, text: "Đã lưu và cập nhật website." });
          router.refresh();
        });
      }}
    >
      <h2 className="font-semibold">{title}</h2>
      {children}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="submit" disabled={pending} className="btn-primary">{pending ? "Đang lưu..." : "Lưu"}</button>
        {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
      </div>
    </form>
  );
}

function Text({ label, value, onChange, multiline, rows = 3, type = "text" }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number; type?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {multiline ? (
        <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="input py-2.5" />
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input" />
      )}
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} type="number" min={0} step={1000} value={value} onChange={(e) => onChange(Math.max(0, Math.trunc(Number(e.target.value)) || 0))} className="input" />
    </div>
  );
}

function ImageField({ label, folder, value, onChange }: { label: string; folder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="label">{label}</p>
      <ImageListEditor folder={folder} max={1} value={value ? [value] : []} onChange={(v) => onChange(v[0] ?? "")} />
    </div>
  );
}

function ListEditor<T>({ label, items, empty, max, onChange, render }: {
  label: string;
  items: T[];
  empty: T;
  max: number;
  onChange: (items: T[]) => void;
  render: (item: T, set: (item: T) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <fieldset key={i} className="space-y-3 rounded-xl border border-line p-4">
          <legend className="px-1 text-xs text-muted">{label} {i + 1}</legend>
          {render(item, (next) => onChange(items.map((x, j) => (j === i ? next : x))))}
          <div className="flex gap-3 text-xs">
            <button type="button" disabled={i === 0} onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }} className="text-muted hover:text-fg disabled:opacity-30">↑ Lên</button>
            <button type="button" disabled={i === items.length - 1} onClick={() => { const n = [...items]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; onChange(n); }} className="text-muted hover:text-fg disabled:opacity-30">↓ Xuống</button>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="ml-auto text-danger hover:underline">Xóa</button>
          </div>
        </fieldset>
      ))}
      {items.length < max && (
        <button type="button" className="btn-ghost min-h-9 px-3 text-xs" onClick={() => onChange([...items, structuredClone(empty)])}>+ Thêm {label.toLowerCase()}</button>
      )}
    </div>
  );
}

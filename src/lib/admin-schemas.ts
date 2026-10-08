import { z } from "zod";
import { isAllowedImageUrl } from "./images";

const slug = z
  .string()
  .trim()
  .min(1, "Bắt buộc")
  .max(120)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Chỉ gồm chữ thường không dấu, số và dấu gạch ngang");

const imageUrl = z.string().trim().refine(isAllowedImageUrl, "Ảnh phải tải lên kho ảnh hoặc từ Wikimedia (https)");
const optionalImage = z.union([z.literal(""), imageUrl]);
const money = z.number().int().min(0).max(2_000_000_000);
const text = (max: number) => z.string().trim().max(max);

export const productSchema = z.object({
  id: z.uuid().optional(),
  name: text(200).min(1, "Bắt buộc"),
  slug,
  category_id: z.union([z.uuid(), z.literal("")]).transform((v) => v || null),
  short_description: text(300),
  description: text(10_000),
  price: money,
  compare_at_price: money.nullable(),
  stock: z.number().int().min(0).max(1_000_000),
  images: z.array(imageUrl).max(12),
  specs: z.array(z.object({ label: text(80).min(1), value: text(300).min(1) })).max(50),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});
export type ProductInput = z.input<typeof productSchema>;

export const categorySchema = z.object({
  id: z.uuid().optional(),
  name: text(100).min(1, "Bắt buộc"),
  slug,
  description: text(500),
  image_url: optionalImage,
  sort_order: z.number().int().min(-1000).max(1000),
});
export type CategoryInput = z.input<typeof categorySchema>;

const link = text(500).refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "Link phải bắt đầu bằng / hoặc https://");

/** One schema per shop3d_settings key; unknown keys are rejected. */
export const settingsSchemas = {
  site: z.object({ name: text(80).min(1), tagline: text(160), description: text(300), logo_url: optionalImage }),
  contact: z.object({
    phone: text(30),
    email: z.union([z.literal(""), z.email().max(200)]),
    address: text(300),
    zalo: text(30),
    facebook: link,
    hours: text(100),
    response_time: text(120),
    lat: z.union([z.literal(""), z.string().trim().regex(/^-?\d{1,2}(\.\d+)?$/, "Vĩ độ không hợp lệ")]),
    lng: z.union([z.literal(""), z.string().trim().regex(/^-?\d{1,3}(\.\d+)?$/, "Kinh độ không hợp lệ")]),
  }),
  hero: z.object({
    eyebrow: text(80),
    title: text(160).min(1),
    subtitle: text(400),
    cta_label: text(40),
    cta_href: link,
    image_url: optionalImage,
  }),
  banners: z.array(z.object({ title: text(120).min(1), subtitle: text(200), href: link, image_url: optionalImage })).max(6),
  sections: z.object({
    show_categories: z.boolean(),
    show_featured: z.boolean(),
    show_banners: z.boolean(),
    show_new: z.boolean(),
    show_highlights: z.boolean(),
    featured_title: text(80),
    new_title: text(80),
    highlights: z.array(z.object({ title: text(80).min(1), text: text(200) })).max(8),
  }),
  shipping: z.object({ flat_fee: money, free_threshold: money }),
  bank: z.object({ bank_name: text(100), account_number: text(40), account_name: text(100) }),
  faq: z.array(z.object({ q: text(200).min(1), a: text(2000).min(1) })).max(30),
  policies: z.object({ privacy: text(20_000), returns: text(20_000) }),
} as const;

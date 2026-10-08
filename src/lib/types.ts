export type Spec = { label: string; value: string };

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  short_description: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[];
  specs: Spec[];
  is_published: boolean;
  is_featured: boolean;
  sold_count: number;
  created_at: string;
  updated_at: string;
};

export type ProductWithCategory = Product & { category: Pick<Category, "slug" | "name"> | null };

export type OrderStatus = "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
export type PaymentMethod = "cod" | "bank_transfer";

export type Order = {
  id: string;
  code: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  is_paid: boolean;
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
};

/* ---- shop3d_settings values ---- */

export type SiteSettings = { name: string; tagline: string; description: string; logo_url: string };
export type ContactSettings = { phone: string; email: string; address: string; zalo: string; facebook: string; hours: string };
export type HeroSettings = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_href: string;
  image_url: string;
};
export type Banner = { title: string; subtitle: string; href: string; image_url: string };
export type Highlight = { title: string; text: string };
export type SectionSettings = {
  show_categories: boolean;
  show_featured: boolean;
  show_banners: boolean;
  show_new: boolean;
  show_highlights: boolean;
  featured_title: string;
  new_title: string;
  highlights: Highlight[];
};
export type ShippingSettings = { flat_fee: number; free_threshold: number };
export type BankSettings = { bank_name: string; account_number: string; account_name: string };

export type Settings = {
  site: SiteSettings;
  contact: ContactSettings;
  hero: HeroSettings;
  banners: Banner[];
  sections: SectionSettings;
  shipping: ShippingSettings;
  bank: BankSettings;
};

export type SettingsKey = keyof Settings;

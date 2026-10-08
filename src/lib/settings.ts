import type { Settings, SettingsKey } from "./types";

/** Fallbacks used when a settings row is missing; real values live in shop3d_settings. */
export const DEFAULT_SETTINGS: Settings = {
  site: { name: "3D Shop", tagline: "", description: "", logo_url: "" },
  contact: { phone: "", email: "", address: "", zalo: "", facebook: "", hours: "", response_time: "", lat: "", lng: "" },
  hero: { eyebrow: "", title: "3D Shop", subtitle: "", cta_label: "Xem sản phẩm", cta_href: "/san-pham", image_url: "" },
  banners: [],
  sections: {
    show_categories: true,
    show_featured: true,
    show_banners: true,
    show_new: true,
    show_highlights: true,
    featured_title: "Sản phẩm nổi bật",
    new_title: "Hàng mới về",
    highlights: [],
  },
  shipping: { flat_fee: 30000, free_threshold: 1000000 },
  bank: { bank_name: "", account_number: "", account_name: "" },
  faq: [],
  policies: { privacy: "", returns: "" },
};

/** Merges DB rows over defaults so a field added in code never renders as undefined. */
export function mergeSettings(rows: { key: string; value: unknown }[]): Settings {
  const settings: Settings = structuredClone(DEFAULT_SETTINGS);
  for (const row of rows) {
    const key = row.key as SettingsKey;
    if (!Object.hasOwn(settings, key)) continue;
    const fallback = settings[key];
    settings[key] = (Array.isArray(fallback) ? row.value : { ...fallback, ...(row.value as object) }) as never;
  }
  return settings;
}

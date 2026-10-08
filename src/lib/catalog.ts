import { normalizeText } from "./format";
import type { ProductWithCategory } from "./types";

export const SORT_OPTIONS = {
  "moi-nhat": "Mới nhất",
  "ban-chay": "Bán chạy",
  "gia-tang": "Giá tăng dần",
  "gia-giam": "Giá giảm dần",
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export type CatalogQuery = {
  q?: string;
  category?: string;
  sort?: string;
  min?: number;
  max?: number;
  inStock?: boolean;
};

type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const toInt = (v: string | undefined) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** URL params use Vietnamese slugs: ?q=&danh-muc=&sap-xep=&gia-tu=&gia-den=&con-hang=1 */
export function parseCatalogQuery(sp: SearchParams): CatalogQuery {
  return {
    q: one(sp.q)?.slice(0, 100),
    category: one(sp["danh-muc"]),
    sort: one(sp["sap-xep"]),
    min: toInt(one(sp["gia-tu"])),
    max: toInt(one(sp["gia-den"])),
    inStock: one(sp["con-hang"]) === "1",
  };
}

export function filterProducts(products: ProductWithCategory[], query: CatalogQuery) {
  const terms = normalizeText(query.q ?? "").split(/\s+/).filter(Boolean);

  const result = products.filter((p) => {
    if (query.category && p.category?.slug !== query.category) return false;
    if (query.min !== undefined && p.price < query.min) return false;
    if (query.max !== undefined && p.price > query.max) return false;
    if (query.inStock && p.stock <= 0) return false;
    if (terms.length) {
      const haystack = normalizeText(`${p.name} ${p.short_description} ${p.category?.name ?? ""}`);
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });

  const sort = (query.sort ?? "moi-nhat") as SortKey;
  const byDate = (a: ProductWithCategory, b: ProductWithCategory) => b.created_at.localeCompare(a.created_at);
  const compare: Record<SortKey, (a: ProductWithCategory, b: ProductWithCategory) => number> = {
    "moi-nhat": byDate,
    "ban-chay": (a, b) => b.sold_count - a.sold_count || byDate(a, b),
    "gia-tang": (a, b) => a.price - b.price,
    "gia-giam": (a, b) => b.price - a.price,
  };
  return result.sort(compare[sort] ?? byDate);
}

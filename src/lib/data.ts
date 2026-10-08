import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/public";
import { mergeSettings } from "./settings";
import type { Category, ProductWithCategory, Settings } from "./types";

/** Every storefront read shares this tag; admin mutations call updateTag(CATALOG_TAG). */
export const CATALOG_TAG = "shop3d";

const PRODUCT_SELECT = "*, category:shop3d_categories(slug, name)";

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const { data, error } = await createPublicClient().from("shop3d_settings").select("key, value");
  if (error) throw error;
  return mergeSettings(data ?? []);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const { data, error } = await createPublicClient()
    .from("shop3d_categories")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

/** ponytail: whole published catalog in one cached read; filtering happens in memory (see catalog.ts). Move filters into SQL past a few thousand products. */
export async function getProducts(): Promise<ProductWithCategory[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const { data, error } = await createPublicClient()
    .from("shop3d_products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProductWithCategory[];
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const { data, error } = await createPublicClient()
    .from("shop3d_products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data as ProductWithCategory | null;
}

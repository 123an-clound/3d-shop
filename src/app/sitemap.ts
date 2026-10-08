import type { MetadataRoute } from "next";
import { getProducts, getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { POLICY_PAGES } from "@/components/shop/policy-page";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, { policies }] = await Promise.all([getProducts(), getSettings()]);
  const policyUrls = (Object.keys(POLICY_PAGES) as (keyof typeof POLICY_PAGES)[])
    .filter((k) => policies[k].trim())
    .map((k) => ({ url: `${SITE_URL}${POLICY_PAGES[k].href}`, changeFrequency: "yearly" as const, priority: 0.2 }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/san-pham`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/lien-he`, changeFrequency: "monthly", priority: 0.4 },
    ...policyUrls,
    ...products.map((p) => ({ url: `${SITE_URL}/san-pham/${p.slug}`, lastModified: p.updated_at, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}

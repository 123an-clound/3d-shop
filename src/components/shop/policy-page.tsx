import { notFound } from "next/navigation";
import { getSettings } from "@/lib/data";
import type { PolicySettings } from "@/lib/types";
import { Breadcrumbs } from "./breadcrumbs";

export const POLICY_PAGES = {
  privacy: { href: "/chinh-sach-bao-mat", title: "Chính sách bảo mật" },
  returns: { href: "/chinh-sach-doi-tra", title: "Chính sách đổi trả & bảo hành" },
} satisfies Record<keyof PolicySettings, { href: string; title: string }>;

export async function PolicyPage({ kind }: { kind: keyof PolicySettings }) {
  const { policies } = await getSettings();
  const body = policies[kind].trim();
  if (!body) notFound();
  const { href, title } = POLICY_PAGES[kind];

  return (
    <div className="container-x max-w-3xl py-8 md:py-12">
      <Breadcrumbs items={[{ name: title, href }]} />
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <div className="mt-8 whitespace-pre-line leading-relaxed text-muted">{body}</div>
    </div>
  );
}

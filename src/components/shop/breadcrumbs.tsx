import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { ChevronRight } from "@/components/icons";

type Crumb = { name: string; href: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "Trang chủ", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight width={14} height={14} />}
              {i === all.length - 1 ? (
                <span aria-current="page" className="line-clamp-1 text-fg">{c.name}</span>
              ) : (
                <Link href={c.href} className="hover:text-fg">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${SITE_URL}${c.href}` })),
        }}
      />
    </>
  );
}

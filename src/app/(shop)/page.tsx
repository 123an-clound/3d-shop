import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { safeHref } from "@/lib/url";
import { ProductGrid } from "@/components/shop/product-card";
import { PrintCube } from "@/components/shop/print-cube";
import { JsonLd } from "@/components/json-ld";
import { ChevronRight, HIGHLIGHT_ICONS } from "@/components/icons";

export default async function HomePage() {
  const [settings, categories, products] = await Promise.all([getSettings(), getCategories(), getProducts()]);
  const { hero, sections, banners, site, contact } = settings;
  const featured = products.filter((p) => p.is_featured).slice(0, 8);
  const newest = products.slice(0, 8);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Store",
              "@id": `${SITE_URL}/#store`,
              name: site.name,
              description: site.description,
              url: SITE_URL,
              ...(site.logo_url && { logo: site.logo_url }),
              ...(contact.phone && { telephone: contact.phone }),
              ...(contact.email && { email: contact.email }),
              ...(contact.address && { address: { "@type": "PostalAddress", streetAddress: contact.address, addressCountry: "VN" } }),
            },
            {
              "@type": "WebSite",
              url: SITE_URL,
              name: site.name,
              inLanguage: "vi-VN",
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/san-pham?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        <div className="container-x relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
          <div className="animate-fade-up">
            {hero.eyebrow && (
              <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                {hero.eyebrow}
              </p>
            )}
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            {hero.subtitle && <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{hero.subtitle}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={safeHref(hero.cta_href)} className="btn-primary">
                {hero.cta_label}
                <ChevronRight />
              </Link>
              <Link href="/lien-he" className="btn-ghost">Tư vấn miễn phí</Link>
            </div>
          </div>

          <div className="relative mx-auto grid w-full max-w-lg place-items-center">
            {hero.image_url ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line shadow-2xl [transform:perspective(1200px)_rotateY(-8deg)_rotateX(4deg)]">
                <Image src={hero.image_url} alt={hero.title} fill priority sizes="(min-width: 1024px) 512px, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent" />
              </div>
            ) : null}
            <div className={hero.image_url ? "absolute -bottom-10 -left-6 hidden sm:block" : ""}>
              <PrintCube />
            </div>
          </div>
        </div>
      </section>

      {sections.show_highlights && sections.highlights.length > 0 && (
        <section aria-label="Cam kết" className="container-x mt-12">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sections.highlights.map((h, i) => {
              const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length];
              return (
                <li key={h.title} className="card flex gap-3.5 p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><Icon /></span>
                  <div>
                    <p className="text-sm font-semibold">{h.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{h.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {sections.show_categories && categories.length > 0 && (
        <section className="container-x mt-20" aria-labelledby="cat-heading">
          <SectionHeading id="cat-heading" title="Danh mục" href="/san-pham" />
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/san-pham?danh-muc=${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-surface-2">
                  {c.image_url && (
                    <Image src={c.image_url} alt="" fill sizes="(min-width: 1024px) 240px, 50vw" className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4 font-display text-base font-semibold leading-tight sm:text-lg">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sections.show_featured && featured.length > 0 && (
        <section className="container-x mt-20" aria-labelledby="featured-heading">
          <SectionHeading id="featured-heading" title={sections.featured_title} href="/san-pham" />
          <ProductGrid products={featured} />
        </section>
      )}

      {sections.show_banners && banners.length > 0 && (
        <section aria-label="Khuyến mãi" className="container-x mt-20 grid gap-5 md:grid-cols-2">
          {banners.map((b) => (
            <Link key={b.title + b.href} href={safeHref(b.href)} className="group relative isolate flex min-h-56 items-end overflow-hidden rounded-3xl border border-line p-6 sm:p-8">
              {b.image_url && (
                <Image src={b.image_url} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="-z-10 object-cover transition duration-700 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-bg via-bg/70 to-transparent" />
              <div>
                <p className="font-display text-2xl font-bold">{b.title}</p>
                {b.subtitle && <p className="mt-1.5 max-w-sm text-sm text-muted">{b.subtitle}</p>}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">Xem ngay <ChevronRight /></span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {sections.show_new && newest.length > 0 && (
        <section className="container-x mt-20" aria-labelledby="new-heading">
          <SectionHeading id="new-heading" title={sections.new_title} href="/san-pham?sap-xep=moi-nhat" />
          <ProductGrid products={newest} />
        </section>
      )}
    </>
  );
}

function SectionHeading({ id, title, href }: { id: string; title: string; href: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 id={id} className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline">
        Xem tất cả <ChevronRight />
      </Link>
    </div>
  );
}

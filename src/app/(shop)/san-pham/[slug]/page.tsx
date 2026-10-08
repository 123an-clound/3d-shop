import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProductBySlug, getProducts } from "@/lib/data";
import { discountPercent, formatVND } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { Gallery } from "@/components/shop/gallery";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductGrid } from "@/components/shop/product-card";
import { JsonLd } from "@/components/json-ld";
import { ShieldIcon, TruckIcon } from "@/components/icons";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/san-pham/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Không tìm thấy sản phẩm", robots: { index: false } };
  return {
    title: product.name,
    description: product.short_description || product.description.slice(0, 160),
    alternates: { canonical: `/san-pham/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.short_description,
      url: `/san-pham/${product.slug}`,
      images: product.images.slice(0, 1).map((url) => ({ url, alt: product.name })),
    },
  };
}

export default function ProductPage(props: PageProps<"/san-pham/[slug]">) {
  return (
    <div className="container-x py-8 md:py-12">
      <Suspense fallback={<div className="card mt-6 h-[32rem] animate-pulse" aria-busy="true" />}>
        <ProductDetail params={props.params} />
      </Suspense>
    </div>
  );
}

async function ProductDetail({ params }: { params: PageProps<"/san-pham/[slug]">["params"] }) {
  const { slug } = await params;
  const [product, all] = await Promise.all([getProductBySlug(slug), getProducts()]);
  if (!product) notFound();

  const off = discountPercent(product.price, product.compare_at_price);
  const inStock = product.stock > 0;
  const related = all.filter((p) => p.id !== product.id && p.category_id === product.category_id).slice(0, 4);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.short_description || product.description,
          image: product.images,
          sku: product.id,
          ...(product.category && { category: product.category.name }),
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/san-pham/${product.slug}`,
            priceCurrency: "VND",
            price: product.price,
            availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          },
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Sản phẩm", href: "/san-pham" },
          ...(product.category ? [{ name: product.category.name, href: `/san-pham?danh-muc=${product.category.slug}` }] : []),
          { name: product.name, href: `/san-pham/${product.slug}` },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Gallery images={product.images} name={product.name} />

        <div className="animate-fade-up">
          {product.category && <p className="text-xs font-semibold uppercase tracking-wider text-accent">{product.category.name}</p>}
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
          {product.short_description && <p className="mt-3 text-muted">{product.short_description}</p>}

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-hot">{formatVND(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-muted line-through">{formatVND(product.compare_at_price!)}</span>
                <span className="rounded-md bg-hot/15 px-2 py-0.5 text-sm font-semibold text-hot">-{off}%</span>
              </>
            )}
          </div>
          <p className={`mt-2 text-sm ${inStock ? "text-success" : "text-danger"}`}>
            {inStock ? `Còn hàng (${product.stock})` : "Tạm hết hàng"}
          </p>

          <div className="mt-6">
            <AddToCart
              product={{ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images[0] ?? "", stock: product.stock }}
            />
          </div>

          <ul className="mt-6 grid gap-2 text-sm text-muted sm:grid-cols-2">
            <li className="flex items-center gap-2"><TruckIcon className="text-accent" /> Giao hàng toàn quốc</li>
            <li className="flex items-center gap-2"><ShieldIcon className="text-accent" /> Hàng chính hãng, bảo hành</li>
          </ul>

          {product.specs.length > 0 && (
            <section className="mt-10" aria-labelledby="specs-heading">
              <h2 id="specs-heading" className="font-display text-xl font-semibold">Thông số kỹ thuật</h2>
              <dl className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {product.specs.map((s, i) => (
                  <div key={`${s.label}-${i}`} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-3 text-sm odd:bg-surface">
                    <dt className="text-muted">{s.label}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>

      {product.description && (
        <section className="mt-14 max-w-3xl" aria-labelledby="desc-heading">
          <h2 id="desc-heading" className="font-display text-xl font-semibold">Mô tả sản phẩm</h2>
          <div className="mt-4 whitespace-pre-line leading-relaxed text-muted">{product.description}</div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-6 font-display text-2xl font-bold">Sản phẩm liên quan</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}

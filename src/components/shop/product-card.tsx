import Image from "next/image";
import Link from "next/link";
import { discountPercent, formatVND } from "@/lib/format";
import type { ProductWithCategory } from "@/lib/types";
import { CubeIcon } from "@/components/icons";

export function ProductCard({ product, priority = false }: { product: ProductWithCategory; priority?: boolean }) {
  const off = discountPercent(product.price, product.compare_at_price);
  const image = product.images[0];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_18px_40px_-20px_var(--color-accent)]">
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 290px, (min-width: 768px) 30vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="grid h-full place-items-center text-muted"><CubeIcon width={48} height={48} /></div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && <span className="rounded-md bg-hot px-2 py-0.5 text-xs font-bold text-bg">-{off}%</span>}
          {product.stock <= 0 && <span className="rounded-md bg-bg/80 px-2 py-0.5 text-xs font-semibold text-muted">Hết hàng</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.category && <p className="text-xs font-medium uppercase tracking-wider text-accent">{product.category.name}</p>}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
          <Link href={`/san-pham/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          <span className="font-display text-base font-bold text-hot sm:text-lg">{formatVND(product.price)}</span>
          {off > 0 && <span className="text-xs text-muted line-through">{formatVND(product.compare_at_price!)}</span>}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: ProductWithCategory[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <div className="w-full"><ProductCard product={p} priority={i < priorityCount} /></div>
        </li>
      ))}
    </ul>
  );
}

import Image from "next/image";
import Link from "next/link";
import { getCategories, getSettings } from "@/lib/data";
import { CubeIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { CartButton } from "./cart-button";

export async function Header() {
  const [{ site }, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink">
        Bỏ qua đến nội dung
      </a>
      <div className="container-x flex h-16 items-center gap-3 md:gap-6">
        <details className="group relative md:hidden">
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl text-fg hover:bg-surface-2 [&::-webkit-details-marker]:hidden" aria-label="Mở menu">
            <MenuIcon />
          </summary>
          <nav aria-label="Danh mục (di động)" className="absolute left-0 top-12 w-64 rounded-2xl border border-line bg-surface p-2 shadow-2xl">
            <Link href="/san-pham" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-surface-2">Tất cả sản phẩm</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/san-pham?danh-muc=${c.slug}`} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-surface-2">
                {c.name}
              </Link>
            ))}
            <Link href="/lien-he" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-surface-2">Liên hệ</Link>
          </nav>
        </details>

        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-bold tracking-tight">
          {site.logo_url ? (
            <Image src={site.logo_url} alt={site.name} width={120} height={36} className="h-9 w-auto object-contain" priority />
          ) : (
            <>
              <span className="grid size-9 place-items-center rounded-xl bg-accent/15 text-accent">
                <CubeIcon />
              </span>
              <span>{site.name}</span>
            </>
          )}
        </Link>

        <nav aria-label="Chính" className="hidden items-center gap-1 text-sm text-muted lg:flex">
          <Link href="/san-pham" className="rounded-lg px-3 py-2 hover:text-fg">Sản phẩm</Link>
          {categories.slice(0, 3).map((c) => (
            <Link key={c.id} href={`/san-pham?danh-muc=${c.slug}`} className="rounded-lg px-3 py-2 hover:text-fg">
              {c.name}
            </Link>
          ))}
          <Link href="/lien-he" className="rounded-lg px-3 py-2 hover:text-fg">Liên hệ</Link>
        </nav>

        <form action="/san-pham" role="search" className="ml-auto hidden flex-1 sm:block md:max-w-xs">
          <label htmlFor="header-search" className="sr-only">Tìm sản phẩm</label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input id="header-search" name="q" type="search" placeholder="Tìm máy in, đồ chơi..." className="input pl-10" />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <Link href="/san-pham" className="flex size-11 items-center justify-center rounded-xl hover:bg-surface-2 sm:hidden" aria-label="Tìm kiếm">
            <SearchIcon />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}

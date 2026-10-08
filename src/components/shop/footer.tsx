import Link from "next/link";
import { getCategories, getSettings } from "@/lib/data";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { POLICY_PAGES } from "./policy-page";

export async function Footer() {
  const [{ site, contact, policies }, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <footer className="mt-24 border-t border-line bg-surface/60">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-xl font-bold">{site.name}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{site.description}</p>
        </div>

        <nav aria-label="Danh mục sản phẩm">
          <h2 className="text-sm font-semibold">Danh mục</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/san-pham?danh-muc=${c.slug}`} className="hover:text-fg">{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">Liên hệ</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {contact.phone && (
              <li className="flex gap-2.5"><PhoneIcon className="mt-0.5 shrink-0" /><a href={`tel:${contact.phone}`} className="hover:text-fg">{contact.phone}</a></li>
            )}
            {contact.email && (
              <li className="flex gap-2.5"><MailIcon className="mt-0.5 shrink-0" /><a href={`mailto:${contact.email}`} className="break-all hover:text-fg">{contact.email}</a></li>
            )}
            {contact.address && <li className="flex gap-2.5"><PinIcon className="mt-0.5 shrink-0" /><span>{contact.address}</span></li>}
            {contact.hours && <li className="flex gap-2.5"><ClockIcon className="mt-0.5 shrink-0" /><span>{contact.hours}</span></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-muted">
          <p>© {site.name}. Bảo lưu mọi quyền.</p>
          <nav aria-label="Chính sách" className="flex flex-wrap gap-x-5 gap-y-2">
            {(Object.keys(POLICY_PAGES) as (keyof typeof POLICY_PAGES)[])
              .filter((k) => policies[k].trim())
              .map((k) => (
                <Link key={k} href={POLICY_PAGES[k].href} className="hover:text-fg">{POLICY_PAGES[k].title}</Link>
              ))}
            <Link href="/lien-he" className="hover:text-fg">Liên hệ</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

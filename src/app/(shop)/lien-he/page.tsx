import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { safeHref } from "@/lib/url";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSettings();
  return {
    title: "Liên hệ",
    description: `Liên hệ ${site.name}: tư vấn máy in 3D, đồ chơi in 3D và in theo yêu cầu.`,
    alternates: { canonical: "/lien-he" },
  };
}

export default async function ContactPage() {
  const { contact, site } = await getSettings();
  const rows = [
    contact.phone && { icon: PhoneIcon, label: "Điện thoại", value: contact.phone, href: `tel:${contact.phone}` },
    contact.zalo && { icon: PhoneIcon, label: "Zalo", value: contact.zalo, href: `https://zalo.me/${contact.zalo.replace(/\D/g, "")}` },
    contact.email && { icon: MailIcon, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.facebook && { icon: MailIcon, label: "Facebook", value: contact.facebook, href: safeHref(contact.facebook, "#") },
    contact.address && { icon: PinIcon, label: "Địa chỉ", value: contact.address },
    contact.hours && { icon: ClockIcon, label: "Giờ mở cửa", value: contact.hours },
  ].filter(Boolean) as { icon: typeof PhoneIcon; label: string; value: string; href?: string }[];

  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Liên hệ", href: "/lien-he" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Liên hệ {site.name}</h1>
      <p className="mt-3 max-w-2xl text-muted">Cần tư vấn chọn máy in, vật liệu hay muốn in mô hình theo yêu cầu? Liên hệ với chúng tôi qua các kênh dưới đây.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ icon: Icon, label, value, href }) => (
          <li key={label} className="card flex gap-4 p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><Icon /></span>
            <div className="min-w-0">
              <p className="text-sm text-muted">{label}</p>
              {href ? (
                <a href={href} className="break-words font-semibold hover:text-accent" {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}>{value}</a>
              ) : (
                <p className="font-semibold">{value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

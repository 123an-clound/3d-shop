import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { safeHref } from "@/lib/url";
import { mapLinks, zaloHref } from "@/lib/contact";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSettings();
  return {
    title: "Liên hệ",
    description: `Liên hệ ${site.name}: tư vấn máy in 3D, đồ chơi in 3D và in theo yêu cầu. Xem địa chỉ, giờ mở cửa và câu hỏi thường gặp.`,
    alternates: { canonical: "/lien-he" },
  };
}

export default async function ContactPage() {
  const { contact, site, faq } = await getSettings();
  const maps = mapLinks(contact);
  const rows = [
    contact.phone && { icon: PhoneIcon, label: "Điện thoại", value: contact.phone, href: `tel:${contact.phone}` },
    contact.zalo && { icon: PhoneIcon, label: "Zalo", value: contact.zalo, href: zaloHref(contact.zalo) },
    contact.email && { icon: MailIcon, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.facebook && { icon: MailIcon, label: "Facebook", value: contact.facebook, href: safeHref(contact.facebook, "#") },
    contact.address && { icon: PinIcon, label: "Địa chỉ", value: contact.address, href: maps?.directions },
    contact.hours && { icon: ClockIcon, label: "Giờ mở cửa", value: contact.hours },
  ].filter(Boolean) as { icon: typeof PhoneIcon; label: string; value: string; href?: string }[];

  return (
    <div className="container-x py-8 md:py-12">
      {faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      )}
      <Breadcrumbs items={[{ name: "Liên hệ", href: "/lien-he" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Liên hệ {site.name}</h1>
      <p className="mt-3 max-w-2xl text-muted">Cần tư vấn chọn máy in, vật liệu hay muốn in mô hình theo yêu cầu? Liên hệ với chúng tôi qua các kênh dưới đây.</p>
      {contact.response_time && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
          <ClockIcon width={16} height={16} /> {contact.response_time}
        </p>
      )}

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

      {maps && (
        <section className="mt-12" aria-labelledby="map-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 id="map-heading" className="font-display text-2xl font-bold">Bản đồ</h2>
            <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="btn-ghost">Chỉ đường bằng Google Maps ↗</a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line">
            <iframe
              src={maps.embed}
              title={`Bản đồ đến ${site.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-80 w-full sm:h-96"
            />
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section className="mt-12 max-w-3xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-display text-2xl font-bold">Câu hỏi thường gặp</h2>
          <div className="mt-4 space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="card group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

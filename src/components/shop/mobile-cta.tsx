import { getSettings } from "@/lib/data";
import { zaloHref } from "@/lib/contact";
import { PhoneIcon } from "@/components/icons";

/** Persistent call/Zalo bar on phones; the spacer keeps it from covering the footer. */
export async function MobileCta() {
  const { contact } = await getSettings();
  if (!contact.phone && !contact.zalo) return null;

  return (
    <>
      <div className="h-16 lg:hidden" aria-hidden />
      <nav
        aria-label="Liên hệ nhanh"
        className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-bg/90 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
      >
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="btn-primary flex-1">
            <PhoneIcon /> Gọi ngay
          </a>
        )}
        {contact.zalo && (
          <a href={zaloHref(contact.zalo)} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1">
            Chat Zalo
          </a>
        )}
      </nav>
    </>
  );
}

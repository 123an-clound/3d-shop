import type { ContactSettings } from "./types";

export const zaloHref = (zalo: string) => `https://zalo.me/${zalo.replace(/\D/g, "")}`;

/** Google Maps embed + directions URLs; precise when lat/lng are set, otherwise geocoded from the address. */
export function mapLinks(contact: ContactSettings) {
  const query = contact.lat && contact.lng ? `${contact.lat},${contact.lng}` : contact.address.trim();
  if (!query) return null;
  const q = encodeURIComponent(query);
  return {
    embed: `https://www.google.com/maps?q=${q}&output=embed`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
  };
}

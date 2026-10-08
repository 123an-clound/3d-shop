import { SUPABASE_URL } from "./supabase/env";

/** Must match images.remotePatterns in next.config.ts, otherwise next/image refuses to render the URL. */
export const ALLOWED_IMAGE_HOSTS = [new URL(SUPABASE_URL).hostname, "upload.wikimedia.org", "thumb.wikimedia.org"];

export function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_IMAGE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

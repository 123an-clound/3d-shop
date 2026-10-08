/** Admin-editable links: allow site-relative paths and http(s) URLs only (blocks javascript:, data:, etc.). */
export function safeHref(href: string | undefined, fallback = "/") {
  const value = (href ?? "").trim();
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

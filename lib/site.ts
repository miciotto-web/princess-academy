export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://princess-academy.it").replace(/\/$/, "");
}

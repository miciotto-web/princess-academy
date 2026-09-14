import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getPrincesses } from "@/lib/queries";

const STATIC = ["", "/storia", "/princess", "/eventi", "/galleria", "/prenota", "/social", "/contatti", "/privacy", "/cookie"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC.map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === "/prenota" ? 0.9 : 0.7,
  }));
  try {
    const princesses = await getPrincesses();
    princesses
      .filter((p) => !p.demo)
      .forEach((p) => {
        entries.push({
          url: `${base}/princess/${p.slug}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      });
  } catch {
    /* fallback: solo route statiche */
  }
  return entries;
}

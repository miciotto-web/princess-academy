import type { Metadata } from "next";
import { PageHero } from "@/components/ui/decor";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { getGallery, getGalleryCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Galleria",
  description: "I ricordi più belli di Princess Academy: feste, spettacoli e sorrisi.",
  alternates: { canonical: "/galleria" },
};

export default async function GalleriaPage() {
  const [items, categorie] = await Promise.all([getGallery(), getGalleryCategories()]);
  return (
    <>
      <PageHero
        eyebrow="Ricordi di luce"
        title={<>La <em className="text-gold-200">galleria</em> incantata</>}
        intro="Masonry grid con filtri, lightbox, fullscreen, zoom e condivisione."
      />
      <section className="section-texture py-14" aria-label="Galleria fotografica">
        <div className="container-royal">
          <GalleryGrid initial={items} categorie={categorie} />
        </div>
      </section>
    </>
  );
}

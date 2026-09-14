import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-royal-sheen pb-24 pt-40 text-center">
      <div className="texture-dots absolute inset-0 opacity-40" aria-hidden />
      <div className="container-royal relative">
        <p className="text-[12px] font-bold uppercase tracking-[0.4em] text-gold-200">✦ Oh, la scarpetta si è persa ✦</p>
        <h1 className="mx-auto mt-4 max-w-xl font-display text-6xl font-bold text-white sm:text-7xl">
          Pagina svanita come magia
        </h1>
        <p className="mx-auto mt-5 max-w-md text-white/80">
          La pagina che cerchi non esiste o è volata via con un soffio di vento fatato.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-gold">
            <Sparkles size={16} /> Torna alla Home
          </Link>
          <Link
            href="/prenota"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-princess-700"
          >
            Prenota <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

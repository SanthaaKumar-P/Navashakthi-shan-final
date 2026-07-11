import type { ReactNode } from "react";
import { SiteNav } from "./layout/site-nav";
import { SiteFooter } from "./layout/site-footer";

export function PublicPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle, image }: { eyebrow?: string; title: string; subtitle?: string; image?: string }) {
  return (
    <section className="relative overflow-hidden bg-mesh-warm">
      {image && (
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      )}
      <div className="container-x relative py-20 md:py-28">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {eyebrow}
          </div>
        )}
        <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {subtitle && <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { TwinViewer } from "@/components/twin/TwinViewer";
import {
  Cuboid,
  Fingerprint,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { products } from "@/lib/mock-data";

function Page() {
  // IMPORTANT:
  // Digital Twin uses the complete master catalogue.
  // Do NOT filter using digitalTwin here.
  const twinProducts = products;

  const [activeId, setActiveId] = useState(
    twinProducts[0]?.id ?? "",
  );

  const active = useMemo(() => {
    return (
      twinProducts.find((product) => product.id === activeId) ??
      twinProducts[0]
    );
  }, [activeId, twinProducts]);

  if (!active) {
    return (
      <PublicPage>
        <PageHero
          eyebrow="Digital Twin Technology"
          title="Every craft, a 3D twin with a soul."
          subtitle="Explore NAVSHAKTHI's digital craft catalogue."
        />

        <section className="container-x py-20">
          <div className="rounded-3xl border border-dashed border-border p-16 text-center">
            <h2 className="font-display text-2xl">
              No crafts available
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Add crafts to the master catalogue to create Digital
              Twin experiences.
            </p>
          </div>
        </section>
      </PublicPage>
    );
  }

  const getTwinNumber = (id: string) => {
    const numericPart = Number(id.replace(/\D/g, "") || 0);
    return 4000 + numericPart;
  };

  const activeTwinNumber = getTwinNumber(active.id);

  return (
    <PublicPage>
      {/* HERO */}
      <PageHero
        eyebrow="Digital Twin Technology"
        title="Every craft, a 3D twin with a soul."
        subtitle="Explore an interactive digital representation of every craft in the NAVSHAKTHI catalogue, with craft details, authenticity information and a unique digital twin identity."
      />

      {/* ACTIVE TWIN */}
      <section className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* VIEWER */}
          <Reveal>
            <TwinViewer
              src={active.image}
              alt={active.name}
              twinId={`0xTW·${active.id.toUpperCase()}·${activeTwinNumber}`}
            />
          </Reveal>

          {/* DETAILS */}
          <Reveal delay={0.1}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                Now viewing
              </div>

              <h2 className="mt-2 font-display text-3xl text-earth">
                {active.name}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {active.artisan} · {active.village},{" "}
                {active.state}
              </p>

              <p className="mt-6 text-sm leading-relaxed text-foreground/80">
                {active.story}
              </p>

              {/* MATERIALS */}
              {active.materials.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {active.materials.map((material) => (
                    <span
                      key={material}
                      className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              )}

              {/* PRIMARY DETAILS */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Authenticity
                  </div>

                  <div className="mt-1 font-display text-2xl text-primary">
                    {active.authenticity}%
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Twin ID
                  </div>

                  <div className="mt-1 break-all font-mono text-xs text-earth">
                    0xTW·{active.id.toUpperCase()}·
                    {activeTwinNumber}
                  </div>
                </div>
              </div>

              {/* VERIFICATION DETAILS */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border/60 bg-card p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Craftmark
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    {active.craftmark
                      ? "Verified"
                      : "Not listed"}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    GI
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    {active.giCertified
                      ? "Certified"
                      : "Not listed"}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Stock
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    {active.inStock}
                  </div>
                </div>
              </div>

              {/* ALL PRODUCT SELECTOR */}
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Select a craft
                  </div>

                  <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {twinProducts.length} crafts
                  </div>
                </div>

                <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto pr-1">
                  {twinProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setActiveId(product.id)}
                      title={product.name}
                      className={`overflow-hidden rounded-xl border-2 transition ${
                        active.id === product.id
                          ? "border-primary"
                          : "border-transparent opacity-65 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="aspect-square w-full object-cover"
                      />

                      <div className="truncate px-1 py-1 text-[9px] text-muted-foreground">
                        {product.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="container-x pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ScanLine,
              title: "Scan",
              desc: "Capture the physical craft through a smartphone-based workflow.",
            },
            {
              icon: Cuboid,
              title: "Render",
              desc: "Create an interactive digital representation that can be explored, zoomed and viewed from different angles.",
            },
            {
              icon: Fingerprint,
              title: "Fingerprint",
              desc: "Associate craft information and visual characteristics with a unique digital identity.",
            },
            {
              icon: ShieldCheck,
              title: "Anchor",
              desc: "Maintain a consistent digital reference for the craft's provenance and authenticity record.",
            },
          ].map((card, index) => {
            const Icon = card.icon;

            return (
              <Reveal
                key={card.title}
                delay={index * 0.05}
              >
                <div className="rounded-3xl border border-border/60 bg-card p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 font-display text-xl">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {card.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ALL 14 PRODUCTS */}
      <section className="bg-mesh-forest text-cream">
        <div className="container-x py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">
                All catalogue craft twins
              </h2>

              <p className="mt-3 max-w-2xl text-cream/70">
                Explore every craft currently available in the
                NAVSHAKTHI demonstration catalogue.
              </p>
            </div>

            {/* VERY CLEAR COUNT */}
            <div className="w-fit rounded-full border border-cream/20 bg-white/10 px-4 py-2 text-sm font-semibold">
              {twinProducts.length} crafts available
            </div>
          </div>

          {/* ALL PRODUCTS — NO SLICE */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {twinProducts.map((product) => {
              const productTwinNumber = getTwinNumber(product.id);

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setActiveId(product.id);

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className={`group overflow-hidden rounded-3xl border text-left backdrop-blur transition hover:-translate-y-1 ${
                    active.id === product.id
                      ? "border-gold bg-white/10"
                      : "border-cream/10 bg-white/5"
                  }`}
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {/* TWIN BADGE */}
                    <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[9px] font-semibold uppercase tracking-widest text-white backdrop-blur">
                      Digital Twin
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    <div className="text-[9px] uppercase tracking-widest text-gold">
                      Twin · 0xTW·
                      {product.id.toUpperCase()}·
                      {productTwinNumber}
                    </div>

                    <div className="mt-2 line-clamp-2 min-h-[3.5rem] font-display text-lg">
                      {product.name}
                    </div>

                    <div className="mt-2 text-xs text-cream/60">
                      {product.artisan} · {product.village}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-cream/10 pt-3 text-xs">
                      <span className="capitalize text-cream/70">
                        {product.category}
                      </span>

                      <span className="font-semibold text-gold">
                        {product.authenticity}% AI
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </PublicPage>
  );
}

export const Route = createFileRoute("/digital-twin")({
  head: () => ({
    meta: [
      {
        title: "Digital Twin — NAVSHAKTHI",
      },
      {
        name: "description",
        content:
          "Interactive digital craft twins and provenance information for the NAVSHAKTHI craft catalogue.",
      },
    ],
  }),
  component: Page,
});